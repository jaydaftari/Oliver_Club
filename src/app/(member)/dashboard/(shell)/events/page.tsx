import { requireMember } from "@/lib/member-session";
import { getMemberProfile } from "@/lib/members";
import { resolveMemberLocation } from "@/lib/geo";
import { getMemberLumaEvents, distinctCities } from "@/lib/luma";
import { SectionHead, EmptyNote, PANEL } from "@/components/member/parts";
import EventsBrowser from "./EventsBrowser";

export default async function EventsPage() {
  const session = await requireMember();
  const profile = await getMemberProfile(session.id);
  const { location, detectedCity } = await resolveMemberLocation(profile?.location);
  const { pool, nearby } = await getMemberLumaEvents(location);

  const cities = distinctCities(pool);
  const nearbyIds = nearby.map((e) => e.id);
  const locationLabel = (detectedCity || profile?.location || "").split(/[·,/&|]/)[0].trim();

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
      {pool.length === 0 ? (
        <EmptyNote>No upcoming events on the calendar right now. Check back soon.</EmptyNote>
      ) : (
        <EventsBrowser
          events={pool}
          nearbyIds={nearbyIds}
          cities={cities}
          hasNearby={nearbyIds.length > 0}
          locationLabel={locationLabel}
        />
      )}
    </section>
  );
}
