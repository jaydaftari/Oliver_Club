"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import {
  addMember,
  approveMember,
  regenerateToken,
  setMemberStatus,
  setFounding,
  deleteMember,
  type MemberStatus,
} from "@/lib/members";
import { logActivity } from "@/lib/club";

export type MemberActionState =
  | { ok: true; message: string; link?: string; email?: string }
  | { ok: false; error: string }
  | null;

/** Build an absolute URL for a path from the incoming request's host. */
async function absoluteUrl(path: string): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}${path}`;
}

function revalidate() {
  revalidatePath("/admin/dashboard");
}

/** Add a member by email (status: pending). */
export async function addMemberAction(
  _prev: MemberActionState,
  formData: FormData
): Promise<MemberActionState> {
  await requireAdmin();
  const email = (formData.get("email") as string) ?? "";
  const name = (formData.get("name") as string) ?? "";
  const res = await addMember(email, name);
  if (!res.ok) return { ok: false, error: res.error };
  revalidate();
  return {
    ok: true,
    message: `Added ${email.trim().toLowerCase()}. Approve to generate a setup link.`,
  };
}

/** Approve a member and return a one-time setup link for the admin to send. */
export async function approveMemberAction(
  _prev: MemberActionState,
  formData: FormData
): Promise<MemberActionState> {
  await requireAdmin();
  const id = parseInt(formData.get("id") as string, 10);
  const email = (formData.get("email") as string) ?? "";
  if (Number.isNaN(id)) return { ok: false, error: "Invalid member." };
  const token = await approveMember(id);
  if (!token) return { ok: false, error: "Could not approve member." };
  const who = (email.split("@")[0] || "A new member").trim();
  await logActivity(who, "joined Olivier Club");
  const link = await absoluteUrl(`/reset-password?token=${token}`);
  revalidate();
  return {
    ok: true,
    message: "Approved. Send this one-time setup link to the member — it expires in 7 days.",
    link,
    email,
  };
}

/** Regenerate a setup/reset link (for resends or forgot-password requests). */
export async function resetMemberAction(
  _prev: MemberActionState,
  formData: FormData
): Promise<MemberActionState> {
  await requireAdmin();
  const id = parseInt(formData.get("id") as string, 10);
  const email = (formData.get("email") as string) ?? "";
  if (Number.isNaN(id)) return { ok: false, error: "Invalid member." };
  const token = await regenerateToken(id);
  if (!token) return { ok: false, error: "Could not generate a link for this member." };
  const link = await absoluteUrl(`/reset-password?token=${token}`);
  revalidate();
  return {
    ok: true,
    message: "New one-time reset link generated — expires in 7 days.",
    link,
    email,
  };
}

/** Change a member's status (suspend / re-activate). */
export async function setStatusAction(
  _prev: MemberActionState,
  formData: FormData
): Promise<MemberActionState> {
  await requireAdmin();
  const id = parseInt(formData.get("id") as string, 10);
  const status = formData.get("status") as MemberStatus;
  if (Number.isNaN(id) || !["pending", "active", "suspended"].includes(status)) {
    return { ok: false, error: "Invalid request." };
  }
  await setMemberStatus(id, status);
  revalidate();
  return {
    ok: true,
    message: status === "suspended" ? "Member suspended." : "Member re-activated.",
  };
}

/** Toggle a member's founding-member badge. */
export async function setFoundingAction(
  _prev: MemberActionState,
  formData: FormData
): Promise<MemberActionState> {
  await requireAdmin();
  const id = parseInt(formData.get("id") as string, 10);
  const founding = formData.get("founding") === "true";
  if (Number.isNaN(id)) return { ok: false, error: "Invalid member." };
  await setFounding(id, founding);
  revalidate();
  return { ok: true, message: founding ? "Marked as founding member." : "Founding badge removed." };
}

/** Permanently remove a member. */
export async function deleteMemberAction(
  _prev: MemberActionState,
  formData: FormData
): Promise<MemberActionState> {
  await requireAdmin();
  const id = parseInt(formData.get("id") as string, 10);
  if (Number.isNaN(id)) return { ok: false, error: "Invalid member." };
  await deleteMember(id);
  revalidate();
  return { ok: true, message: "Member removed." };
}
