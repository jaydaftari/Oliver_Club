import { getPublishedArticles } from "@/lib/articles";

export default async function DiscussionsScroll() {
  const articles = await getPublishedArticles();

  if (articles.length === 0) return null;

  return (
    <section className="past-events">
      <h2 className="h-section">Recent discussions</h2>
      <div className="discussions-scroll">
        {articles.map((a) => (
          <a key={a.slug} className="discussion-card" href={`/blog/${a.slug}`} aria-label={a.title}>
            {a.cover_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={a.cover_url} alt={a.title} loading="lazy" />
            ) : (
              <div className="discussion-card-empty" />
            )}
            {a.title && <span className="discussion-title">{a.title}</span>}
          </a>
        ))}
      </div>
    </section>
  );
}
