"use server";

import { sql } from "@/lib/db";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

let tableReady = false;
async function ensureSignupsTable() {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS oliver_club_signups (
      id          SERIAL PRIMARY KEY,
      email       TEXT NOT NULL UNIQUE,
      signed_up_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      source      TEXT DEFAULT 'website'
    )
  `;
  tableReady = true;
}

export async function signupEmail(email: string): Promise<{ ok: boolean; message: string }> {
  const trimmed = email.trim().toLowerCase();

  if (!EMAIL_RE.test(trimmed)) {
    return { ok: false, message: "Please enter a valid email address." };
  }

  await ensureSignupsTable();

  try {
    await sql`
      INSERT INTO oliver_club_signups (email)
      VALUES (${trimmed})
    `;
    return { ok: true, message: "Thanks — we'll be in touch soon." };
  } catch (err: unknown) {
    const pg = err as { code?: string };
    if (pg.code === "23505") {
      return { ok: true, message: "You're already on the list!" };
    }
    console.error("signup error", err);
    return { ok: false, message: "Something went wrong. Please try again." };
  }
}
