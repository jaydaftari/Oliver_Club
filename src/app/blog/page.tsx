import type { Metadata } from "next";
import Link from "next/link";
import BackLink from "@/components/BackLink";
import Footer from "@/components/Footer";
import { getPublishedArticles } from "@/lib/articles";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://olivierclub.com";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights, discussions, and stories from visionaries, founders, and ambitious entrepreneurs.",
  alternates: { canonical: `${BASE_URL}/blog` },
  openGraph: {
    url: `${BASE_URL}/blog`,
    title: "Blog — Olivier Club",
    description:
      "Insights, discussions, and stories from visionaries, founders, and ambitious entrepreneurs.",
  },
};

export default async function BlogPage() {
  const dbArticles = await getPublishedArticles();

  return (
    <div className="page">
      <BackLink href="/" label="Back to Home" />

      <main className="main">
        <div className="container">
          <section className="hero hero-single">
            <div className="hero-text">
              <h1 className="h-hero">Blog</h1>
              <p className="lede" style={{ maxWidth: "48ch" }}>
                Insights, discussions, and stories from visionaries, founders, and ambitious
                entrepreneurs.
              </p>
            </div>
          </section>

          <section className="blog-grid">
            {/* Static featured post */}
            <Link
              className="blog-card featured"
              href="/blog/physical-ai"
              aria-label="Read: From Physical AI discussion"
            >
              <div className="thumb">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://vavrykworld.com/wp-content/uploads/2026/05/TRAKA-2.png"
                  alt="From Physical AI discussion"
                />
              </div>
              <div className="body-area">
                <div className="meta">
                  <time dateTime="2026-05-13">May 13, 2026</time>
                  <span className="dot">•</span>
                  <span>8 min read</span>
                </div>
                <h2 className="title">From Physical AI discussion</h2>
                <p className="excerpt">
                  More than 50% of AI startups abandoned after POC. What&apos;s going on nowadays in
                  Silicon Valley triggers both excitement and fear.
                </p>
              </div>
            </Link>

            {/* Dynamic articles from database */}
            {dbArticles.map((article) => {
              const date = article.published_at
                ? new Date(article.published_at)
                : new Date(article.created_at);
              return (
                <Link
                  key={article.id}
                  className="blog-card"
                  href={`/blog/${article.slug}`}
                  aria-label={`Read: ${article.title}`}
                >
                  {article.cover_url && (
                    <div className="thumb">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={article.cover_url} alt={article.title} />
                    </div>
                  )}
                  <div className="body-area">
                    <div className="meta">
                      <time dateTime={date.toISOString().slice(0, 10)}>
                        {date.toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                    <h2 className="title">{article.title}</h2>
                    {article.excerpt && <p className="excerpt">{article.excerpt}</p>}
                  </div>
                </Link>
              );
            })}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
