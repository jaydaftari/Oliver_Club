/**
 * Pure, dependency-free club constants safe to import from client components.
 * Keep this file free of any server-only imports (no ./db) — `club.ts` pulls in
 * the database client, so importing values from it into a "use client" module
 * would bundle the DB code (and crash on the missing DATABASE_URL).
 */

export type EventCategory = "pitch" | "workshop" | "strategic" | "other";

export const CATEGORY_LABELS: Record<EventCategory, string> = {
  pitch: "Pitch session",
  workshop: "Workshop",
  strategic: "Strategic session",
  other: "Gathering",
};

export function normalizeCategory(v: string): EventCategory {
  return v === "pitch" || v === "workshop" || v === "strategic" || v === "other" ? v : "other";
}

/* ────────────────────────────  Vimeo  ──────────────────────────── */

/**
 * Parse a Vimeo URL into its numeric id and optional privacy hash.
 * Handles vimeo.com/123, vimeo.com/123/abcdef (unlisted), player.vimeo.com/video/123,
 * and a ?h=abcdef query param. Share params (?share=copy&fl=…) are ignored.
 */
export function parseVimeo(url: string): { id: string; hash?: string } | null {
  if (!url) return null;
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/(\w+))?/i);
  if (!m) return null;
  const hashFromQuery = url.match(/[?&]h=(\w+)/i)?.[1];
  const hash = hashFromQuery ?? m[2];
  return hash ? { id: m[1], hash } : { id: m[1] };
}

/** Build a player.vimeo.com embed src from any Vimeo URL, or null if unparseable. */
export function vimeoEmbedSrc(url: string): string | null {
  const v = parseVimeo(url);
  if (!v) return null;
  const params = new URLSearchParams({
    // Hide the title-overlay clutter…
    title: "0",
    byline: "0",
    portrait: "0",
    dnt: "1",
    // …but show the full playback control bar and its buttons.
    controls: "1",
    pip: "1", // picture-in-picture button
    speed: "1", // playback-speed control in the settings menu
    fullscreen: "1", // fullscreen button
    playsinline: "1",
  });
  if (v.hash) params.set("h", v.hash);
  return `https://player.vimeo.com/video/${v.id}?${params.toString()}`;
}
