import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import NotFoundBack from "@/components/NotFoundBack";

export const metadata: Metadata = {
  title: "Page Not Found — Olivier Club",
  robots: "noindex",
};

const SERIF = "'Newsreader',serif";
const SANS = "'Archivo',sans-serif";
const ACCENT = "#c9b07a";

export default function NotFound() {
  return (
    <>
      {/* Dashboard typefaces, scoped to this page (matches the member area). */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font -- scoped to the 404 page only */}
      <link
        href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,400&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          position: "relative",
          minHeight: "100vh",
          overflow: "hidden",
          background: "#23271a",
          backgroundImage:
            "radial-gradient(150% 80% at 50% 116%, rgba(201,176,122,0.14), transparent 60%)",
          color: "#efe9d8",
          fontFamily: SANS,
          WebkitFontSmoothing: "antialiased",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* drifting starfield */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            opacity: 0.5,
            backgroundImage:
              "radial-gradient(2px 2px at 30px 40px, rgba(255,255,255,0.5), transparent), radial-gradient(2px 2px at 160px 120px, rgba(255,255,255,0.4), transparent), radial-gradient(1.5px 1.5px at 320px 80px, rgba(255,255,255,0.45), transparent), radial-gradient(2px 2px at 480px 180px, rgba(255,255,255,0.35), transparent), radial-gradient(1.5px 1.5px at 600px 60px, rgba(255,255,255,0.4), transparent)",
            backgroundSize: "680px 240px",
            animation: "nf-drift 26s linear infinite",
          }}
        />

        {/* warm glow */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: "50%",
            top: "46%",
            width: "min(620px,90vw)",
            height: "min(620px,90vw)",
            transform: "translate(-50%,-50%)",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(230,196,120,0.22), transparent 62%)",
            animation: "nf-glow 6s ease-in-out infinite",
            pointerEvents: "none",
          }}
        />

        <header
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "24px clamp(20px,4vw,44px)",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              border: `1.5px solid ${ACCENT}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: SERIF,
              fontSize: 20,
              color: ACCENT,
              flex: "none",
            }}
          >
            O
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 3, lineHeight: 1 }}>
            <span
              style={{
                fontFamily: SERIF,
                fontWeight: 500,
                fontSize: 21,
                letterSpacing: "0.02em",
                color: "#f3efe4",
              }}
            >
              Olivier
            </span>
            <span
              style={{
                font: `600 9px/1 ${SANS}`,
                letterSpacing: "0.34em",
                textTransform: "uppercase",
                color: ACCENT,
              }}
            >
              Club
            </span>
          </div>
        </header>

        <main
          style={{
            position: "relative",
            flex: "1 1 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "40px clamp(20px,5vw,44px) 80px",
          }}
        >
          <Image
            src="/uploads/skier-404.png"
            alt="A skier off the trail"
            width={290}
            height={314}
            priority
            style={{
              width: "clamp(190px,28vw,290px)",
              height: "auto",
              marginBottom: 18,
              filter: "drop-shadow(0 16px 34px rgba(230,196,120,0.4))",
              animation: "nf-float 5.5s ease-in-out infinite",
            }}
          />

          <div
            style={{
              font: `600 11px/1 ${SANS}`,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: ACCENT,
              marginBottom: 20,
            }}
          >
            Error 404
          </div>

          <h1
            style={{
              fontFamily: SERIF,
              fontWeight: 400,
              fontSize: "clamp(72px,15vw,140px)",
              lineHeight: 0.92,
              margin: 0,
              letterSpacing: "-0.01em",
            }}
          >
            Off-piste.
          </h1>

          <p
            style={{
              maxWidth: "42ch",
              margin: "22px 0 0",
              fontSize: "clamp(15px,1.6vw,17px)",
              lineHeight: 1.6,
              color: "rgba(239,233,216,0.66)",
            }}
          >
            You&apos;ve wandered past the edge of the map. This page isn&apos;t on any of our trails
            — but the lodge is warm and the fire&apos;s still going.
          </p>

          <div
            style={{
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              justifyContent: "center",
              marginTop: 36,
            }}
          >
            <Link
              href="/dashboard"
              style={{
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                cursor: "pointer",
                border: "none",
                borderRadius: 999,
                padding: "14px 26px",
                font: `600 12.5px/1 ${SANS}`,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: ACCENT,
                color: "#23271a",
                boxShadow: "0 10px 30px -10px rgba(230,196,120,0.6)",
              }}
            >
              <span style={{ fontSize: 15 }}>⌂</span> Back to dashboard
            </Link>
            <NotFoundBack />
          </div>

          <div
            style={{
              marginTop: 54,
              display: "flex",
              alignItems: "center",
              gap: 16,
              color: "rgba(239,233,216,0.42)",
              font: `600 11px/1 ${SANS}`,
              letterSpacing: "0.13em",
              textTransform: "uppercase",
            }}
          >
            <span>Lost?</span>
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: "rgba(203,176,122,0.5)",
              }}
            />
            <Link
              href="/dashboard/discussions"
              style={{ color: "rgba(239,233,216,0.62)", textDecoration: "none" }}
            >
              Message the concierge
            </Link>
          </div>
        </main>
      </div>
    </>
  );
}
