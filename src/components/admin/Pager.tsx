import Link from "next/link";

const MUTED = "#6B6558";
const INK = "#2A2920";
const RULE = "#E0DCD1";
const RULE_SOFT = "#F0EDE6";

type Props = {
  page: number;
  pageCount: number;
  total: number;
  pageSize: number;
  noun: string;
  hrefFor: (page: number) => string;
};

/** Server-rendered prev/next pagination for the admin tables. */
export default function Pager({ page, pageCount, total, pageSize, noun, hrefFor }: Props) {
  if (pageCount <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 16,
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      <span style={{ fontSize: 13, color: MUTED }}>
        {from}–{to} of {total} {noun}
      </span>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <PageLink targetPage={page - 1} disabled={page <= 1} hrefFor={hrefFor}>
          ← Prev
        </PageLink>
        <span style={{ fontSize: 13, color: MUTED }}>
          {page} / {pageCount}
        </span>
        <PageLink targetPage={page + 1} disabled={page >= pageCount} hrefFor={hrefFor}>
          Next →
        </PageLink>
      </div>
    </div>
  );
}

function PageLink({
  targetPage,
  disabled,
  hrefFor,
  children,
}: {
  targetPage: number;
  disabled: boolean;
  hrefFor: (page: number) => string;
  children: React.ReactNode;
}) {
  const style: React.CSSProperties = {
    fontSize: 13,
    fontFamily: "inherit",
    padding: "8px 14px",
    background: disabled ? RULE_SOFT : "#fff",
    border: `1px solid ${RULE}`,
    borderRadius: 6,
    color: disabled ? "#BDB7A6" : INK,
    textDecoration: "none",
    pointerEvents: disabled ? "none" : "auto",
  };
  if (disabled) return <span style={style}>{children}</span>;
  return (
    <Link href={hrefFor(targetPage)} style={style}>
      {children}
    </Link>
  );
}
