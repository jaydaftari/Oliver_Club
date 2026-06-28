import Link from "next/link";

const MUTED = "#6B6558";
const INK = "#2A2920";
const OLIVE = "#5B5A3C";
const RULE = "#E0DCD1";

export type TabKey = "articles" | "signups" | "applications" | "members" | "events" | "workshops";

const TABS: { key: TabKey; label: string }[] = [
  { key: "articles", label: "Articles" },
  { key: "signups", label: "Email signups" },
  { key: "applications", label: "Applications" },
  { key: "members", label: "Members" },
  { key: "events", label: "Events" },
  { key: "workshops", label: "Workshops" },
];

/** Top navigation tabs for the admin dashboard. */
export default function DashboardNav({
  active,
  counts,
}: {
  active: TabKey;
  counts: Record<TabKey, number>;
}) {
  return (
    <nav
      style={{
        display: "flex",
        gap: 4,
        borderBottom: `1px solid ${RULE}`,
        padding: "0 clamp(16px, 4vw, 60px)",
        background: "#fff",
        overflowX: "auto",
      }}
    >
      {TABS.map((t) => {
        const isActive = t.key === active;
        return (
          <Link
            key={t.key}
            href={`/admin/dashboard?tab=${t.key}`}
            style={{
              position: "relative",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "16px 16px 14px",
              fontSize: 15,
              textDecoration: "none",
              whiteSpace: "nowrap",
              color: isActive ? INK : MUTED,
              borderBottom: isActive ? `2px solid ${OLIVE}` : "2px solid transparent",
              marginBottom: -1,
            }}
          >
            {t.label}
            <span
              style={{
                fontSize: 12,
                color: isActive ? OLIVE : MUTED,
                background: isActive ? "#EAEDDF" : "#F0EDE6",
                borderRadius: 20,
                padding: "1px 8px",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {counts[t.key]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
