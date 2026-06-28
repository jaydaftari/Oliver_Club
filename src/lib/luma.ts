/**
 * Olivier Club's public Luma calendar (https://luma.com/olivierclub).
 *
 * Upcoming events are pulled live from Luma's public calendar API and cached for
 * a few minutes. RSVPs happen on Luma itself, so each event links out.
 */

const CALENDAR_API_ID = "cal-IbggcvDR28EgQN0";
const REVALIDATE_SECONDS = 600; // refresh the calendar at most every 10 minutes

export type LumaEvent = {
  id: string;
  name: string;
  start_at: string;
  end_at: string | null;
  url: string; // public event page (https://luma.com/<slug>)
  cover_url: string | null;
  location: string;
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
      city_state?: string;
      short_address?: string;
      full_address?: string;
    } | null;
  };
};

function locationOf(ev: NonNullable<LumaEntry["event"]>): string {
  if (ev.location_type === "online") return "Online";
  const geo = ev.geo_address_info;
  return geo?.city_state || geo?.short_address || geo?.full_address || "";
}

/** Top upcoming events from the public Olivier Club Luma calendar. */
export async function getUpcomingLumaEvents(limit = 3): Promise<LumaEvent[]> {
  const url =
    `https://api.lu.ma/calendar/get-items?calendar_api_id=${CALENDAR_API_ID}` +
    `&period=future&pagination_limit=${limit}`;
  try {
    const res = await fetch(url, {
      headers: { accept: "application/json", "user-agent": "OlivierClub/1.0" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { entries?: LumaEntry[] };
    const entries = data.entries ?? [];
    return entries
      .map((entry) => entry.event)
      .filter((ev): ev is NonNullable<LumaEntry["event"]> => !!ev && !!ev.start_at && !!ev.url)
      .slice(0, limit)
      .map((ev) => ({
        id: ev.api_id ?? ev.url!,
        name: ev.name ?? "Untitled event",
        start_at: ev.start_at!,
        end_at: ev.end_at ?? null,
        url: `https://luma.com/${ev.url}`,
        cover_url: ev.cover_url ?? null,
        location: locationOf(ev),
      }));
  } catch {
    return [];
  }
}
