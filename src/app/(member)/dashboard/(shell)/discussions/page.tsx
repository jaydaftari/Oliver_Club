import Link from "next/link";
import { requireMember } from "@/lib/member-session";
import { getPublishedArticles } from "@/lib/articles";
import { T } from "@/components/member/theme";
import { SectionHead, EmptyNote, PANEL } from "@/components/member/parts";

export default async function DiscussionsPage() {
  await requireMember();
  const articles = await getPublishedArticles();

  return (
    <section style={PANEL}>
      <SectionHead eyebrow="From the club" title="Discussions" cta={`${articles.length} threads`} />
      {articles.length === 0 ? (
        <EmptyNote>No discussions have been published yet.</EmptyNote>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {articles.map((a) => (
            <Link
              key={a.id}
              href={`/blog/${a.slug}`}
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                padding: 16,
                border: "1px solid rgba(29,30,26,0.14)",
                borderRadius: 14,
                background: "#faf8f2",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <div
                style={{
                  fontFamily: T.serif,
                  fontSize: 22,
                  color: T.accent,
                  width: 40,
                  flex: "none",
                  textAlign: "center",
                }}
              >
                {String(a.number).padStart(2, "0")}
              </div>
              <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                <div style={{ fontFamily: T.serif, fontSize: 18, lineHeight: 1.25 }}>{a.title}</div>
                {a.excerpt && (
                  <div
                    style={{
                      fontSize: 13,
                      color: "rgba(29,30,26,0.55)",
                      marginTop: 4,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {a.excerpt}
                  </div>
                )}
              </div>
              <span
                style={{
                  flex: "none",
                  font: `600 11px/1 ${T.sans}`,
                  letterSpacing: "0.05em",
                  color: T.accent,
                }}
              >
                Read →
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
