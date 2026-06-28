"use server";

import { setPasswordFromToken } from "@/lib/members";

export async function resetPassword(
  _prev: unknown,
  formData: FormData
): Promise<{ ok: boolean; message: string }> {
  const token = (formData.get("token") as string) ?? "";
  const next = (formData.get("next") as string) ?? "";
  const confirm = (formData.get("confirm") as string) ?? "";

  if (next !== confirm) return { ok: false, message: "Passwords do not match." };

  const res = await setPasswordFromToken(token, next);
  if (!res.ok) return { ok: false, message: res.error ?? "Could not set password." };
  return { ok: true, message: "Password set. You can now sign in." };
}
