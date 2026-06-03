import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found — Olivier Club",
  robots: "noindex",
};

export default function NotFound() {
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
          404
        </p>
        <h1 style={{ fontSize: 32, fontWeight: 400, color: "#2A2920", margin: "0 0 16px", letterSpacing: "-0.015em" }}>
          Page not found
        </h1>
        <p style={{ fontSize: 17, color: "#6B6558", lineHeight: 1.6, margin: "0 0 32px" }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "12px 24px",
            background: "#5B5A3C",
            color: "#fff",
            borderRadius: 6,
            fontSize: 15,
            textDecoration: "none",
          }}
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
