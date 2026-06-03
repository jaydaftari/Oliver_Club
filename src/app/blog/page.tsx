import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
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

      <main className="main" id="main-content">
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
            {dbArticles.length === 0 ? (
              <p style={{ color: "#6B6558", gridColumn: "1/-1" }}>No discussions published yet.</p>
            ) : (
              dbArticles.map((article) => {
                const date = article.published_at
                  ? new Date(article.published_at)
                  : new Date(article.created_at);
                return (
                  <Link key={article.id} className="blog-card" href={`/blog/${article.slug}`}>
                    {article.cover_url && (
                      <div className="thumb">
                        <Image
                          src={article.cover_url}
                          alt={article.title}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="(max-width: 600px) 100vw, 50vw"
                        />
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
              })
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
