"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPassword } from "./actions";
import AuthCard, { FieldLabel } from "@/components/member/AuthCard";
import { fieldStyle, primaryButton, T } from "@/components/member/theme";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState(forgotPassword, null);

  if (state?.done) {
    return (
      <AuthCard
        eyebrow="Password reset"
        title="Check your inbox."
        subtitle="If your email is registered with Olivier Club, a member of the team will send you a secure reset link shortly."
        footer={
          <Link href="/login" style={{ color: T.accent, textDecoration: "none" }}>
            ← Back to sign in
          </Link>
        }
      >
        <div
          style={{
            padding: 16,
            border: "1px solid rgba(29,30,26,0.28)",
            borderRadius: 12,
            background: "rgba(29,30,26,0.04)",
            fontSize: 13.5,
            lineHeight: 1.55,
            color: "rgba(29,30,26,0.75)",
          }}
        >
          Reset links are issued by an administrator and expire after 7 days. If you don&apos;t hear
          back, reach out to your Olivier Club contact directly.
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      eyebrow="Password reset"
      title="Forgot your password?"
      subtitle="Enter your member email and we'll arrange a secure reset link for you."
      footer={
        <Link href="/login" style={{ color: T.accent, textDecoration: "none" }}>
          ← Back to sign in
        </Link>
      }
    >
      <form action={action} style={{ display: "grid", gap: 16 }}>
        <div style={{ display: "grid", gap: 7 }}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            style={fieldStyle}
          />
        </div>

        {state?.error && (
          <p style={{ margin: 0, fontSize: 13.5, color: T.danger }}>{state.error}</p>
        )}

        <button type="submit" disabled={pending} style={primaryButton(pending)}>
          {pending ? "Sending…" : "Request reset link"}
        </button>
      </form>
    </AuthCard>
  );
}
