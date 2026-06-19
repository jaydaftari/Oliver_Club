import { sql } from "./db";

export type Signup = {
  id: number;
  email: string;
  signed_up_at: string;
  source: string | null;
};

export async function getSignups(): Promise<Signup[]> {
  try {
    const rows = await sql`
      SELECT * FROM oliver_club_signups ORDER BY signed_up_at DESC
    `;
    return rows as Signup[];
  } catch {
    return [];
  }
}

export type SignupsPage = {
  rows: Signup[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

/** Server-side paginated signups. `page` is 1-based. */
export async function getSignupsPage(page = 1, pageSize = 20): Promise<SignupsPage> {
  const safeSize = Math.min(Math.max(1, Math.floor(pageSize)), 100);
  try {
    const countRows = await sql`SELECT COUNT(*)::int AS total FROM oliver_club_signups`;
    const total = (countRows[0] as { total: number })?.total ?? 0;
    const pageCount = Math.max(1, Math.ceil(total / safeSize));
    const safePage = Math.min(Math.max(1, Math.floor(page)), pageCount);
    const offset = (safePage - 1) * safeSize;
    const rows = await sql`
      SELECT * FROM oliver_club_signups
      ORDER BY signed_up_at DESC
      LIMIT ${safeSize} OFFSET ${offset}
    `;
    return { rows: rows as Signup[], total, page: safePage, pageSize: safeSize, pageCount };
  } catch {
    return { rows: [], total: 0, page: 1, pageSize: safeSize, pageCount: 1 };
  }
}

export async function countSignups(): Promise<number> {
  try {
    const rows = await sql`SELECT COUNT(*)::int AS total FROM oliver_club_signups`;
    return (rows[0] as { total: number })?.total ?? 0;
  } catch {
    return 0;
  }
}
