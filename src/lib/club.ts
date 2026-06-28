import { sql } from "./db";
import { CATEGORY_LABELS, normalizeCategory, type EventCategory } from "./club-constants";

/**
 * Club data behind the member dashboard: events + RSVPs, member-to-member
 * connections, and a lightweight activity feed. All tables are created lazily
 * by ensureClubTables() so there is no separate migration step.
 *
 * Pure constants (CATEGORY_LABELS, EventCategory, normalizeCategory) live in
 * ./club-constants so client components can use them without bundling ./db.
 */

// Re-exported for existing server-side imports from "@/lib/club".
export { CATEGORY_LABELS, normalizeCategory };
export type { EventCategory };

export type ClubEvent = {
  id: number;
  title: string;
  category: EventCategory;
  starts_at: string;
  location: string;
  description: string;
  created_at: string;
};

export type Workshop = {
  id: number;
  title: string;
  vimeo_url: string;
  description: string;
  position: number;
  /** Key-point start, in seconds. Playback begins here by default (0 = video start). */
  start_seconds: number;
  /** Key-point end, in seconds, or null for "play to the end of the video". */
  end_seconds: number | null;
  created_at: string;
};

/** Event as shown to a member: includes the going count and their RSVP state. */
export type MemberEvent = ClubEvent & { going: number; rsvped: boolean };

/** Event as listed in the admin panel: includes whether it has already passed. */
export type AdminEvent = ClubEvent & { past: boolean };

export type AttendedStats = {
  pitch: number;
  workshop: number;
  strategic: number;
  total: number;
};

export type Person = { id: number; name: string; role: string; initials: string };

export type ActivityItem = {
  id: number;
  actor: string;
  text: string;
  created_at: string;
  initials: string;
  when: string; // pre-formatted relative time (e.g. "2h ago")
};

let tablesReady = false;

