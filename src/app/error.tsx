"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F5F3EE",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
        padding: "0 24px",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 480 }}>
        <p style={{ fontSize: 13, color: "#6B6558", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 16 }}>
          Something went wrong
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 400, color: "#2A2920", margin: "0 0 16px", letterSpacing: "-0.015em" }}>
          An unexpected error occurred
        </h1>
        <p style={{ fontSize: 17, color: "#6B6558", lineHeight: 1.6, margin: "0 0 32px" }}>
          We apologise for the inconvenience. You can try again or return to the homepage.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            onClick={reset}
            style={{
              padding: "12px 24px",
              background: "#5B5A3C",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 15,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <Link
            href="/"
            style={{
              padding: "12px 24px",
              background: "transparent",
              color: "#2A2920",
              border: "1px solid #E0DCD1",
              borderRadius: 6,
              fontSize: 15,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
