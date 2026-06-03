import { sql } from "./db";

export type Application = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  company_title: string;
  social_medias: string | null;
  source: string | null;
  submitted_at: string;
};

let tableReady = false;

export async function ensureApplicationsTable(): Promise<void> {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS oliver_club_applications (
      id             SERIAL PRIMARY KEY,
      name           TEXT NOT NULL,
      email          TEXT NOT NULL,
      phone          TEXT,
      city           TEXT,
      company_title  TEXT NOT NULL,
      social_medias  TEXT,
      source         TEXT,
      submitted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  tableReady = true;
}

export async function getApplications(): Promise<Application[]> {
  try {
    await ensureApplicationsTable();
    const rows = await sql`
      SELECT * FROM oliver_club_applications ORDER BY submitted_at DESC
    `;
    return rows as Application[];
  } catch {
    return [];
  }
}
