"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createArticle, updateArticle, deleteArticle, resolveNumberConflict } from "@/lib/articles";
import { requireAdmin } from "@/lib/auth";

function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export async function saveArticle(
  _prev: unknown,
  formData: FormData
): Promise<{ error: string } | null> {
  await requireAdmin();
  const idStr = formData.get("id") as string | null;
  const id = idStr ? parseInt(idStr, 10) : null;

  const title = ((formData.get("title") as string) ?? "").trim();
  if (!title) return { error: "Title is required." };

  const slugRaw = ((formData.get("slug") as string) ?? "").trim();
  const slug = slugRaw || toSlug(title);
  if (!slug) return { error: "Could not generate a slug from the title." };

  const number = Math.max(1, parseInt(formData.get("number") as string, 10) || 1);
  const excerpt = ((formData.get("excerpt") as string) ?? "").trim();
  const cover_url = ((formData.get("cover_url") as string) ?? "").trim();
  const content = ((formData.get("content") as string) ?? "").trim();
  const published = formData.get("published") === "on";

  try {
    await resolveNumberConflict(number, id ?? undefined);
    if (id) {
      await updateArticle(id, { number, title, slug, excerpt, cover_url, content, published });
    } else {
      await createArticle({ number, title, slug, excerpt, cover_url, content, published });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return { error: "That slug is already taken. Choose a different one." };
    }
    return { error: "Failed to save. Please try again." };
  }

  revalidatePath("/admin/dashboard");
  redirect("/admin/dashboard");
}

export async function removeArticle(formData: FormData) {
  await requireAdmin();
  const id = parseInt(formData.get("id") as string, 10);
  if (!isNaN(id)) await deleteArticle(id);
  revalidatePath("/admin/dashboard");
  redirect("/admin/dashboard");
}
