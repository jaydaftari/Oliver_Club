"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(login, null);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F3EE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400, padding: "0 24px" }}>
        <div style={{ marginBottom: 40 }}>
          <p
            style={{
              fontSize: 13,
              color: "#8A8475",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              margin: "0 0 12px",
            }}
          >
            Olivier Club
          </p>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 400,
              color: "#2A2920",
              margin: 0,
              letterSpacing: "-0.015em",
            }}
          >
            Admin
          </h1>
        </div>

        <form action={action} style={{ display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontSize: 13, color: "#8A8475" }} htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              style={{
                fontFamily: "inherit",
                fontSize: 16,
                padding: "12px 16px",
                background: "#fff",
                border: "1px solid #E0DCD1",
                borderRadius: 6,
                color: "#2A2920",
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "grid", gap: 6 }}>
            <label style={{ fontSize: 13, color: "#8A8475" }} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              style={{
                fontFamily: "inherit",
                fontSize: 16,
                padding: "12px 16px",
                background: "#fff",
                border: "1px solid #E0DCD1",
                borderRadius: 6,
                color: "#2A2920",
                outline: "none",
              }}
            />
          </div>

          {state?.error && (
            <p style={{ fontSize: 14, color: "#B6543C", margin: 0 }}>{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            style={{
              marginTop: 8,
              padding: "13px 24px",
              background: pending ? "#8A8475" : "#5B5A3C",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 15,
              fontFamily: "inherit",
              cursor: pending ? "not-allowed" : "pointer",
              transition: "background 160ms ease",
            }}
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
