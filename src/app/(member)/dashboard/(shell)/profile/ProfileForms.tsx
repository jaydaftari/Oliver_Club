"use client";

import { useActionState, useEffect, useRef } from "react";
import { updateProfile, changeMemberPassword } from "@/app/(member)/dashboard/actions";
import { fieldStyle, primaryButton, T } from "@/components/member/theme";

type ProfileValues = { name: string; title: string; location: string };

const panel: React.CSSProperties = {
  background: T.panel,
  border: "1px solid rgba(29,30,26,0.14)",
  borderRadius: 18,
  padding: 26,
};

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} style={{ fontSize: 12.5, color: "rgba(29,30,26,0.62)" }}>
      {children}
    </label>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        font: `600 11px/1 ${T.sans}`,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: T.accent,
        marginBottom: 18,
      }}
    >
      {children}
    </div>
  );
}

export default function ProfileForms({ profile }: { profile: ProfileValues }) {
  const [pState, pAction, pPending] = useActionState(updateProfile, null);
  const [pwState, pwAction, pwPending] = useActionState(changeMemberPassword, null);
  const pwFormRef = useRef<HTMLFormElement>(null);

  // Clear the password fields once a change succeeds so stale values aren't left
  // visible (and can't be re-submitted).
  useEffect(() => {
    if (pwState?.ok) pwFormRef.current?.reset();
  }, [pwState]);

  return (
    <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
      {/* profile details */}
      <form action={pAction} style={{ ...panel, flex: "1 1 320px", display: "grid", gap: 16 }}>
        <Eyebrow>Edit details</Eyebrow>
        <div style={{ display: "grid", gap: 7 }}>
          <Label htmlFor="name">Display name</Label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={profile.name}
            style={fieldStyle}
          />
        </div>
        <div style={{ display: "grid", gap: 7 }}>
          <Label htmlFor="title">Title</Label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Founder & CEO, Northwind Labs"
            defaultValue={profile.title}
            style={fieldStyle}
          />
        </div>
        <div style={{ display: "grid", gap: 7 }}>
          <Label htmlFor="location">Home circles</Label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="Lisbon · Stockholm"
            defaultValue={profile.location}
            style={fieldStyle}
          />
        </div>
        {pState && (
          <p style={{ margin: 0, fontSize: 13.5, color: pState.ok ? T.accent : T.danger }}>
            {pState.message}
          </p>
        )}
        <button type="submit" disabled={pPending} style={primaryButton(pPending)}>
          {pPending ? "Saving…" : "Save profile"}
        </button>
      </form>

      {/* password */}
      <form
        ref={pwFormRef}
        action={pwAction}
        style={{ ...panel, flex: "1 1 320px", display: "grid", gap: 16 }}
      >
        <Eyebrow>Change password</Eyebrow>
        <div style={{ display: "grid", gap: 7 }}>
          <Label htmlFor="current">Current password</Label>
          <input
            id="current"
            name="current"
            type="password"
            autoComplete="current-password"
            required
            style={fieldStyle}
          />
        </div>
        <div style={{ display: "grid", gap: 7 }}>
          <Label htmlFor="next">New password</Label>
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
          <Label htmlFor="confirm">Confirm new password</Label>
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
        {pwState && (
          <p style={{ margin: 0, fontSize: 13.5, color: pwState.ok ? T.accent : T.danger }}>
            {pwState.message}
          </p>
        )}
        <button type="submit" disabled={pwPending} style={primaryButton(pwPending)}>
          {pwPending ? "Saving…" : "Update password"}
        </button>
      </form>
    </div>
  );
}
