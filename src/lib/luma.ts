/**
 * Olivier Club's public Luma calendar (https://luma.com/olivierclub).
 *
 * Upcoming events are pulled live from Luma's public calendar API and cached for
 * a few minutes. RSVPs happen on Luma itself, so each event links out. Events
 * carry a `city` so the dashboard can recommend nearby ones (matched against the
 * member's profile location) and let members filter by city.
 */

const CALENDAR_API_ID = "cal-IbggcvDR28EgQN0";
const REVALIDATE_SECONDS = 600; // refresh the calendar at most every 10 minutes
const POOL_LIMIT = 50; // fetch a generous window once, then slice/filter in memory

export type LumaEvent = {
  id: string;
  name: string;
  start_at: string;
  end_at: string | null;
  url: string; // public event page (https://luma.com/<slug>)
  cover_url: string | null;
  location: string; // display, e.g. "Lisbon" / "San Francisco, CA" / "Online"
  city: string; // normalized for filtering, e.g. "Lisbon" / "San Francisco" / "Online"
};

type LumaEntry = {
  event?: {
    api_id?: string;
    name?: string;
    start_at?: string;
    end_at?: string | null;
    url?: string;
    cover_url?: string | null;
    location_type?: string;
    geo_address_info?: {
      city?: string;
      city_state?: string;
      short_address?: string;
      full_address?: string;
    } | null;
  };
};

type Ev = NonNullable<LumaEntry["event"]>;

function displayLocation(ev: Ev): string {
  if (ev.location_type === "online") return "Online";
  const geo = ev.geo_address_info;
  return geo?.city_state || geo?.short_address || geo?.full_address || "";
}

function cityOf(ev: Ev): string {
  if (ev.location_type === "online") return "Online";
  const geo = ev.geo_address_info;
  return geo?.city || geo?.city_state || "";
}

/** Fetch the upcoming-events window from Luma (cached). */
async function fetchPool(): Promise<LumaEvent[]> {
  const url =
    `https://api.lu.ma/calendar/get-items?calendar_api_id=${CALENDAR_API_ID}` +
    `&period=future&pagination_limit=${POOL_LIMIT}`;
  try {
    const res = await fetch(url, {
      headers: { accept: "application/json", "user-agent": "OlivierClub/1.0" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { entries?: LumaEntry[] };
    return (data.entries ?? [])
      .map((entry) => entry.event)
      .filter((ev): ev is Ev => !!ev && !!ev.start_at && !!ev.url)
      .map((ev) => ({
        id: ev.api_id ?? ev.url!,
        name: ev.name ?? "Untitled event",
        start_at: ev.start_at!,
        end_at: ev.end_at ?? null,
        url: `https://luma.com/${ev.url}`,
        cover_url: ev.cover_url ?? null,
        location: displayLocation(ev),
        city: cityOf(ev),
      }));
  } catch {
    return [];
  }
}

/** Top N upcoming events from the public Olivier Club Luma calendar. */
export async function getUpcomingLumaEvents(limit = 3): Promise<LumaEvent[]> {
  return (await fetchPool()).slice(0, limit);
}

/** Split a member's freeform location ("Lisbon · Stockholm") into match tokens. */
export function cityTokens(location: string | null | undefined): string[] {
  if (!location) return [];
  return location
    .split(/[·,/&|]+|\band\b|\bor\b/i)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length > 2);
}

/** True if an event's city/location matches any of the member's location tokens. */
export function isNearbyEvent(ev: LumaEvent, tokens: string[]): boolean {
  if (!tokens.length) return false;
  const hay = `${ev.city} ${ev.location}`.toLowerCase();
  return tokens.some((t) => hay.includes(t));
}

/** Upcoming events plus the subset near the member's home location. */
export async function getMemberLumaEvents(
  memberLocation: string | null | undefined
): Promise<{ pool: LumaEvent[]; nearby: LumaEvent[]; tokens: string[] }> {
  const pool = await fetchPool();
  const tokens = cityTokens(memberLocation);
  const nearby = pool.filter((e) => isNearbyEvent(e, tokens));
  return { pool, nearby, tokens };
}

/** Distinct, sorted list of cities present in the events (for the filter dropdown). */
export function distinctCities(events: LumaEvent[]): string[] {
  return Array.from(new Set(events.map((e) => e.city).filter(Boolean))).sort((a, b) =>
    a.localeCompare(b)
  );
}
