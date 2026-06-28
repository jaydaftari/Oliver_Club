"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { endMemberSession, getMemberSession } from "@/lib/member-session";
import { toggleRsvp, addConnection } from "@/lib/club";
import { changePassword, updateMemberProfile } from "@/lib/members";

export async function memberLogout() {
  await endMemberSession();
  redirect("/login");
}

/** Toggle the signed-in member's RSVP for an internal event. */
export async function rsvpAction(formData: FormData): Promise<void> {
  const session = await getMemberSession();
  if (!session) return;
  const eventId = parseInt(formData.get("eventId") as string, 10);
  if (Number.isNaN(eventId)) return;
  await toggleRsvp(session.id, eventId);
  revalidatePath("/dashboard", "layout");
}

/** Connect the signed-in member with another member. */
export async function connectAction(formData: FormData): Promise<void> {
  const session = await getMemberSession();
  if (!session) return;
  const otherId = parseInt(formData.get("otherId") as string, 10);
  if (Number.isNaN(otherId)) return;
  await addConnection(session.id, otherId);
  revalidatePath("/dashboard", "layout");
}

/** Update the signed-in member's profile fields. */
export async function updateProfile(
  _prev: unknown,
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const session = await getMemberSession();
  if (!session) return { ok: false, message: "Your session expired. Please sign in again." };

  const name = (formData.get("name") as string) ?? "";
  const title = (formData.get("title") as string) ?? "";
  const location = (formData.get("location") as string) ?? "";

  await updateMemberProfile(session.id, { name, title, location });
  revalidatePath("/dashboard", "layout");
  return { ok: true, message: "Profile saved." };
}

/** Change the signed-in member's password (requires the current one). */
export async function changeMemberPassword(
  _prev: unknown,
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const session = await getMemberSession();
  if (!session) return { ok: false, message: "Your session expired. Please sign in again." };

  const current = (formData.get("current") as string) ?? "";
  const next = (formData.get("next") as string) ?? "";
  const confirm = (formData.get("confirm") as string) ?? "";
  if (next !== confirm) return { ok: false, message: "New passwords do not match." };

  const res = await changePassword(session.id, current, next);
  if (!res.ok) return { ok: false, message: res.error ?? "Could not change password." };
  return { ok: true, message: "Password updated." };
}
