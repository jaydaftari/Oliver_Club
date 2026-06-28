import { requireMember } from "@/lib/member-session";
import { getUpcomingLumaEvents } from "@/lib/luma";
import { SectionHead, EmptyNote, LumaEventCard, PANEL } from "@/components/member/parts";

export default async function EventsPage() {
  await requireMember();
  const events = await getUpcomingLumaEvents(12);

  return (
    <section style={PANEL}>
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
            Full calendar ↗
          </a>
        }
      />
      {events.length === 0 ? (
        <EmptyNote>No upcoming events on the calendar right now. Check back soon.</EmptyNote>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {events.map((e) => (
            <LumaEventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </section>
  );
}
