import { getPublishedArticles } from "@/lib/articles";

const STATIC_FALLBACK = [
  {
    href: "#",
    src: "https://vavrykworld.com/wp-content/uploads/2026/05/Gary-3.png",
    label: "Past discussion 1",
    number: "01",
    title: "",
  },
  {
    href: "#",
    src: "https://vavrykworld.com/wp-content/uploads/2026/05/Gary-2.png",
    label: "Past discussion 2",
    number: "02",
    title: "",
  },
  {
    href: "#",
    src: "https://vavrykworld.com/wp-content/uploads/2026/03/Add-a-heading-38.png",
    label: "Past discussion 3",
    number: "03",
    title: "",
  },
];

export default async function DiscussionsScroll() {
  const articles = await getPublishedArticles();

  const cards =
    articles.length > 0
      ? articles.map((a) => ({
          href: `/blog/${a.slug}`,
          src: a.cover_url || "",
          label: a.title,
          number: String(a.number).padStart(2, "0"),
          title: a.title,
        }))
      : STATIC_FALLBACK;

  return (
    <section className="past-events">
      <h2 className="h-section">Recent discussions</h2>
      <div className="discussions-scroll">
        {cards.map((card) => (
          <a
            key={card.href + card.number}
            className="discussion-card"
            href={card.href}
            aria-label={card.label}
          >
            {card.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={card.src} alt={card.label} loading="lazy" />
            ) : (
              <div className="discussion-card-empty" />
            )}
            {card.title && <span className="discussion-title">{card.title}</span>}
          </a>
        ))}
      </div>
    </section>
  );
}
