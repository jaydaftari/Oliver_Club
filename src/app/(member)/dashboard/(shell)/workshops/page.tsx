import { requireMember } from "@/lib/member-session";
import { getWorkshops } from "@/lib/club";
import { getVimeoMeta } from "@/lib/vimeo";
import { SectionHead, WorkshopGrid } from "@/components/member/parts";

export default async function WorkshopsPage() {
  await requireMember();
  const workshops = await getWorkshops();

  // Show the title & description that live on Vimeo, not the DB placeholders.
  const enriched = await Promise.all(
    workshops.map(async (w) => {
      const meta = await getVimeoMeta(w.vimeo_url);
      return {
        ...w,
        title: meta?.title || w.title,
        description: meta?.description || w.description,
      };
    })
  );

  return (
    <section>
      <SectionHead eyebrow="On demand" title="Workshops" cta={`${enriched.length} videos`} />
      <WorkshopGrid workshops={enriched} />
    </section>
  );
}
