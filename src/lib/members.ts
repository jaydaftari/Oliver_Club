import { sql } from "./db";

/**
 * Olivier Club — approved members.
 *
 * Membership is invite-only: an admin adds an email, then approves it. On
 * approval a one-time *setup token* is generated; the admin sends the member a
 * link (`/reset-password?token=…`) where the member chooses their own password.
 * Passwords are never emailed — only high-entropy, expiring links are.
 *
 * Lifecycle (status):
 *   pending   — added by admin, cannot log in yet
 *   active    — approved; can log in once a password is set
 *   suspended — access revoked, cannot log in
 */
export type MemberStatus = "pending" | "active" | "suspended";

export type Member = {
  id: number;
  email: string;
  name: string | null;
  status: MemberStatus;
  has_password: boolean; // derived; never expose the hash
  title: string | null;
  location: string | null;
  founding: boolean;
  token_expires: string | null;
  reset_requested_at: string | null;
  last_login_at: string | null;
  approved_at: string | null;
  created_at: string;
};

/** A member's profile as rendered on the dashboard hero. */
export type MemberProfile = {
  id: number;
  email: string;
  name: string | null;
  title: string | null;
  location: string | null;
  founding: boolean;
  member_since: number | null; // year they were approved
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // setup / reset links valid 7 days

let tableReady = false;

export async function ensureMembersTable(): Promise<void> {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS oliver_club_members (
      id                  SERIAL PRIMARY KEY,
      email               TEXT NOT NULL UNIQUE,
      name                TEXT,
      status              TEXT NOT NULL DEFAULT 'pending',
      password_hash       TEXT,
      password_salt       TEXT,
      setup_token         TEXT,
      setup_token_expires TIMESTAMPTZ,
      reset_requested_at  TIMESTAMPTZ,
      last_login_at       TIMESTAMPTZ,
      approved_at         TIMESTAMPTZ,
      title               TEXT,
      location            TEXT,
      founding            BOOLEAN NOT NULL DEFAULT false,
      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Backfill profile columns for installs created before they existed.
  await sql`ALTER TABLE oliver_club_members ADD COLUMN IF NOT EXISTS title TEXT`;
  await sql`ALTER TABLE oliver_club_members ADD COLUMN IF NOT EXISTS location TEXT`;
  await sql`ALTER TABLE oliver_club_members ADD COLUMN IF NOT EXISTS founding BOOLEAN NOT NULL DEFAULT false`;
  tableReady = true;
}

/* ────────────────────────────  crypto  ──────────────────────────── */

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const PBKDF2_ITERATIONS = 100_000;

/** Derive a PBKDF2-SHA256 hash for a password + salt (Edge/WebCrypto safe). */
export async function hashPassword(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const salt = Uint8Array.from(saltHex.match(/.{2}/g)!.map((h) => parseInt(h, 16)));
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return bufToHex(bits);
}

/** Constant-time-ish string compare. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* ────────────────────────────  reads  ──────────────────────────── */

export async function getMembers(): Promise<Member[]> {
  await ensureMembersTable();
  try {
    const rows = await sql`
      SELECT id, email, name, status,
             (password_hash IS NOT NULL) AS has_password,
             title, location, founding,
             setup_token_expires AS token_expires,
             reset_requested_at, last_login_at, approved_at, created_at
      FROM oliver_club_members
      ORDER BY created_at DESC
    `;
    return rows as Member[];
  } catch {
    return [];
  }
}

export async function countMembers(): Promise<number> {
  await ensureMembersTable();
  try {
    const rows = await sql`SELECT COUNT(*)::int AS total FROM oliver_club_members`;
    return (rows[0] as { total: number })?.total ?? 0;
  } catch {
    return 0;
  }
}

export async function getMemberById(id: number): Promise<Member | null> {
  await ensureMembersTable();
  const rows = await sql`
    SELECT id, email, name, status,
           (password_hash IS NOT NULL) AS has_password,
           title, location, founding,
           setup_token_expires AS token_expires,
           reset_requested_at, last_login_at, approved_at, created_at
    FROM oliver_club_members WHERE id = ${id}
  `;
  return (rows[0] as Member) ?? null;
}

/** Profile fields for the dashboard hero, with member-since derived from approval. */
export async function getMemberProfile(id: number): Promise<MemberProfile | null> {
  await ensureMembersTable();
  const rows = await sql`
    SELECT id, email, name, title, location, founding,
           EXTRACT(YEAR FROM COALESCE(approved_at, created_at))::int AS member_since
    FROM oliver_club_members WHERE id = ${id}
  `;
  return (rows[0] as MemberProfile) ?? null;
}

/** Member edits their own display name, title and location. */
export async function updateMemberProfile(
  id: number,
  data: { name: string; title: string; location: string }
): Promise<void> {
  await ensureMembersTable();
  await sql`
    UPDATE oliver_club_members
    SET name = ${data.name.trim() || null},
        title = ${data.title.trim() || null},
        location = ${data.location.trim() || null}
    WHERE id = ${id}
  `;
}

/** Admin toggles a member's founding-member badge. */
export async function setFounding(id: number, founding: boolean): Promise<void> {
  await ensureMembersTable();
  await sql`UPDATE oliver_club_members SET founding = ${founding} WHERE id = ${id}`;
}

/* ────────────────────────────  admin ops  ──────────────────────────── */

export type AddResult = { ok: true; id: number } | { ok: false; error: string };

export async function addMember(emailRaw: string, name?: string): Promise<AddResult> {
  await ensureMembersTable();
  const email = emailRaw.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return { ok: false, error: "Enter a valid email address." };
  try {
    const rows = await sql`
      INSERT INTO oliver_club_members (email, name, status)
      VALUES (${email}, ${name?.trim() || null}, 'pending')
      RETURNING id
    `;
    return { ok: true, id: (rows[0] as { id: number }).id };
  } catch (err: unknown) {
    if ((err as { code?: string }).code === "23505") {
      return { ok: false, error: "That email is already a member." };
    }
    return { ok: false, error: "Could not add member. Try again." };
  }
}

/** Approve a member and mint a one-time setup link token. Returns the raw token. */
export async function approveMember(id: number): Promise<string | null> {
  await ensureMembersTable();
  const token = randomHex(32);
  const expires = new Date(Date.now() + TOKEN_TTL_MS).toISOString();
  const rows = await sql`
    UPDATE oliver_club_members
    SET status = 'active',
        approved_at = COALESCE(approved_at, NOW()),
        setup_token = ${token},
        setup_token_expires = ${expires},
        reset_requested_at = NULL
    WHERE id = ${id}
    RETURNING id
  `;
  return rows.length ? token : null;
}

/** Mint a fresh setup/reset token for an existing member (e.g. admin-initiated reset). */
export async function regenerateToken(id: number): Promise<string | null> {
  await ensureMembersTable();
  const token = randomHex(32);
  const expires = new Date(Date.now() + TOKEN_TTL_MS).toISOString();
  const rows = await sql`
    UPDATE oliver_club_members
    SET setup_token = ${token},
        setup_token_expires = ${expires},
        reset_requested_at = NULL
    WHERE id = ${id} AND status != 'suspended'
    RETURNING id
  `;
  return rows.length ? token : null;
}

export async function setMemberStatus(id: number, status: MemberStatus): Promise<void> {
  await ensureMembersTable();
  await sql`UPDATE oliver_club_members SET status = ${status} WHERE id = ${id}`;
}

export async function deleteMember(id: number): Promise<void> {
  await ensureMembersTable();
  await sql`DELETE FROM oliver_club_members WHERE id = ${id}`;
}

/* ────────────────────────────  token / password  ──────────────────────────── */

export type TokenMember = { id: number; email: string };

/** Validate a setup/reset token; returns the member it belongs to, or null. */
export async function getMemberByToken(token: string): Promise<TokenMember | null> {
  await ensureMembersTable();
  if (!token || token.length < 16) return null;
  const rows = await sql`
    SELECT id, email FROM oliver_club_members
    WHERE setup_token = ${token}
      AND setup_token_expires IS NOT NULL
      AND setup_token_expires > NOW()
      AND status = 'active'
  `;
  return (rows[0] as TokenMember) ?? null;
}

/** Consume a token and set a new password. */
export async function setPasswordFromToken(
  token: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  await ensureMembersTable();
  if (!token || token.length < 16)
    return { ok: false, error: "This link is invalid or has expired." };
  if (newPassword.length < 8)
    return { ok: false, error: "Password must be at least 8 characters." };
  const salt = randomHex(16);
  const hash = await hashPassword(newPassword, salt);
  // Validate and consume the token in a single statement: once it matches, the
  // UPDATE nulls it out, so a concurrent request can't reuse the same token.
  const rows = await sql`
    UPDATE oliver_club_members
    SET password_hash = ${hash},
        password_salt = ${salt},
        setup_token = NULL,
        setup_token_expires = NULL,
        reset_requested_at = NULL
    WHERE setup_token = ${token}
      AND setup_token_expires IS NOT NULL
      AND setup_token_expires > NOW()
      AND status = 'active'
    RETURNING id
  `;
  if (!rows.length) return { ok: false, error: "This link is invalid or has expired." };
  return { ok: true };
}

/** Change password for a logged-in member (requires the current password). */
export async function changePassword(
  memberId: number,
  currentPassword: string,
  newPassword: string
): Promise<{ ok: boolean; error?: string }> {
  await ensureMembersTable();
  if (newPassword.length < 8)
    return { ok: false, error: "New password must be at least 8 characters." };
  const rows = await sql`
    SELECT password_hash, password_salt FROM oliver_club_members
    WHERE id = ${memberId} AND status = 'active'
  `;
  const row = rows[0] as { password_hash: string | null; password_salt: string | null } | undefined;
  if (!row?.password_hash || !row.password_salt) {
    return { ok: false, error: "No password set for this account." };
  }
  const attempt = await hashPassword(currentPassword, row.password_salt);
  if (!safeEqual(attempt, row.password_hash)) {
    return { ok: false, error: "Current password is incorrect." };
  }
  const salt = randomHex(16);
  const hash = await hashPassword(newPassword, salt);
  await sql`
    UPDATE oliver_club_members
    SET password_hash = ${hash}, password_salt = ${salt}
    WHERE id = ${memberId}
  `;
  return { ok: true };
}

/* ────────────────────────────  auth  ──────────────────────────── */

export type AuthedMember = { id: number; email: string; name: string | null };

/** Verify member login credentials. Returns the member on success, else null. */
export async function verifyMemberLogin(
  emailRaw: string,
  password: string
): Promise<AuthedMember | null> {
  await ensureMembersTable();
  const email = emailRaw.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return null;
  const rows = await sql`
    SELECT id, email, name, password_hash, password_salt
    FROM oliver_club_members
    WHERE email = ${email} AND status = 'active'
  `;
  const row = rows[0] as
    | {
        id: number;
        email: string;
        name: string | null;
        password_hash: string | null;
        password_salt: string | null;
      }
    | undefined;
  if (!row?.password_hash || !row.password_salt) return null;
  const attempt = await hashPassword(password, row.password_salt);
  if (!safeEqual(attempt, row.password_hash)) return null;
  return { id: row.id, email: row.email, name: row.name };
}

export async function recordMemberLogin(id: number): Promise<void> {
  await sql`UPDATE oliver_club_members SET last_login_at = NOW() WHERE id = ${id}`;
}

/** Flag a forgot-password request (admin relays the reset link, no email service needed). */
export async function requestPasswordReset(emailRaw: string): Promise<void> {
  await ensureMembersTable();
  const email = emailRaw.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) return;
  // Always silent — never reveal whether the email is a member.
  await sql`
    UPDATE oliver_club_members
    SET reset_requested_at = NOW()
    WHERE email = ${email} AND status = 'active'
  `;
}
