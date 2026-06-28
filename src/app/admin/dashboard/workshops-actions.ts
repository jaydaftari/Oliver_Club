"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createWorkshop, updateWorkshop, deleteWorkshop } from "@/lib/club";
import { parseVimeo } from "@/lib/club-constants";

export type WorkshopActionState = { ok: boolean; message: string } | null;

function parse(formData: FormData) {
  const title = ((formData.get("title") as string) ?? "").trim();
  const vimeo_url = ((formData.get("vimeo_url") as string) ?? "").trim();
  const description = ((formData.get("description") as string) ?? "").trim();
  return { title, vimeo_url, description };
}

export async function createWorkshopAction(
  _prev: WorkshopActionState,
  formData: FormData
): Promise<WorkshopActionState> {
  await requireAdmin();
  const { title, vimeo_url, description } = parse(formData);
  if (!vimeo_url) return { ok: false, message: "A Vimeo URL is required." };
  if (!parseVimeo(vimeo_url)) return { ok: false, message: "That doesn't look like a Vimeo URL." };

  await createWorkshop({ title: title || "Untitled workshop", vimeo_url, description });
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
  const { title, vimeo_url, description } = parse(formData);
  if (!vimeo_url) return { ok: false, message: "A Vimeo URL is required." };
  if (!parseVimeo(vimeo_url)) return { ok: false, message: "That doesn't look like a Vimeo URL." };

  await updateWorkshop(id, { title: title || "Untitled workshop", vimeo_url, description });
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
