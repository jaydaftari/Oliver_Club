import { headers } from "next/headers";

/**
 * Best-effort "current location" for the visitor, used to recommend nearby
 * events. Reads Vercel's edge geo headers (set automatically in production).
 * These are empty in local dev — there the member's Profile location is used.
 */

function decode(v: string | null): string {
  if (!v) return "";
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

/** Current city from request geo headers, or "" when unavailable. */
export async function getRequestCity(): Promise<string> {
  const h = await headers();
  return decode(h.get("x-vercel-ip-city"));
}

/**
 * Combine the member's saved Profile location with the request's detected city
 * into a single location string for event matching. Profile takes precedence.
 */
export async function resolveMemberLocation(profileLocation: string | null | undefined): Promise<{
  location: string;
  detectedCity: string;
}> {
  const detectedCity = await getRequestCity();
  const location = [profileLocation?.trim(), detectedCity].filter(Boolean).join(" · ");
  return { location, detectedCity };
}
