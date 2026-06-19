"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Application } from "@/lib/applications";

const MUTED = "#6B6558";
const INK = "#2A2920";
const OLIVE = "#5B5A3C";
const RULE = "#E0DCD1";
const RULE_SOFT = "#F0EDE6";

const SOURCE_LABELS: Record<string, string> = {
  "global-networking": "Global Networking",
  "social-wellness": "Social Wellness",
  "market-intelligence": "Market Intelligence",
  direct: "Direct",
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Long-form Hero Journey answers, in display order. */
const ANSWER_FIELDS: { key: keyof Application; label: string }[] = [
  { key: "conflict", label: "Their conflict" },
  { key: "solution", label: "Vision of the solution" },
  { key: "path", label: "What led them here" },
  { key: "leader", label: "On becoming a leader" },
  { key: "teach", label: "What they can teach" },
];

const CLIENT_PAGE_SIZES = [10, 25, 50];

type Props = {
  rows: Application[];
  total: number;
  page: number; // server page (1-based)
  pageCount: number; // server page count
  pageSize: number; // server page size
};

export default function ApplicationsPanel({ rows, total, page, pageCount, pageSize }: Props) {
  const [query, setQuery] = useState("");
  const [clientPageSize, setClientPageSize] = useState(10);
  const [clientPage, setClientPage] = useState(1);
  const [expanded, setExpanded] = useState<number | null>(null);

  // ── client-side filtering over the loaded server page ──
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((a) => {
      const hay = [
        a.identity,
        a.email,
        a.source,
        a.links,
        a.conflict,
        a.solution,
        a.path,
        a.leader,
        a.teach,
        a.name,
        a.company_title,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [rows, query]);

  // ── client-side sub-pagination over the filtered set ──
  const clientPageCount = Math.max(1, Math.ceil(filtered.length / clientPageSize));
  const safeClientPage = Math.min(clientPage, clientPageCount);
  const start = (safeClientPage - 1) * clientPageSize;
  const pageRows = filtered.slice(start, start + clientPageSize);

  const rangeStart = (page - 1) * pageSize;

  function resetClient(next: () => void) {
    setExpanded(null);
    next();
  }

  return (
    <div id="applications" style={{ marginTop: 56, scrollMarginTop: 24 }}>
      <style>{`
        .oc-app-row:hover { background: #FAF9F5; }
        .oc-app-toggle { cursor: pointer; }
        .oc-input:focus { outline: none; border-color: ${OLIVE}; box-shadow: 0 0 0 3px rgba(91,90,60,0.12); }
        .oc-pgbtn:hover:not([data-disabled="true"]) { background: #EFEDE6; }
        @media (max-width: 720px) {
          .oc-app-table .oc-hide-sm { display: none; }
        }
      `}</style>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 400, margin: 0, letterSpacing: "-0.01em" }}>
          Applications
        </h2>
        <span style={{ fontSize: 14, color: MUTED }}>
          {total} total{" "}
          {total > pageSize && (
            <>
              · showing {rangeStart + 1}–{rangeStart + rows.length}
            </>
          )}
        </span>
      </div>

      {total === 0 ? (
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
        <>
          {/* ── client-side controls: search + page size ── */}
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
              margin: "14px 0",
            }}
          >
            <input
              className="oc-input"
              value={query}
              onChange={(e) => resetClient(() => (setQuery(e.target.value), setClientPage(1)))}
              placeholder="Search this page — identity, email, answers…"
              style={{
                flex: "1 1 280px",
                fontSize: 14,
                fontFamily: "inherit",
                padding: "10px 14px",
                background: "#fff",
                border: `1px solid ${RULE}`,
                borderRadius: 6,
                color: INK,
                transition: "border-color 120ms, box-shadow 120ms",
              }}
            />
            <label
              style={{ fontSize: 13, color: MUTED, display: "flex", gap: 8, alignItems: "center" }}
            >
              Rows
              <select
                value={clientPageSize}
                onChange={(e) =>
                  resetClient(() => (setClientPageSize(Number(e.target.value)), setClientPage(1)))
                }
                style={{
                  fontFamily: "inherit",
                  fontSize: 14,
                  padding: "8px 10px",
                  background: "#fff",
                  border: `1px solid ${RULE}`,
                  borderRadius: 6,
                  color: INK,
                }}
              >
                {CLIENT_PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div
            style={{
              background: "#fff",
              border: `1px solid ${RULE}`,
              borderRadius: 8,
              overflow: "hidden",
            }}
          >
            <table className="oc-app-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${RULE}` }}>
                  {["Identity", "Email", "Source", "Submitted", ""].map((h, i) => (
                    <th
                      key={h || "act"}
                      className={i === 2 || i === 3 ? "oc-hide-sm" : undefined}
                      style={{
                        textAlign: i === 4 ? "right" : "left",
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
                {pageRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: "40px 16px",
                        textAlign: "center",
                        color: MUTED,
                        fontSize: 14,
                      }}
                    >
                      No matches on this page.
                    </td>
                  </tr>
                ) : (
                  pageRows.map((a) => {
                    const isOpen = expanded === a.id;
                    return (
                      <FragmentRow
                        key={a.id}
                        a={a}
                        isOpen={isOpen}
                        onToggle={() => setExpanded(isOpen ? null : a.id)}
                      />
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── client-side sub-pagination ── */}
          {filtered.length > clientPageSize && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 14,
                gap: 12,
              }}
            >
              <span style={{ fontSize: 13, color: MUTED }}>
                {start + 1}–{Math.min(start + clientPageSize, filtered.length)} of {filtered.length}
                {query && " matches"}
              </span>
              <div style={{ display: "flex", gap: 8 }}>
                <PgButton
                  disabled={safeClientPage <= 1}
                  onClick={() => resetClient(() => setClientPage((p) => Math.max(1, p - 1)))}
                >
                  ← Prev
                </PgButton>
                <span style={{ fontSize: 13, color: MUTED, alignSelf: "center" }}>
                  {safeClientPage} / {clientPageCount}
                </span>
                <PgButton
                  disabled={safeClientPage >= clientPageCount}
                  onClick={() =>
                    resetClient(() => setClientPage((p) => Math.min(clientPageCount, p + 1)))
                  }
                >
                  Next →
                </PgButton>
              </div>
            </div>
          )}

          {/* ── server-side pagination (navigates the full dataset) ── */}
          {pageCount > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginTop: 20,
                paddingTop: 16,
                borderTop: `1px solid ${RULE_SOFT}`,
                gap: 12,
              }}
            >
              <span style={{ fontSize: 13, color: MUTED }}>
                Server page {page} of {pageCount}
              </span>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <ServerPageLink targetPage={page - 1} disabled={page <= 1}>
                  ← Newer
                </ServerPageLink>
                <ServerPageLink targetPage={page + 1} disabled={page >= pageCount}>
                  Older →
                </ServerPageLink>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── a summary row plus its expandable detail row ── */
function FragmentRow({
  a,
  isOpen,
  onToggle,
}: {
  a: Application;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const answers = ANSWER_FIELDS.map((f) => ({ label: f.label, value: a[f.key] as string | null }));
  const hasDetail = answers.some((x) => x.value) || a.links || a.name || a.company_title;

  return (
    <>
      <tr className="oc-app-row" style={{ borderBottom: `1px solid ${RULE_SOFT}` }}>
        <td style={{ padding: "12px 16px", fontSize: 14, color: INK, fontWeight: 500 }}>
          {a.identity || a.name || "—"}
        </td>
        <td style={{ padding: "12px 16px", fontSize: 13 }}>
          <a href={`mailto:${a.email}`} style={{ color: OLIVE, textDecoration: "none" }}>
            {a.email}
          </a>
        </td>
        <td className="oc-hide-sm" style={{ padding: "12px 16px", fontSize: 13, color: MUTED }}>
          {a.source ? (SOURCE_LABELS[a.source] ?? a.source) : "—"}
        </td>
        <td
          className="oc-hide-sm"
          style={{ padding: "12px 16px", fontSize: 13, color: MUTED, whiteSpace: "nowrap" }}
        >
          {fmtDate(a.submitted_at)}
        </td>
        <td style={{ padding: "12px 16px", textAlign: "right" }}>
          {hasDetail && (
            <button
              className="oc-app-toggle"
              onClick={onToggle}
              aria-expanded={isOpen}
              style={{
                fontSize: 13,
                color: OLIVE,
                background: "#fff",
                border: `1px solid ${RULE}`,
                borderRadius: 5,
                padding: "6px 12px",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              {isOpen ? "Hide" : "View"}
            </button>
          )}
        </td>
      </tr>
      {isOpen && (
        <tr style={{ borderBottom: `1px solid ${RULE_SOFT}`, background: "#FBFAF6" }}>
          <td colSpan={5} style={{ padding: "8px 16px 22px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "18px 28px",
                maxWidth: 980,
              }}
            >
              {answers
                .filter((x) => x.value)
                .map((x) => (
                  <DetailBlock key={x.label} label={x.label} value={x.value!} />
                ))}
              {a.links && <DetailBlock label="Links" value={a.links} link />}
              {(a.name || a.company_title || a.phone || a.city) && (
                <DetailBlock
                  label="Legacy contact info"
                  value={[a.name, a.company_title, a.phone, a.city].filter(Boolean).join(" · ")}
                />
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

function DetailBlock({ label, value, link }: { label: string; value: string; link?: boolean }) {
  return (
    <div>
      <p
        style={{
          fontSize: 11,
          color: MUTED,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          margin: "0 0 5px",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 14,
          color: INK,
          lineHeight: 1.5,
          margin: 0,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {link ? (
          <a href={ensureHref(value)} target="_blank" rel="noreferrer" style={{ color: OLIVE }}>
            {value}
          </a>
        ) : (
          value
        )}
      </p>
    </div>
  );
}

function ensureHref(v: string): string {
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

function PgButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="oc-pgbtn"
      data-disabled={disabled ? "true" : "false"}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      style={{
        fontSize: 13,
        fontFamily: "inherit",
        padding: "8px 14px",
        background: "#fff",
        border: `1px solid ${RULE}`,
        borderRadius: 6,
        color: disabled ? "#BDB7A6" : INK,
        cursor: disabled ? "default" : "pointer",
        transition: "background 120ms",
      }}
    >
      {children}
    </button>
  );
}

function ServerPageLink({
  targetPage,
  disabled,
  children,
}: {
  targetPage: number;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const style: React.CSSProperties = {
    fontSize: 13,
    fontFamily: "inherit",
    padding: "8px 14px",
    background: "#fff",
    border: `1px solid ${RULE}`,
    borderRadius: 6,
    color: disabled ? "#BDB7A6" : INK,
    textDecoration: "none",
    cursor: disabled ? "default" : "pointer",
    pointerEvents: disabled ? "none" : "auto",
  };
  if (disabled) return <span style={style}>{children}</span>;
  return (
    <Link
      className="oc-pgbtn"
      href={`/admin/dashboard?tab=applications&appPage=${targetPage}`}
      style={style}
    >
      {children}
    </Link>
  );
}
