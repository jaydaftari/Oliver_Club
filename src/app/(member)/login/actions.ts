"use server";

import { redirect } from "next/navigation";
import { checkLoginRateLimit, recordLoginAttempt } from "@/lib/auth";
import { verifyMemberLogin, recordMemberLogin } from "@/lib/members";
import { startMemberSession } from "@/lib/member-session";

export async function memberLogin(
  _prev: unknown,
  formData: FormData
): Promise<{ error: string } | null> {
  const { allowed } = await checkLoginRateLimit();
  if (!allowed) {
    return { error: "Too many attempts. Please try again in 15 minutes." };
  }

  // Count every attempt against the limit so a known-good password can't be
  // used to brute-force other accounts without ever tripping the throttle.
  await recordLoginAttempt();

  const email = ((formData.get("email") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";

  let member;
  try {
    member = await verifyMemberLogin(email, password);
  } catch {
    return { error: "Something went wrong. Please try again." };
  }

  if (!member) {
    return { error: "Invalid email or password." };
  }

  await startMemberSession(member.id, member.email);
  await recordMemberLogin(member.id);
  redirect("/dashboard");
}
