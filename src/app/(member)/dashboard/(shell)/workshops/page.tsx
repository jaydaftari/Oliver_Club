import { requireMember } from "@/lib/member-session";
import { getWorkshops } from "@/lib/club";
import { SectionHead, WorkshopGrid } from "@/components/member/parts";

export default async function WorkshopsPage() {
  await requireMember();
  const workshops = await getWorkshops();

  return (
    <section>
      <SectionHead eyebrow="On demand" title="Workshops" cta={`${workshops.length} videos`} />
      <WorkshopGrid workshops={workshops} />
    </section>
  );
}
