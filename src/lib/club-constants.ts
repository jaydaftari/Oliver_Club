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

/**
 * Build a player.vimeo.com embed src from any Vimeo URL, or null if unparseable.
 * Pass `startSeconds` to begin playback at a key point (added as a `#t=` fragment).
 */
export function vimeoEmbedSrc(url: string, startSeconds = 0): string | null {
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
  const fragment = startSeconds > 0 ? `#t=${Math.floor(startSeconds)}s` : "";
  return `https://player.vimeo.com/video/${v.id}?${params.toString()}${fragment}`;
}

/* ──────────────────────  Timecodes (key points)  ────────────────────── */

/**
 * Parse a timecode into whole seconds. Accepts plain seconds ("90"),
 * "m:ss" ("1:30"), or "h:mm:ss" ("1:02:03"). Empty/invalid → null.
 */
export function parseTimecode(input: string): number | null {
  const s = input.trim();
  if (!s) return null;
  const parts = s.split(":").map((p) => p.trim());
  if (parts.some((p) => p === "" || !/^\d+$/.test(p))) return null;
  const nums = parts.map((p) => parseInt(p, 10));
  let seconds: number;
  if (nums.length === 1) seconds = nums[0];
  else if (nums.length === 2) seconds = nums[0] * 60 + nums[1];
  else if (nums.length === 3) seconds = nums[0] * 3600 + nums[1] * 60 + nums[2];
  else return null;
  return Number.isFinite(seconds) ? seconds : null;
}

/** Format whole seconds as "m:ss" (or "h:mm:ss" past an hour). Empty for null. */
export function formatTimecode(seconds: number | null | undefined): string {
  if (seconds == null || seconds < 0) return "";
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(sec)}` : `${m}:${pad(sec)}`;
}
