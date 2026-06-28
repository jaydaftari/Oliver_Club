"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createSession,
  verifyCredentials,
  checkLoginRateLimit,
  recordLoginAttempt,
} from "@/lib/auth";

export async function login(_prev: unknown, formData: FormData): Promise<{ error: string } | null> {
  const { allowed } = await checkLoginRateLimit();
  if (!allowed) {
    return { error: "Too many login attempts. Try again in 15 minutes." };
  }

  // Count every attempt against the limit, not just failures.
  await recordLoginAttempt();

  const email = ((formData.get("email") as string) ?? "").trim();
  const password = (formData.get("password") as string) ?? "";

  let valid: boolean;
  try {
    valid = verifyCredentials(email, password);
  } catch {
    return { error: "Server configuration error. Contact the administrator." };
  }

  if (!valid) {
    return { error: "Invalid email or password." };
  }

  const session = await createSession();
  (await cookies()).set("oc_admin", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });

  redirect("/admin/dashboard");
}

export async function logout() {
  (await cookies()).delete("oc_admin");
  redirect("/admin");
}
