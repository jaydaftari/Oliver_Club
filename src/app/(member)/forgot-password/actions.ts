"use server";

import { checkLoginRateLimit, recordLoginAttempt } from "@/lib/auth";
import { requestPasswordReset } from "@/lib/members";

export async function forgotPassword(
  _prev: unknown,
  formData: FormData
): Promise<{ done: boolean; error?: string }> {
  const { allowed } = await checkLoginRateLimit("reset", 5);
  if (!allowed) return { done: false, error: "Too many attempts. Try again in 15 minutes." };

  const email = ((formData.get("email") as string) ?? "").trim();
  await recordLoginAttempt("reset");
  // Silent regardless of whether the email exists — no account enumeration.
  await requestPasswordReset(email);
  return { done: true };
}
