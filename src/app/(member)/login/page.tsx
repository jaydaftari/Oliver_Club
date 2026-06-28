"use client";

import { useActionState } from "react";
import { memberLogin } from "./actions";
import AuthCard, { FieldLabel } from "@/components/member/AuthCard";
import { fieldStyle, primaryButton, T } from "@/components/member/theme";

export default function MemberLoginPage() {
  const [state, action, pending] = useActionState(memberLogin, null);

  return (
    <AuthCard
      eyebrow="Member access"
      title="Welcome back."
      subtitle="Sign in to your Olivier Club dashboard."
      // Forgot-password link hidden for now — re-enable when ready.
      // footer={
      //   <span>
      //     Forgot your password?{" "}
      //     <Link href="/forgot-password" style={{ color: T.accent, textDecoration: "none" }}>
      //       Reset it
      //     </Link>
      //   </span>
      // }
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
        <div style={{ display: "grid", gap: 7 }}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            style={fieldStyle}
          />
        </div>

        {state?.error && (
          <p style={{ margin: 0, fontSize: 13.5, color: T.danger }}>{state.error}</p>
        )}

        <button type="submit" disabled={pending} style={primaryButton(pending)}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthCard>
  );
}
