import { getAllArticles, ensureTable } from "@/lib/articles";
import { logout } from "@/app/admin/actions";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";

const adminStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#F5F3EE",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
  color: "#2A2920",
};

export default async function AdminDashboard() {
  await ensureTable();
  const articles = await getAllArticles();

  return (
    <div style={adminStyle}>
      <style>{`
        .admin-table-wrap { display: block; }
        .admin-card-list { display: none; }
        @media (max-width: 640px) {
          .admin-table-wrap { display: none; }
          .admin-card-list { display: flex; flex-direction: column; }
        }
      `}</style>

      <header
        style={{
          borderBottom: "1px solid #E0DCD1",
          padding: "0 clamp(16px, 4vw, 60px)",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/" style={{ fontSize: 15, color: "#2A2920", textDecoration: "none" }}>
            Olivier Club
          </Link>
          <span style={{ color: "#E0DCD1" }}>·</span>
          <span style={{ fontSize: 14, color: "#8A8475" }}>Admin</span>
        </div>
        <form action={logout}>
          <button
            type="submit"
            style={{
              fontSize: 14,
              color: "#8A8475",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
              padding: "8px 0",
            }}
          >
            Sign out
          </button>
        </form>
      </header>

      <main style={{ padding: "clamp(24px, 4vw, 56px) clamp(16px, 4vw, 60px)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 24,
            gap: 12,
          }}
        >
          <h1 style={{ fontSize: 22, fontWeight: 400, margin: 0, letterSpacing: "-0.01em" }}>
            Articles
          </h1>
          <Link
            href="/admin/dashboard/new"
            style={{
              padding: "10px 18px",
              background: "#5B5A3C",
              color: "#fff",
              borderRadius: 6,
              fontSize: 14,
              textDecoration: "none",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            + New article
          </Link>
        </div>

        {articles.length === 0 ? (
          <div
            style={{
              padding: "60px 0",
              textAlign: "center",
              color: "#8A8475",
              fontSize: 15,
              border: "1px dashed #E0DCD1",
              borderRadius: 8,
            }}
          >
            No articles yet. Create your first one.
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div
              className="admin-table-wrap"
              style={{
                background: "#fff",
                border: "1px solid #E0DCD1",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #E0DCD1" }}>
                    {["#", "Title", "Slug", "Status", "Actions"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "12px 16px",
                          fontSize: 12,
                          color: "#8A8475",
                          fontWeight: 400,
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article, i) => (
                    <tr
                      key={article.id}
                      style={{
                        borderBottom: i < articles.length - 1 ? "1px solid #F0EDE6" : "none",
                      }}
                    >
                      <td
                        style={{ padding: "14px 16px", fontSize: 14, color: "#8A8475", width: 48 }}
                      >
                        {String(article.number).padStart(2, "0")}
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontSize: 15,
                          color: "#2A2920",
                          maxWidth: 280,
                        }}
                      >
                        <span
                          style={{
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {article.title}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "14px 16px",
                          fontSize: 13,
                          color: "#8A8475",
                          fontFamily: "ui-monospace, monospace",
                        }}
                      >
                        {article.slug}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <span
                          style={{
                            fontSize: 12,
                            padding: "3px 9px",
                            borderRadius: 20,
                            background: article.published ? "#EAEDDF" : "#F0EDE6",
                            color: article.published ? "#4A5A2A" : "#8A8475",
                            fontWeight: 500,
                          }}
                        >
                          {article.published ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <Link
                            href={`/admin/dashboard/${article.id}`}
                            style={{
                              fontSize: 13,
                              color: "#5B5A3C",
                              textDecoration: "none",
                              padding: "8px 14px",
                              border: "1px solid #C8C4B0",
                              borderRadius: 5,
                              background: "#fff",
                              fontFamily: "inherit",
                              lineHeight: 1,
                            }}
                          >
                            Edit
                          </Link>
                          <DeleteButton id={article.id} title={article.title} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div
              className="admin-card-list"
              style={{
                background: "#fff",
                border: "1px solid #E0DCD1",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              {articles.map((article, i) => (
                <div
                  key={article.id}
                  style={{
                    padding: "16px",
                    borderBottom: i < articles.length - 1 ? "1px solid #F0EDE6" : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        color: "#8A8475",
                        flexShrink: 0,
                        minWidth: 28,
                        paddingTop: 2,
                      }}
                    >
                      {String(article.number).padStart(2, "0")}
                    </span>
                    <span
                      style={{
                        fontSize: 15,
                        color: "#2A2920",
                        flex: 1,
                        lineHeight: 1.4,
                      }}
                    >
                      {article.title}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        padding: "3px 9px",
                        borderRadius: 20,
                        background: article.published ? "#EAEDDF" : "#F0EDE6",
                        color: article.published ? "#4A5A2A" : "#8A8475",
                        fontWeight: 500,
                        flexShrink: 0,
                      }}
                    >
                      {article.published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 8, paddingLeft: 38 }}>
                    <Link
                      href={`/admin/dashboard/${article.id}`}
                      style={{
                        fontSize: 13,
                        color: "#5B5A3C",
                        textDecoration: "none",
                        padding: "8px 16px",
                        border: "1px solid #C8C4B0",
                        borderRadius: 5,
                        background: "#fff",
                      }}
                    >
                      Edit
                    </Link>
                    <DeleteButton id={article.id} title={article.title} />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
