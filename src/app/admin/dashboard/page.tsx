import { ensureTable, getArticlesPage, countArticles } from "@/lib/articles";
import { getSignupsPage, countSignups } from "@/lib/signups";
import { getApplications, countApplications } from "@/lib/applications";
import { logout } from "@/app/admin/actions";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";
import ApplicationsPanel from "@/components/admin/ApplicationsPanel";
import DashboardNav, { type TabKey } from "@/components/admin/DashboardNav";
import Pager from "@/components/admin/Pager";

const ARTICLES_PAGE_SIZE = 10;
const SIGNUPS_PAGE_SIZE = 20;
const APPLICATIONS_PAGE_SIZE = 25;

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

const adminStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#F5F3EE",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', sans-serif",
  color: "#2A2920",
};

const MUTED = "#6B6558";
const RULE = "#E0DCD1";
const RULE_SOFT = "#F0EDE6";

function one(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}
function toPage(v: string | string[] | undefined): number {
  return Math.max(1, Number.parseInt(one(v) ?? "1", 10) || 1);
}

const emptyBox = (text: string): React.ReactElement => (
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
    {text}
  </div>
);

export default async function AdminDashboard({ searchParams }: { searchParams: SearchParams }) {
  await ensureTable();
  const sp = await searchParams;

  const rawTab = one(sp.tab);
  const tab: TabKey = rawTab === "signups" || rawTab === "applications" ? rawTab : "articles";

  // Cheap counts for the tab badges; full data only for the active tab.
  const [articleCount, signupCount, applicationCount] = await Promise.all([
    countArticles(),
    countSignups(),
    countApplications(),
  ]);

  const articles =
    tab === "articles" ? await getArticlesPage(toPage(sp.aPage), ARTICLES_PAGE_SIZE) : null;
  const signups =
    tab === "signups" ? await getSignupsPage(toPage(sp.sPage), SIGNUPS_PAGE_SIZE) : null;
  const applications =
    tab === "applications"
      ? await getApplications(toPage(sp.appPage), APPLICATIONS_PAGE_SIZE)
      : null;

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

      {/* ── top bar ── */}
      <header
        style={{
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

      {/* ── tabs ── */}
      <DashboardNav
        active={tab}
        counts={{ articles: articleCount, signups: signupCount, applications: applicationCount }}
      />

      <main style={{ padding: "clamp(24px, 4vw, 56px) clamp(16px, 4vw, 60px)" }}>
        {tab === "articles" && articles && <ArticlesSection articles={articles} />}
        {tab === "signups" && signups && <SignupsSection signups={signups} />}
        {tab === "applications" && applications && (
          <ApplicationsPanel
            rows={applications.rows}
            total={applications.total}
            page={applications.page}
            pageCount={applications.pageCount}
            pageSize={applications.pageSize}
          />
        )}
      </main>
    </div>
  );
}

/* ─────────────────────────  Articles  ───────────────────────── */
function ArticlesSection({ articles }: { articles: Awaited<ReturnType<typeof getArticlesPage>> }) {
  return (
    <>
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

      {articles.rows.length === 0 ? (
        emptyBox("No articles yet. Create your first one.")
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
                {articles.rows.map((article, i) => (
                  <tr
                    key={article.id}
                    style={{
                      borderBottom:
                        i < articles.rows.length - 1 ? `1px solid ${RULE_SOFT}` : "none",
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
            {articles.rows.map((article, i) => (
              <div
                key={article.id}
                style={{
                  padding: 16,
                  borderBottom: i < articles.rows.length - 1 ? `1px solid ${RULE_SOFT}` : "none",
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

          <Pager
            page={articles.page}
            pageCount={articles.pageCount}
            total={articles.total}
            pageSize={articles.pageSize}
            noun="articles"
            hrefFor={(p) => `/admin/dashboard?tab=articles&aPage=${p}`}
          />
        </>
      )}
    </>
  );
}

/* ─────────────────────────  Signups  ───────────────────────── */
function SignupsSection({ signups }: { signups: Awaited<ReturnType<typeof getSignupsPage>> }) {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1 style={{ fontSize: 22, fontWeight: 400, margin: 0, letterSpacing: "-0.01em" }}>
          Email signups
        </h1>
        <span style={{ fontSize: 14, color: MUTED }}>
          {signups.total} {signups.total === 1 ? "subscriber" : "subscribers"}
        </span>
      </div>

      {signups.rows.length === 0 ? (
        emptyBox("No signups yet.")
      ) : (
        <>
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
                {signups.rows.map((s, i) => (
                  <tr
                    key={s.id}
                    style={{
                      borderBottom: i < signups.rows.length - 1 ? `1px solid ${RULE_SOFT}` : "none",
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

          <Pager
            page={signups.page}
            pageCount={signups.pageCount}
            total={signups.total}
            pageSize={signups.pageSize}
            noun="subscribers"
            hrefFor={(p) => `/admin/dashboard?tab=signups&sPage=${p}`}
          />
        </>
      )}
    </>
  );
}
