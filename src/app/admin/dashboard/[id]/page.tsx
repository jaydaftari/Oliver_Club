import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { getArticleById } from "@/lib/articles";
import ArticleForm from "@/components/admin/ArticleForm";

const adminStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#F5F3EE",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
  color: "#2A2920",
};

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const article = await getArticleById(parseInt(id, 10));
  if (!article) notFound();

  return (
    <div style={adminStyle}>
      <header
        style={{
          borderBottom: "1px solid #E0DCD1",
          padding: "0 clamp(16px, 4vw, 60px)",
          height: 64,
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "#fff",
        }}
      >
        <Link
          href="/admin/dashboard"
          style={{ fontSize: 14, color: "#8A8475", textDecoration: "none" }}
        >
          ← Articles
        </Link>
        <span style={{ color: "#E0DCD1" }}>·</span>
        <span
          style={{
            fontSize: 14,
            color: "#2A2920",
            maxWidth: 280,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {article.title}
        </span>
      </header>

      <main style={{ padding: "clamp(24px, 4vw, 56px) clamp(16px, 4vw, 60px)" }}>
        <h1 style={{ fontSize: 22, fontWeight: 400, margin: "0 0 32px", letterSpacing: "-0.01em" }}>
          Edit article
        </h1>
        <ArticleForm article={article} />
      </main>
    </div>
  );
}
