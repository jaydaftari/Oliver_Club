import { requireMember } from "@/lib/member-session";
import {
  getAttendedStats,
  getConnectionCount,
  getRecentConnectionCount,
  getConnections,
  getPeopleToMeet,
  getActivity,
} from "@/lib/club";
import { getUpcomingLumaEvents } from "@/lib/luma";
import { T } from "@/components/member/theme";
import {
  SectionHead,
  EmptyNote,
  LumaEventCard,
  PersonRow,
  ActivityRow,
  avatarStyle,
  PANEL,
  SoftLink,
} from "@/components/member/parts";

export default async function OverviewPage() {
  const session = await requireMember();

  const [attended, events, network, recentNetwork, connections, peopleToMeet, activity] =
    await Promise.all([
      getAttendedStats(session.id),
      getUpcomingLumaEvents(3),
      getConnectionCount(session.id),
      getRecentConnectionCount(session.id),
      getConnections(session.id, 5),
      getPeopleToMeet(session.id, 2),
      getActivity(4),
    ]);

  const gatherings = [
    { label: "Pitch sessions", n: attended.pitch },
    { label: "Workshops", n: attended.workshop },
    { label: "Strategic sessions", n: attended.strategic },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* gatherings */}
      <section>
        <SectionHead
          eyebrow="Attended this season"
          title="Your gatherings"
          cta={<SoftLink href="/dashboard/events">View events</SoftLink>}
        />
        <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
          {gatherings.map((g) => (
            <div
              key={g.label}
              style={{
                flex: "1 1 200px",
                background: T.panelRaised,
                border: "1px solid rgba(29,30,26,0.16)",
                borderRadius: 16,
                padding: 26,
              }}
            >
              <div
                style={{
                  font: `600 11px/1 ${T.sans}`,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(29,30,26,0.62)",
                }}
              >
                {g.label}
              </div>
              <div
                style={{
                  fontFamily: T.serif,
                  fontWeight: 400,
                  fontSize: "clamp(36px,4.6vw,50px)",
                  lineHeight: 1,
                  margin: "16px 0 12px",
                  color: T.accent,
                }}
              >
                {g.n}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 9,
                  color: "rgba(29,30,26,0.55)",
                  fontSize: 12.5,
                }}
              >
                <span
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: T.gold,
                    flex: "none",
                  }}
                />
                Attended this season
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
        {/* upcoming events (Luma) */}
        <section style={{ ...PANEL, flex: "1.6 1 420px" }}>
          <SectionHead
            eyebrow="Upcoming · via Luma"
            title="Events & sessions"
            cta={
              <a
                href="https://luma.com/olivierclub"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "rgba(29,30,26,0.5)", textDecoration: "none" }}
              >
                All events ↗
              </a>
            }
          />
          {events.length === 0 ? (
            <EmptyNote>No upcoming events on the calendar right now.</EmptyNote>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {events.map((e) => (
                <LumaEventCard key={e.id} event={e} />
              ))}
            </div>
          )}
        </section>

        {/* side column */}
        <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 22 }}>
          <section style={PANEL}>
            <div
              style={{
                font: `600 11px/1 ${T.sans}`,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: T.accent,
              }}
            >
              Connections
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, margin: "14px 0 4px" }}>
              <span style={{ fontFamily: T.serif, fontWeight: 400, fontSize: 46, lineHeight: 0.9 }}>
                {network}
              </span>
              <span style={{ fontSize: 13, color: "rgba(29,30,26,0.55)", paddingBottom: 6 }}>
                in your network
              </span>
            </div>
            {(connections.length > 0 || recentNetwork > 0) && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0 18px" }}>
                <div style={{ display: "flex", gap: 6 }}>
                  {connections.map((p, idx) => (
                    <div key={p.id} style={avatarStyle(idx, 34)} title={p.name}>
                      {p.initials}
                    </div>
                  ))}
                </div>
                {recentNetwork > 0 && (
                  <span style={{ fontSize: 12.5, color: T.accent, fontWeight: 600 }}>
                    +{recentNetwork} new
                  </span>
                )}
              </div>
            )}
            {peopleToMeet.length > 0 && (
              <>
                <div style={{ height: 1, background: "rgba(29,30,26,0.14)", margin: "16px 0" }} />
                <div
                  style={{
                    font: `600 10px/1 ${T.sans}`,
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    color: "rgba(29,30,26,0.5)",
                    marginBottom: 14,
                  }}
                >
                  People to meet
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {peopleToMeet.map((p) => (
                    <PersonRow key={p.id} person={p} />
                  ))}
                </div>
              </>
            )}
          </section>

          <section style={PANEL}>
            <div
              style={{
                font: `600 11px/1 ${T.sans}`,
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: T.accent,
                marginBottom: 16,
              }}
            >
              Recent activity
            </div>
            {activity.length === 0 ? (
              <EmptyNote>Activity from the club will show up here.</EmptyNote>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {activity.map((ac, idx) => (
                  <ActivityRow key={ac.id} item={ac} seed={idx} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