export async function ensureClubTables(): Promise<void> {
  if (tablesReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS oliver_club_events (
      id          SERIAL PRIMARY KEY,
      title       TEXT NOT NULL,
      category    TEXT NOT NULL DEFAULT 'other',
      starts_at   TIMESTAMPTZ NOT NULL,
      location    TEXT NOT NULL DEFAULT '',
      description TEXT NOT NULL DEFAULT '',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS oliver_club_rsvps (
      member_id  INTEGER NOT NULL REFERENCES oliver_club_members(id) ON DELETE CASCADE,
      event_id   INTEGER NOT NULL REFERENCES oliver_club_events(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (member_id, event_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS oliver_club_connections (
      member_id  INTEGER NOT NULL REFERENCES oliver_club_members(id) ON DELETE CASCADE,
      other_id   INTEGER NOT NULL REFERENCES oliver_club_members(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (member_id, other_id)
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS oliver_club_activity (
      id         SERIAL PRIMARY KEY,
      actor      TEXT NOT NULL DEFAULT 'Olivier Club',
      text       TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  tablesReady = true;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const a = parts[0]?.[0] ?? "?";
  const b = parts[1]?.[0] ?? "";
  return (a + b).toUpperCase();
}

/* ────────────────────────────  workshops (videos)  ──────────────────────────── */

// Seeded once, on first table creation. Admin CRUD takes over from there.
const DEFAULT_WORKSHOP_URLS = [
  "https://vimeo.com/1205089464?share=copy&fl=sv&fe=ci",
  "https://vimeo.com/1205093944?share=copy&fl=sv&fe=ci",
  "https://vimeo.com/1205095106?share=copy&fl=sv&fe=ci",
  "https://vimeo.com/1205103085?share=copy&fl=sv&fe=ci",
  "https://vimeo.com/1205107284?share=copy&fl=sv&fe=ci",
];

let workshopsReady = false;

export async function ensureWorkshopsTable(): Promise<void> {
  if (workshopsReady) return;
  const reg = await sql`SELECT to_regclass('public.oliver_club_workshops') AS t`;
  const existed = !!(reg[0] as { t: string | null })?.t;
  await sql`
    CREATE TABLE IF NOT EXISTS oliver_club_workshops (
      id            SERIAL PRIMARY KEY,
      title         TEXT NOT NULL DEFAULT '',
      vimeo_url     TEXT NOT NULL,
      description   TEXT NOT NULL DEFAULT '',
      position      INTEGER NOT NULL DEFAULT 0,
      start_seconds INTEGER NOT NULL DEFAULT 0,
      end_seconds   INTEGER,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  // Migrate tables created before key-points existed.
  await sql`ALTER TABLE oliver_club_workshops ADD COLUMN IF NOT EXISTS start_seconds INTEGER NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE oliver_club_workshops ADD COLUMN IF NOT EXISTS end_seconds INTEGER`;
  if (!existed) {
    for (let i = 0; i < DEFAULT_WORKSHOP_URLS.length; i++) {
      await sql`
        INSERT INTO oliver_club_workshops (title, vimeo_url, position)
        VALUES (${`Workshop ${i + 1}`}, ${DEFAULT_WORKSHOP_URLS[i]}, ${i + 1})
      `;
    }
  }
  workshopsReady = true;
}

export async function getWorkshops(): Promise<Workshop[]> {
  await ensureWorkshopsTable();
  try {
    const rows = await sql`SELECT * FROM oliver_club_workshops ORDER BY position ASC, id ASC`;
    return rows as Workshop[];
  } catch {
    return [];
  }
}

export async function countWorkshops(): Promise<number> {
  await ensureWorkshopsTable();
  try {
    const rows = await sql`SELECT COUNT(*)::int AS total FROM oliver_club_workshops`;
    return (rows[0] as { total: number })?.total ?? 0;
  } catch {
    return 0;
  }
}

export async function createWorkshop(data: {
  title: string;
  vimeo_url: string;
  description: string;
  start_seconds: number;
  end_seconds: number | null;
}): Promise<void> {
  await ensureWorkshopsTable();
  const maxRows = await sql`SELECT COALESCE(MAX(position), 0) AS m FROM oliver_club_workshops`;
  const position = ((maxRows[0] as { m: number })?.m ?? 0) + 1;
  await sql`
    INSERT INTO oliver_club_workshops
      (title, vimeo_url, description, position, start_seconds, end_seconds)
    VALUES
      (${data.title}, ${data.vimeo_url}, ${data.description}, ${position},
       ${data.start_seconds}, ${data.end_seconds})
  `;
}

export async function updateWorkshop(
  id: number,
  data: {
    title: string;
    vimeo_url: string;
    description: string;
    start_seconds: number;
    end_seconds: number | null;
  }
): Promise<void> {
  await ensureWorkshopsTable();
  await sql`
    UPDATE oliver_club_workshops SET
      title = ${data.title},
      vimeo_url = ${data.vimeo_url},
      description = ${data.description},
      start_seconds = ${data.start_seconds},
      end_seconds = ${data.end_seconds}
    WHERE id = ${id}
  `;
}

export async function deleteWorkshop(id: number): Promise<void> {
  await ensureWorkshopsTable();
  await sql`DELETE FROM oliver_club_workshops WHERE id = ${id}`;
}

/* ────────────────────────────  events (admin)  ──────────────────────────── */

export async function getEvents(): Promise<AdminEvent[]> {
  await ensureClubTables();
  try {
    const rows = await sql`
      SELECT *, (starts_at < NOW()) AS past
      FROM oliver_club_events
      ORDER BY starts_at DESC
    `;
    return rows as AdminEvent[];
  } catch {
    return [];
  }
}

export async function countEvents(): Promise<number> {
  await ensureClubTables();
  try {
    const rows = await sql`SELECT COUNT(*)::int AS total FROM oliver_club_events`;
    return (rows[0] as { total: number })?.total ?? 0;
  } catch {
    return 0;
  }
}

export async function createEvent(data: {
  title: string;
  category: EventCategory;
  starts_at: string;
  location: string;
  description: string;
}): Promise<void> {
  await ensureClubTables();
  await sql`
    INSERT INTO oliver_club_events (title, category, starts_at, location, description)
    VALUES (${data.title}, ${data.category}, ${data.starts_at}, ${data.location}, ${data.description})
  `;
}

export async function updateEvent(
  id: number,
  data: {
    title: string;
    category: EventCategory;
    starts_at: string;
    location: string;
    description: string;
  }
): Promise<void> {
  await ensureClubTables();
  await sql`
    UPDATE oliver_club_events SET
      title = ${data.title},
      category = ${data.category},
      starts_at = ${data.starts_at},
      location = ${data.location},
      description = ${data.description}
    WHERE id = ${id}
  `;
}

export async function deleteEvent(id: number): Promise<void> {
  await ensureClubTables();
  await sql`DELETE FROM oliver_club_events WHERE id = ${id}`;
}

/* ────────────────────────────  events (member)  ──────────────────────────── */

/** Upcoming events with going-counts and whether this member has RSVP'd. */
export async function getUpcomingEventsForMember(
  memberId: number,
  limit = 6
): Promise<MemberEvent[]> {
  await ensureClubTables();
  try {
    const rows = await sql`
      SELECT e.*,
             (SELECT COUNT(*)::int FROM oliver_club_rsvps r WHERE r.event_id = e.id) AS going,
             EXISTS (
               SELECT 1 FROM oliver_club_rsvps r2
               WHERE r2.event_id = e.id AND r2.member_id = ${memberId}
             ) AS rsvped
      FROM oliver_club_events e
      WHERE e.starts_at >= NOW()
      ORDER BY e.starts_at ASC
      LIMIT ${limit}
    `;
    return rows as MemberEvent[];
  } catch {
    return [];
  }
}

/** Count of past events this member attended (RSVP'd), grouped into the dashboard cards. */
export async function getAttendedStats(memberId: number): Promise<AttendedStats> {
  await ensureClubTables();
  const empty: AttendedStats = { pitch: 0, workshop: 0, strategic: 0, total: 0 };
  try {
    const rows = await sql`
      SELECT e.category, COUNT(*)::int AS n
      FROM oliver_club_rsvps r
      JOIN oliver_club_events e ON e.id = r.event_id
      WHERE r.member_id = ${memberId} AND e.starts_at < NOW()
      GROUP BY e.category
    `;
    const stats = { ...empty };
    for (const row of rows as { category: string; n: number }[]) {
      if (row.category === "pitch") stats.pitch = row.n;
      else if (row.category === "workshop") stats.workshop = row.n;
      else if (row.category === "strategic") stats.strategic = row.n;
      stats.total += row.n;
    }
    return stats;
  } catch {
    return empty;
  }
}

/** Toggle a member's RSVP for an event. Returns the resulting state. */
export async function toggleRsvp(memberId: number, eventId: number): Promise<boolean> {
  await ensureClubTables();
  const existing = await sql`
    SELECT 1 FROM oliver_club_rsvps WHERE member_id = ${memberId} AND event_id = ${eventId}
  `;
  if (existing.length) {
    await sql`DELETE FROM oliver_club_rsvps WHERE member_id = ${memberId} AND event_id = ${eventId}`;
    return false;
  }
  await sql`
    INSERT INTO oliver_club_rsvps (member_id, event_id)
    VALUES (${memberId}, ${eventId})
    ON CONFLICT DO NOTHING
  `;
  const ev = await sql`SELECT title FROM oliver_club_events WHERE id = ${eventId}`;
  const title = (ev[0] as { title: string } | undefined)?.title;
  const who = await sql`SELECT name, email FROM oliver_club_members WHERE id = ${memberId}`;
  const m = who[0] as { name: string | null; email: string } | undefined;
  if (title && m) {
    const actor = m.name?.trim() || m.email.split("@")[0];
    await logActivity(actor, `RSVP'd to ${title}`);
  }
  return true;
}

/* ────────────────────────────  connections  ──────────────────────────── */

export async function getConnectionCount(memberId: number): Promise<number> {
  await ensureClubTables();
  try {
    const rows =
      await sql`SELECT COUNT(*)::int AS n FROM oliver_club_connections WHERE member_id = ${memberId}`;
    return (rows[0] as { n: number })?.n ?? 0;
  } catch {
    return 0;
  }
}

/** Connections added in the last 30 days (for the "+N new" badge). */
export async function getRecentConnectionCount(memberId: number): Promise<number> {
  await ensureClubTables();
  try {
    const rows = await sql`
      SELECT COUNT(*)::int AS n FROM oliver_club_connections
      WHERE member_id = ${memberId} AND created_at > NOW() - INTERVAL '30 days'
    `;
    return (rows[0] as { n: number })?.n ?? 0;
  } catch {
    return 0;
  }
}

function toPerson(row: {
  id: number;
  name: string | null;
  email: string;
  title: string | null;
}): Person {
  const name = row.name?.trim() || row.email.split("@")[0].replace(/[._-]+/g, " ");
  return {
    id: row.id,
    name,
    role: row.title?.trim() || "Olivier Club member",
    initials: initials(name),
  };
}

/** A few of the member's existing connections (for the avatar stack). */
export async function getConnections(memberId: number, limit = 5): Promise<Person[]> {
  await ensureClubTables();
  try {
    const rows = await sql`
      SELECT m.id, m.name, m.email, m.title
      FROM oliver_club_connections c
      JOIN oliver_club_members m ON m.id = c.other_id
      WHERE c.member_id = ${memberId} AND m.status = 'active'
      ORDER BY c.created_at DESC
      LIMIT ${limit}
    `;
    return (rows as Parameters<typeof toPerson>[0][]).map(toPerson);
  } catch {
    return [];
  }
}

/** Active members the viewer is not yet connected to. */
export async function getPeopleToMeet(memberId: number, limit = 2): Promise<Person[]> {
  await ensureClubTables();
  try {
    const rows = await sql`
      SELECT m.id, m.name, m.email, m.title
      FROM oliver_club_members m
      WHERE m.status = 'active'
        AND m.id != ${memberId}
        AND NOT EXISTS (
          SELECT 1 FROM oliver_club_connections c
          WHERE c.member_id = ${memberId} AND c.other_id = m.id
        )
      ORDER BY m.approved_at DESC NULLS LAST, m.created_at DESC
      LIMIT ${limit}
    `;
    return (rows as Parameters<typeof toPerson>[0][]).map(toPerson);
  } catch {
    return [];
  }
}

/** Create a mutual connection between two members. */
export async function addConnection(memberId: number, otherId: number): Promise<void> {
  await ensureClubTables();
  if (memberId === otherId) return;
  await sql`
    INSERT INTO oliver_club_connections (member_id, other_id) VALUES (${memberId}, ${otherId})
    ON CONFLICT DO NOTHING
  `;
  await sql`
    INSERT INTO oliver_club_connections (member_id, other_id) VALUES (${otherId}, ${memberId})
    ON CONFLICT DO NOTHING
  `;
}

/* ────────────────────────────  activity  ──────────────────────────── */

export async function logActivity(actor: string, text: string): Promise<void> {
  await ensureClubTables();
  try {
    await sql`INSERT INTO oliver_club_activity (actor, text) VALUES (${actor}, ${text})`;
  } catch {
    /* non-critical */
  }
}

export async function getActivity(limit = 4): Promise<ActivityItem[]> {
  await ensureClubTables();
  try {
    const rows = await sql`
      SELECT id, actor, text, created_at FROM oliver_club_activity
      ORDER BY created_at DESC LIMIT ${limit}
    `;
    return (rows as Omit<ActivityItem, "initials" | "when">[]).map((r) => ({
      ...r,
      initials: initials(r.actor),
      when: relativeTime(r.created_at),
    }));
  } catch {
    return [];
  }
}

/** Human "2h ago" style relative time. */
export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  return `${w}w ago`;
}
