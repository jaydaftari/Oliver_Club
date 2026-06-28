/**
 * Server-side fetch of a Vimeo video's own title & description via the public
 * oEmbed endpoint (no auth required). Used so the workshops grid shows exactly
 * what's on Vimeo rather than the placeholder titles stored in the DB.
 *
 * Note: oEmbed only returns a `description` when the video has one set on Vimeo.
 * If a video has no description, it comes back empty — which is correct.
 */
import { parseVimeo } from "./club-constants";

export type VimeoMeta = { title: string; description: string };

const REVALIDATE_SECONDS = 3600; // re-check Vimeo at most once an hour

export async function getVimeoMeta(url: string): Promise<VimeoMeta | null> {
  const v = parseVimeo(url);
  if (!v) return null;
  // Unlisted videos need the privacy hash in the oEmbed lookup URL.
  const canonical = v.hash ? `https://vimeo.com/${v.id}/${v.hash}` : `https://vimeo.com/${v.id}`;
  const endpoint = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(canonical)}`;
  try {
    const res = await fetch(endpoint, {
      headers: { accept: "application/json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { title?: string; description?: string | null };
    return {
      title: (data.title ?? "").trim(),
      description: (data.description ?? "").trim(),
    };
  } catch {
    return null;
  }
}
