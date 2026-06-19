import { sql } from "./db";

/**
 * Olivier Club — "Hero Journey" applications.
 *
 * The public application is now collected through the pixel ski-game
 * (see /apply). Each answer maps to a column below. Legacy columns
 * (name / phone / city / company_title / social_medias) are kept nullable
 * so historical rows submitted through the old contact form still render.
 */
export type Application = {
  id: number;
  // Hero Journey answers
  identity: string | null; // "What do you call yourself?"
  conflict: string | null; // "What's your conflict?"
  solution: string | null; // "Your vision of the solution?"
  path: string | null; // "What led you here?"
  leader: string | null; // "How does a person become a leader?"
  teach: string | null; // "What can you teach others?"
  email: string;
  links: string | null; // social links / website
  source: string | null;
  submitted_at: string;
  // Legacy contact-form columns (nullable; present only on old rows)
  name: string | null;
  phone: string | null;
  city: string | null;
  company_title: string | null;
  social_medias: string | null;
};

let tableReady = false;

export async function ensureApplicationsTable(): Promise<void> {
  if (tableReady) return;

  // Fresh installs get the full Hero Journey schema.
  await sql`
    CREATE TABLE IF NOT EXISTS oliver_club_applications (
      id             SERIAL PRIMARY KEY,
      identity       TEXT,
      conflict       TEXT,
      solution       TEXT,
      path           TEXT,
      leader         TEXT,
      teach          TEXT,
      email          TEXT NOT NULL,
      links          TEXT,
      source         TEXT,
      submitted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      name           TEXT,
      phone          TEXT,
      city           TEXT,
      company_title  TEXT,
      social_medias  TEXT
    )
  `;

  // Migrate older installs created with the legacy contact-form schema:
  // add the Hero Journey columns and relax the old NOT NULL constraints.
  await sql`ALTER TABLE oliver_club_applications ADD COLUMN IF NOT EXISTS identity TEXT`;
  await sql`ALTER TABLE oliver_club_applications ADD COLUMN IF NOT EXISTS conflict TEXT`;
  await sql`ALTER TABLE oliver_club_applications ADD COLUMN IF NOT EXISTS solution TEXT`;
  await sql`ALTER TABLE oliver_club_applications ADD COLUMN IF NOT EXISTS path TEXT`;
  await sql`ALTER TABLE oliver_club_applications ADD COLUMN IF NOT EXISTS leader TEXT`;
  await sql`ALTER TABLE oliver_club_applications ADD COLUMN IF NOT EXISTS teach TEXT`;
  await sql`ALTER TABLE oliver_club_applications ADD COLUMN IF NOT EXISTS links TEXT`;
  await sql`ALTER TABLE oliver_club_applications ALTER COLUMN name DROP NOT NULL`;
  await sql`ALTER TABLE oliver_club_applications ALTER COLUMN company_title DROP NOT NULL`;

  tableReady = true;
}

export async function countApplications(): Promise<number> {
  try {
    await ensureApplicationsTable();
    const rows = await sql`SELECT COUNT(*)::int AS total FROM oliver_club_applications`;
    return (rows[0] as { total: number })?.total ?? 0;
  } catch {
    return 0;
  }
}

export type ApplicationsPage = {
  rows: Application[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

/**
 * Server-side paginated fetch. `page` is 1-based.
 */
export async function getApplications(page = 1, pageSize = 25): Promise<ApplicationsPage> {
  const safeSize = Math.min(Math.max(1, Math.floor(pageSize)), 100);

  try {
    await ensureApplicationsTable();

    const countRows = await sql`SELECT COUNT(*)::int AS total FROM oliver_club_applications`;
    const total = (countRows[0] as { total: number })?.total ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / safeSize));
    const safePage = Math.min(Math.max(1, Math.floor(page)), pageCount);
    const offset = (safePage - 1) * safeSize;

    const rows = await sql`
      SELECT * FROM oliver_club_applications
      ORDER BY submitted_at DESC
      LIMIT ${safeSize} OFFSET ${offset}
    `;

    return {
      rows: rows as Application[],
      total,
      page: safePage,
      pageSize: safeSize,
      pageCount,
    };
  } catch {
    return { rows: [], total: 0, page: 1, pageSize: safeSize, pageCount: 1 };
  }
}
