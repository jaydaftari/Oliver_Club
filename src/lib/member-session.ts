import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Member session cookie (`oc_member`). The cookie value is
 * `id:email:expires.<hmac>` signed with SESSION_SECRET — the same scheme the
 * admin session uses, but carrying the member identity. It is httpOnly and
 * stateless: nothing to look up server-side to validate it.
 */

const COOKIE_NAME = "oc_member";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function bufToHex(buf: ArrayBuffer): string {
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
  return bufToHex(sig);
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export type MemberSession = { id: number; email: string };

async function createToken(id: number, email: string): Promise<string> {
  const expires = Date.now() + SESSION_DURATION_MS;
  const payload = `${id}:${email}:${expires}`;
  const sig = await signHmac(payload);
  return `${payload}.${sig}`;
}

async function verifyToken(token: string): Promise<MemberSession | null> {
  const dotIdx = token.lastIndexOf(".");
  if (dotIdx === -1) return null;
  const payload = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  const expected = await signHmac(payload);
  if (!safeEqual(expected, sig)) return null;

  const parts = payload.split(":");
  if (parts.length !== 3) return null;
  const [idStr, email, expiresStr] = parts;
  const expires = Number(expiresStr);
  const id = Number(idStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return null;
  if (!Number.isInteger(id)) return null;
  return { id, email };
}

/** Set the member session cookie. Call from a Server Action / Route Handler. */
export async function startMemberSession(id: number, email: string): Promise<void> {
  const token = await createToken(id, email);
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION_MS / 1000,
    path: "/",
  });
}

export async function endMemberSession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

/** Read & verify the current member session, or null if not signed in. */
export async function getMemberSession(): Promise<MemberSession | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Require a signed-in member; redirect to /login otherwise. */
export async function requireMember(): Promise<MemberSession> {
  const session = await getMemberSession();
  if (!session) redirect("/login");
  return session;
}
