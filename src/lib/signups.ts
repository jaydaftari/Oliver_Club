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
