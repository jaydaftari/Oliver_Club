import { redirect } from "next/navigation";
import Link from "next/link";
import { getMemberSession } from "@/lib/member-session";
import { getMemberProfile, getMemberById } from "@/lib/members";
import { getAttendedStats } from "@/lib/club";
import { memberLogout } from "@/app/(member)/dashboard/actions";
import MemberNav from "@/components/member/MemberNav";
import Logo from "@/components/member/Logo";
import { SubmitButton } from "@/components/member/SubmitButton";
import { T } from "@/components/member/theme";

export default async function DashboardShellLayout({ children }: { children: React.ReactNode }) {
  const session = await getMemberSession();
  if (!session) redirect("/login");

  const [profile, member, attended] = await Promise.all([
    getMemberProfile(session.id),
    getMemberById(session.id),
    getAttendedStats(session.id),
  ]);
  if (!profile || !member || member.status !== "active") redirect("/login");

  const displayName =
    profile.name?.trim() ||
    profile.email
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  const firstName = displayName.split(" ")[0];
  const parts = displayName.trim().split(/\s+/);
  const initials = ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const dateLabel = `${now.toLocaleDateString("en-US", { weekday: "long" })} · ${now.toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" }
  )}`;
  const heroMeta = [profile.title?.trim(), `${attended.total} gatherings this season`]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        color: T.ink,
        fontFamily: T.sans,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* ── header ── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          flexWrap: "wrap",
          padding: "20px clamp(20px,4vw,44px)",
          borderBottom: `1px solid ${T.line}`,
        }}
      >
        <Logo size={38} href="/" />

        <MemberNav />

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <form action={memberLogout}>
            <SubmitButton
              pendingLabel="Signing out…"
              style={{
                font: `600 11px/1 ${T.sans}`,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: T.inkSoft,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              Sign out
            </SubmitButton>
          </form>
          <Link
            href="/dashboard/profile"
            title={member.email}
            style={{
              width: 38,
              height: 38,
              borderRadius: "50%",
              background: T.accent,
              color: T.accentInk,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              font: `600 13px/1 ${T.sans}`,
              flex: "none",
              textDecoration: "none",
            }}
          >
            {initials}
          </Link>
        </div>
      </header>

      {/* ── hero ── */}
      <section
        style={{
          position: "relative",
          width: "100%",
          height: "clamp(230px,30vw,320px)",
          overflow: "hidden",
          background: T.heroBg,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/uploads/cover-ski-zoom.png"
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            opacity: 0.9,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(90deg,#21392a 0%, rgba(33,57,42,0.9) 32%, rgba(33,57,42,0.42) 62%, rgba(33,57,42,0.1) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(33,57,42,0.1) 0%, rgba(33,57,42,0) 44%, rgba(33,57,42,0.45) 100%)",
          }}
        />
        <div
          style={{
            position: "relative",
            maxWidth: 1180,
            margin: "0 auto",
            height: "100%",
            padding: "0 clamp(20px,4vw,44px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              font: `600 11px/1 ${T.sans}`,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: T.gold,
              marginBottom: 14,
            }}
          >
            {dateLabel}
          </div>
          <h1
            style={{
              fontFamily: T.serif,
              fontWeight: 400,
              fontSize: "clamp(34px,5.2vw,52px)",
              lineHeight: 1.02,
              margin: 0,
              maxWidth: "16ch",
              color: T.heroInk,
            }}
          >
            {greeting}, {firstName}.
          </h1>
          {heroMeta && (
            <p style={{ margin: "13px 0 0", color: T.heroInkSoft, fontSize: 15 }}>{heroMeta}</p>
          )}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              flexWrap: "wrap",
              marginTop: 20,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 9,
                padding: "10px 16px",
                border: "1px solid rgba(245,242,234,0.3)",
                borderRadius: 999,
                background: "rgba(33,57,42,0.4)",
              }}
            >
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: T.gold,
                  flex: "none",
                }}
              />
              <span
                style={{
                  font: `600 11px/1 ${T.sans}`,
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: T.heroInk,
                }}
              >
                {profile.founding ? "Founding Member" : "Member"}
                {profile.member_since ? ` · ${profile.member_since}` : ""}
              </span>
            </div>
            {profile.location?.trim() && (
              <span
                style={{
                  font: `600 11px/1 ${T.sans}`,
                  letterSpacing: "0.13em",
                  textTransform: "uppercase",
                  color: T.heroInkFaint,
                }}
              >
                {profile.location}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── main ── */}
      <main
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "clamp(28px,4vw,40px) clamp(20px,4vw,44px) 64px",
        }}
      >
        {children}
      </main>
    </div>
  );
}
