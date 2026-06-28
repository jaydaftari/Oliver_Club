"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createEvent, updateEvent, deleteEvent, normalizeCategory, logActivity } from "@/lib/club";

export type EventActionState = { ok: boolean; message: string } | null;

function parse(formData: FormData) {
  const title = ((formData.get("title") as string) ?? "").trim();
  const category = normalizeCategory((formData.get("category") as string) ?? "other");
  const startsLocal = ((formData.get("starts_at") as string) ?? "").trim();
  const location = ((formData.get("location") as string) ?? "").trim();
  const description = ((formData.get("description") as string) ?? "").trim();
  return { title, category, startsLocal, location, description };
}

export async function createEventAction(
  _prev: EventActionState,
  formData: FormData
): Promise<EventActionState> {
  await requireAdmin();
  const { title, category, startsLocal, location, description } = parse(formData);
  if (!title) return { ok: false, message: "Title is required." };
  const date = new Date(startsLocal);
  if (Number.isNaN(date.getTime()))
    return { ok: false, message: "A valid date & time is required." };

  await createEvent({ title, category, starts_at: date.toISOString(), location, description });
  await logActivity("Olivier Club", `added a new event · ${title}`);
  revalidatePath("/admin/dashboard");
  return { ok: true, message: `Event "${title}" created.` };
}

export async function updateEventAction(
  _prev: EventActionState,
  formData: FormData
): Promise<EventActionState> {
  await requireAdmin();
  const id = parseInt(formData.get("id") as string, 10);
  if (Number.isNaN(id)) return { ok: false, message: "Invalid event." };
  const { title, category, startsLocal, location, description } = parse(formData);
  if (!title) return { ok: false, message: "Title is required." };
  const date = new Date(startsLocal);
  if (Number.isNaN(date.getTime()))
    return { ok: false, message: "A valid date & time is required." };

  await updateEvent(id, { title, category, starts_at: date.toISOString(), location, description });
  revalidatePath("/admin/dashboard");
  return { ok: true, message: "Event updated." };
}

export async function deleteEventAction(
  _prev: EventActionState,
  formData: FormData
): Promise<EventActionState> {
  await requireAdmin();
  const id = parseInt(formData.get("id") as string, 10);
  if (Number.isNaN(id)) return { ok: false, message: "Invalid event." };
  await deleteEvent(id);
  revalidatePath("/admin/dashboard");
  return { ok: true, message: "Event deleted." };
}
