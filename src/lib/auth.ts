import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "./db";

function arrayBufferToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function signHmac(message: string): Promise<string> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET env var is required");
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return arrayBufferToHex(sig);
}

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export async function createSession(): Promise<string> {
  const expires = Date.now() + SESSION_DURATION_MS;
  const sig = await signHmac(String(expires));
  return `${expires}.${sig}`;
}

export async function verifySession(token: string): Promise<boolean> {
  const dotIdx = token.indexOf(".");
  if (dotIdx === -1) return false;
  const expiresStr = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  const expires = Number(expiresStr);
  if (isNaN(expires) || Date.now() > expires) return false;
  const expected = await signHmac(expiresStr);
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  }
  return diff === 0;
}

/** True if the current request carries a valid admin session cookie. */
export async function isAdminAuthed(): Promise<boolean> {
  const token = (await cookies()).get("oc_admin")?.value;
  if (!token) return false;
  return verifySession(token);
}

/**
 * Guard for admin-only pages and server actions. Redirects to the admin login
 * when the session is missing or expired. Call at the top of any admin route
 * handler or mutating server action.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthed())) redirect("/admin");
}

async function ensureRateLimitTable(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS oc_login_attempts (
      id           SERIAL PRIMARY KEY,
      ip           TEXT NOT NULL,
      attempted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Older installs predate per-action buckets; backfill the column.
  await sql`ALTER TABLE oc_login_attempts ADD COLUMN IF NOT EXISTS action TEXT NOT NULL DEFAULT 'login'`;
}

const RATE_LIMIT_WINDOW_MIN = 15;
const RATE_LIMIT_MAX = 10;

async function clientIp(): Promise<string> {
  const hdrs = await headers();
  return hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ?? hdrs.get("x-real-ip") ?? "unknown";
}

/**
 * Sliding-window rate limit keyed by IP + action. `action` lets callers keep
 * separate buckets (login / signup / reset) so one flow can't exhaust another.
 */
export async function checkLoginRateLimit(
  action = "login",
  max = RATE_LIMIT_MAX
): Promise<{ allowed: boolean; remaining: number }> {
  await ensureRateLimitTable();
  const ip = await clientIp();
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MIN * 60 * 1000).toISOString();
  const rows = await sql`
    SELECT COUNT(*)::int AS cnt FROM oc_login_attempts
    WHERE ip = ${ip} AND action = ${action} AND attempted_at > ${windowStart}
  `;
  const cnt = (rows[0] as { cnt: number }).cnt;
  return { allowed: cnt < max, remaining: Math.max(0, max - cnt) };
}

export async function recordLoginAttempt(action = "login"): Promise<void> {
  await ensureRateLimitTable();
  const ip = await clientIp();
  await sql`INSERT INTO oc_login_attempts (ip, action) VALUES (${ip}, ${action})`;
}

export function verifyCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD env vars are required");
  }
  return email === adminEmail && password === adminPassword;
}
