"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createWorkshop, updateWorkshop, deleteWorkshop } from "@/lib/club";
import { parseVimeo, parseTimecode } from "@/lib/club-constants";

export type WorkshopActionState = { ok: boolean; message: string } | null;

function parse(formData: FormData) {
  const title = ((formData.get("title") as string) ?? "").trim();
  const vimeo_url = ((formData.get("vimeo_url") as string) ?? "").trim();
  const description = ((formData.get("description") as string) ?? "").trim();
  // Key points: blank start → 0, blank end → null ("play to the end").
  const startRaw = ((formData.get("start_time") as string) ?? "").trim();
  const endRaw = ((formData.get("end_time") as string) ?? "").trim();
  const start_seconds = startRaw ? parseTimecode(startRaw) : 0;
  const end_seconds = endRaw ? parseTimecode(endRaw) : null;
  return { title, vimeo_url, description, startRaw, endRaw, start_seconds, end_seconds };
}

/** Validate the key-point window; returns an error message or null if OK. */
function keyPointError(p: ReturnType<typeof parse>): string | null {
  if (p.startRaw && p.start_seconds == null)
    return "Start time must be a timecode like 0:30 or 90.";
  if (p.endRaw && p.end_seconds == null) return "End time must be a timecode like 4:15 or 255.";
  const start = p.start_seconds ?? 0;
  if (p.end_seconds != null && p.end_seconds <= start)
    return "End time must be after the start time.";
  return null;
}

export async function createWorkshopAction(
  _prev: WorkshopActionState,
  formData: FormData
): Promise<WorkshopActionState> {
  await requireAdmin();
  const p = parse(formData);
  if (!p.vimeo_url) return { ok: false, message: "A Vimeo URL is required." };
  if (!parseVimeo(p.vimeo_url))
    return { ok: false, message: "That doesn't look like a Vimeo URL." };
  const kpErr = keyPointError(p);
  if (kpErr) return { ok: false, message: kpErr };

  await createWorkshop({
    title: p.title || "Untitled workshop",
    vimeo_url: p.vimeo_url,
    description: p.description,
    start_seconds: p.start_seconds ?? 0,
    end_seconds: p.end_seconds,
  });
  revalidatePath("/admin/dashboard");
  revalidatePath("/dashboard");
  return { ok: true, message: "Workshop added." };
}

export async function updateWorkshopAction(
  _prev: WorkshopActionState,
  formData: FormData
): Promise<WorkshopActionState> {
  await requireAdmin();
  const id = parseInt(formData.get("id") as string, 10);
  if (Number.isNaN(id)) return { ok: false, message: "Invalid workshop." };
  const p = parse(formData);
  if (!p.vimeo_url) return { ok: false, message: "A Vimeo URL is required." };
  if (!parseVimeo(p.vimeo_url))
    return { ok: false, message: "That doesn't look like a Vimeo URL." };
  const kpErr = keyPointError(p);
  if (kpErr) return { ok: false, message: kpErr };

  await updateWorkshop(id, {
    title: p.title || "Untitled workshop",
    vimeo_url: p.vimeo_url,
    description: p.description,
    start_seconds: p.start_seconds ?? 0,
    end_seconds: p.end_seconds,
  });
  revalidatePath("/admin/dashboard");
  revalidatePath("/dashboard");
  return { ok: true, message: "Workshop updated." };
}

export async function deleteWorkshopAction(
  _prev: WorkshopActionState,
  formData: FormData
): Promise<WorkshopActionState> {
  await requireAdmin();
  const id = parseInt(formData.get("id") as string, 10);
  if (Number.isNaN(id)) return { ok: false, message: "Invalid workshop." };
  await deleteWorkshop(id);
  revalidatePath("/admin/dashboard");
  revalidatePath("/dashboard");
  return { ok: true, message: "Workshop deleted." };
}
