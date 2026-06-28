"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword } from "./actions";
import { FieldLabel } from "@/components/member/AuthCard";
import { fieldStyle, primaryButton, T } from "@/components/member/theme";

export default function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPassword, null);

  if (state?.ok) {
    return (
      <div style={{ display: "grid", gap: 18 }}>
        <p style={{ margin: 0, fontSize: 14.5, color: T.accent }}>{state.message}</p>
        <Link
          href="/login"
          style={{ ...primaryButton(), textAlign: "center", textDecoration: "none" }}
        >
          Go to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} style={{ display: "grid", gap: 16 }}>
      <input type="hidden" name="token" value={token} />
      <div style={{ display: "grid", gap: 7 }}>
        <FieldLabel htmlFor="next">New password</FieldLabel>
        <input
          id="next"
          name="next"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          style={fieldStyle}
        />
      </div>
      <div style={{ display: "grid", gap: 7 }}>
        <FieldLabel htmlFor="confirm">Confirm password</FieldLabel>
        <input
          id="confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          style={fieldStyle}
        />
      </div>

      <p style={{ margin: 0, fontSize: 12.5, color: "rgba(29,30,26,0.5)" }}>
        At least 8 characters.
      </p>

      {state && !state.ok && (
        <p style={{ margin: 0, fontSize: 13.5, color: T.danger }}>{state.message}</p>
      )}

      <button type="submit" disabled={pending} style={primaryButton(pending)}>
        {pending ? "Saving…" : "Set password"}
      </button>
    </form>
  );
}
