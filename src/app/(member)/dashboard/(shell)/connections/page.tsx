import { requireMember } from "@/lib/member-session";
import {
  getConnectionCount,
  getRecentConnectionCount,
  getConnections,
  getPeopleToMeet,
} from "@/lib/club";
import { T } from "@/components/member/theme";
import { SectionHead, EmptyNote, PersonRow, avatarStyle, PANEL } from "@/components/member/parts";

export default async function ConnectionsPage() {
  const session = await requireMember();

  const [count, recent, connections, peopleToMeet] = await Promise.all([
    getConnectionCount(session.id),
    getRecentConnectionCount(session.id),
    getConnections(session.id, 24),
    getPeopleToMeet(session.id, 8),
  ]);

  return (
    <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
      {/* your network */}
      <section style={{ ...PANEL, flex: "1.6 1 420px" }}>
        <SectionHead
          eyebrow="Your network"
          title="Connections"
          cta={recent > 0 ? `+${recent} new` : undefined}
        />
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, marginBottom: 20 }}>
          <span style={{ fontFamily: T.serif, fontWeight: 400, fontSize: 46, lineHeight: 0.9 }}>
            {count}
          </span>
          <span style={{ fontSize: 13, color: "rgba(29,30,26,0.55)", paddingBottom: 6 }}>
            {count === 1 ? "member" : "members"} connected
          </span>
        </div>
        {connections.length === 0 ? (
          <EmptyNote>You haven&apos;t connected with anyone yet. Find members to meet →</EmptyNote>
        ) : (
          <div
            style={{
              display: "grid",
              gap: 14,
              gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))",
            }}
          >
            {connections.map((p) => (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={avatarStyle(p.id, 40)}>{p.initials}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "rgba(29,30,26,0.55)" }}>{p.role}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* people to meet */}
      <section style={{ ...PANEL, flex: "1 1 300px" }}>
        <div
          style={{
            font: `600 10px/1 ${T.sans}`,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(29,30,26,0.5)",
            marginBottom: 16,
          }}
        >
          People to meet
        </div>
        {peopleToMeet.length === 0 ? (
          <EmptyNote>No new members to suggest right now.</EmptyNote>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {peopleToMeet.map((p) => (
              <PersonRow key={p.id} person={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
