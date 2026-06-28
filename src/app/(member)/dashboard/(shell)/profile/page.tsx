import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/member-session";
import { getMemberById, getMemberProfile } from "@/lib/members";
import { getAttendedStats, getConnectionCount } from "@/lib/club";
import { T } from "@/components/member/theme";
import { SectionHead, avatarStyle, PANEL } from "@/components/member/parts";
import ProfileForms from "./ProfileForms";

export default async function ProfilePage() {
  const session = await getMemberSession();
  if (!session) redirect("/login");

  const [member, profile, attended, connections] = await Promise.all([
    getMemberById(session.id),
    getMemberProfile(session.id),
    getAttendedStats(session.id),
    getConnectionCount(session.id),
  ]);
  if (!member || !profile || member.status !== "active") redirect("/login");

  const displayName =
    profile.name?.trim() ||
    profile.email
      .split("@")[0]
      .replace(/[._-]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  const parts = displayName.trim().split(/\s+/);
  const initials = ((parts[0]?.[0] ?? "?") + (parts[1]?.[0] ?? "")).toUpperCase();

  const stats = [
    { label: "Gatherings", value: attended.total },
    { label: "Connections", value: connections },
    { label: "Member since", value: profile.member_since ?? "—" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* identity card */}
      <section style={PANEL}>
        <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap" }}>
          <div style={avatarStyle(0, 72)}>{initials}</div>
          <div style={{ flex: "1 1 auto", minWidth: 0 }}>
            <h2 style={{ fontFamily: T.serif, fontWeight: 400, fontSize: 28, margin: 0 }}>
              {displayName}
            </h2>
            <div style={{ fontSize: 14, color: "rgba(29,30,26,0.7)", marginTop: 4 }}>
              {profile.title?.trim() || "Olivier Club member"}
            </div>
            <div style={{ fontSize: 13, color: "rgba(29,30,26,0.5)", marginTop: 2 }}>
              {profile.email}
              {profile.location?.trim() ? ` · ${profile.location}` : ""}
            </div>
          </div>
          {profile.founding && (
            <span
              style={{
                font: `600 11px/1 ${T.sans}`,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: T.accent,
                border: "1px solid rgba(44,74,53,0.35)",
                borderRadius: 999,
                padding: "9px 15px",
              }}
            >
              Founding Member
            </span>
          )}
        </div>

        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", marginTop: 24 }}>
          {stats.map((s) => (
            <div key={s.label}>
              <div style={{ fontFamily: T.serif, fontSize: 30, lineHeight: 1 }}>{s.value}</div>
              <div
                style={{
                  font: `600 10px/1 ${T.sans}`,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(29,30,26,0.5)",
                  marginTop: 8,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* settings */}
      <section>
        <SectionHead eyebrow="Account" title="Manage your profile" />
        <ProfileForms
          profile={{
            name: profile.name ?? "",
            title: profile.title ?? "",
            location: profile.location ?? "",
          }}
        />
      </section>
    </div>
  );
}
