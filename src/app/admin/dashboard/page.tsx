import { getAllArticles, ensureTable } from "@/lib/articles";
import { getSignups } from "@/lib/signups";
import { getApplications } from "@/lib/applications";
import { logout } from "@/app/admin/actions";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";

const adminStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#F5F3EE",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
  color: "#2A2920",
};

const MUTED = "#6B6558";
const RULE = "#E0DCD1";
const RULE_SOFT = "#F0EDE6";

export default async function AdminDashboard() {
  await ensureTable();
  const [articles, signups, applications] = await Promise.all([
    getAllArticles(),
    getSignups(),
    getApplications(),
  ]);

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
          borderBottom: `1px solid ${RULE}`,
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
          <span style={{ color: RULE }}>·</span>
          <span style={{ fontSize: 14, color: MUTED }}>Admin</span>
        </div>
        <form action={logout}>
          <button
            type="submit"
            style={{
              fontSize: 14,
              color: MUTED,
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
        {/* ─── Articles ─── */}
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
              color: MUTED,
              fontSize: 15,
              border: `1px dashed ${RULE}`,
              borderRadius: 8,
            }}
          >
            No articles yet. Create your first one.
          </div>
        ) : (
          <>
            <div
              className="admin-table-wrap"
              style={{
                background: "#fff",
                border: `1px solid ${RULE}`,
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${RULE}` }}>
                    {["#", "Title", "Slug", "Status", "Actions"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "12px 16px",
                          fontSize: 12,
                          color: MUTED,
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
                        borderBottom: i < articles.length - 1 ? `1px solid ${RULE_SOFT}` : "none",
                      }}
                    >
                      <td style={{ padding: "14px 16px", fontSize: 14, color: MUTED, width: 48 }}>
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
                          color: MUTED,
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
                            background: article.published ? "#EAEDDF" : RULE_SOFT,
                            color: article.published ? "#4A5A2A" : MUTED,
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

            <div
              className="admin-card-list"
              style={{
                background: "#fff",
                border: `1px solid ${RULE}`,
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              {articles.map((article, i) => (
                <div
                  key={article.id}
                  style={{
                    padding: 16,
                    borderBottom: i < articles.length - 1 ? `1px solid ${RULE_SOFT}` : "none",
                  }}
                >
                  <div
                    style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}
                  >
                    <span
                      style={{
                        fontSize: 13,
                        color: MUTED,
                        flexShrink: 0,
                        minWidth: 28,
                        paddingTop: 2,
                      }}
                    >
                      {String(article.number).padStart(2, "0")}
                    </span>
                    <span style={{ fontSize: 15, color: "#2A2920", flex: 1, lineHeight: 1.4 }}>
                      {article.title}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        padding: "3px 9px",
                        borderRadius: 20,
                        background: article.published ? "#EAEDDF" : RULE_SOFT,
                        color: article.published ? "#4A5A2A" : MUTED,
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

        {/* ─── Email Signups ─── */}
        <div style={{ marginTop: 56 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 400, margin: 0, letterSpacing: "-0.01em" }}>
              Email signups
            </h2>
            <span style={{ fontSize: 14, color: MUTED }}>
              {signups.length} {signups.length === 1 ? "subscriber" : "subscribers"}
            </span>
          </div>

          {signups.length === 0 ? (
            <div
              style={{
                padding: "60px 0",
                textAlign: "center",
                color: MUTED,
                fontSize: 15,
                border: `1px dashed ${RULE}`,
                borderRadius: 8,
              }}
            >
              No signups yet.
            </div>
          ) : (
            <div
              style={{
                background: "#fff",
                border: `1px solid ${RULE}`,
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${RULE}` }}>
                    {["Email", "Source", "Signed up"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "12px 16px",
                          fontSize: 12,
                          color: MUTED,
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
                  {signups.map((s, i) => (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: i < signups.length - 1 ? `1px solid ${RULE_SOFT}` : "none",
                      }}
                    >
                      <td style={{ padding: "12px 16px", fontSize: 14, color: "#2A2920" }}>
                        {s.email}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: MUTED }}>
                        {s.source ?? "website"}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          color: MUTED,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {new Date(s.signed_up_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ─── Applications ─── */}
        <div style={{ marginTop: 56 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 24,
            }}
          >
            <h2 style={{ fontSize: 22, fontWeight: 400, margin: 0, letterSpacing: "-0.01em" }}>
              Applications
            </h2>
            <span style={{ fontSize: 14, color: MUTED }}>
              {applications.length} {applications.length === 1 ? "application" : "applications"}
            </span>
          </div>

          {applications.length === 0 ? (
            <div
              style={{
                padding: "60px 0",
                textAlign: "center",
                color: MUTED,
                fontSize: 15,
                border: `1px dashed ${RULE}`,
                borderRadius: 8,
              }}
            >
              No applications yet.
            </div>
          ) : (
            <div
              style={{
                background: "#fff",
                border: `1px solid ${RULE}`,
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${RULE}` }}>
                    {[
                      "Name",
                      "Email",
                      "Company / Title",
                      "City",
                      "Phone",
                      "Social",
                      "Source",
                      "Submitted",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "12px 16px",
                          fontSize: 12,
                          color: MUTED,
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
                  {applications.map((a, i) => (
                    <tr
                      key={a.id}
                      style={{
                        borderBottom:
                          i < applications.length - 1 ? `1px solid ${RULE_SOFT}` : "none",
                      }}
                    >
                      <td style={{ padding: "12px 16px", fontSize: 14, color: "#2A2920" }}>
                        {a.name}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: "#2A2920" }}>
                        <a
                          href={`mailto:${a.email}`}
                          style={{ color: "#5B5A3C", textDecoration: "none" }}
                        >
                          {a.email}
                        </a>
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          color: MUTED,
                          maxWidth: 240,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {a.company_title}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: MUTED }}>
                        {a.city ?? "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          color: MUTED,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {a.phone ?? "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          color: MUTED,
                          maxWidth: 200,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {a.social_medias ?? "—"}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          color: MUTED,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {a.source ?? "direct"}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          fontSize: 13,
                          color: MUTED,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {new Date(a.submitted_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
