import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import ArticleForm from "@/components/admin/ArticleForm";

const adminStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#F5F3EE",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
  color: "#2A2920",
};

export default async function NewArticlePage() {
  await requireAdmin();
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
        <span style={{ fontSize: 14, color: "#2A2920" }}>New article</span>
      </header>

      <main style={{ padding: "clamp(24px, 4vw, 56px) clamp(16px, 4vw, 60px)" }}>
        <h1 style={{ fontSize: 22, fontWeight: 400, margin: "0 0 32px", letterSpacing: "-0.01em" }}>
          New article
        </h1>
        <ArticleForm />
      </main>
    </div>
  );
}
