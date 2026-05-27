import { notFound } from "next/navigation";
import { cache } from "react";
import type { Metadata } from "next";
import sanitizeHtml from "sanitize-html";
import BackLink from "@/components/BackLink";
import Footer from "@/components/Footer";
import { getArticleBySlug, getPublishedArticles } from "@/lib/articles";

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img",
    "h1",
    "h2",
    "h3",
    "h4",
    "figure",
    "figcaption",
    "iframe",
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    img: ["src", "alt", "width", "height", "loading", "class"],
    iframe: ["src", "width", "height", "frameborder", "allow", "allowfullscreen", "class"],
    a: ["href", "rel", "target", "class"],
    "*": ["class", "style"],
  },
  allowedIframeHostnames: ["www.youtube.com", "player.vimeo.com"],
};

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://olivierclub.com";

const fetchArticle = cache(getArticleBySlug);

export async function generateStaticParams() {
  const articles = await getPublishedArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await fetchArticle(slug);
  if (!article) return { title: "Not found" };

  const url = `${BASE_URL}/blog/${slug}`;
  return {
    title: article.title,
    description: article.excerpt || undefined,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: article.title,
      description: article.excerpt || undefined,
      publishedTime: article.published_at ?? article.created_at,
      siteName: "Olivier Club",
      images: article.cover_url ? [{ url: article.cover_url, alt: article.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.title,
      description: article.excerpt || undefined,
      images: article.cover_url ? [article.cover_url] : undefined,
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await fetchArticle(slug);
  if (!article) notFound();

  const date = article.published_at ? new Date(article.published_at) : new Date(article.created_at);
  const dateStr = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dateIso = date.toISOString().slice(0, 10);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt || undefined,
    image: article.cover_url || undefined,
    datePublished: date.toISOString(),
    url: `${BASE_URL}/blog/${slug}`,
    publisher: {
      "@type": "Organization",
      name: "Olivier Club",
      url: BASE_URL,
    },
  };

  return (
    <div className="page blog-post-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <BackLink href="/blog" label="Back to Blog" />

      <main className="main" id="main-content">
        <article className="container">
          <div className="article">
            {article.cover_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="article-cover" src={article.cover_url} alt={article.title} />
            )}

            <header className="article-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span
                  style={{
                    fontSize: 13,
                    color: "#6B6558",
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "0.02em",
                  }}
                >
                  {String(article.number).padStart(2, "0")}
                </span>
              </div>
              <h1>{article.title}</h1>
              <div className="meta">
                <time dateTime={dateIso}>{dateStr}</time>
              </div>
            </header>

            {article.excerpt && (
              <p
                style={{
                  fontSize: 18,
                  lineHeight: 1.6,
                  color: "#4A4738",
                  fontStyle: "italic",
                  margin: "0 0 32px",
                  borderLeft: "3px solid #E0DCD1",
                  paddingLeft: 20,
                }}
              >
                {article.excerpt}
              </p>
            )}

            {article.content ? (
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitizeHtml(article.content, SANITIZE_OPTIONS),
                }}
              />
            ) : (
              <p style={{ color: "#8A8475" }}>No content yet.</p>
            )}
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
