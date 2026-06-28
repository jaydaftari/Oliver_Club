"use client";

import { useState, useTransition } from "react";
import type { Member } from "@/lib/members";
import {
  addMemberAction,
  approveMemberAction,
  resetMemberAction,
  setStatusAction,
  setFoundingAction,
  deleteMemberAction,
  type MemberActionState,
} from "@/app/admin/dashboard/members-actions";

const INK = "#2A2920";
const MUTED = "#6B6558";
const OLIVE = "#5B5A3C";
const RULE = "#E0DCD1";
const RULE_SOFT = "#F0EDE6";

type ServerAction = (prev: MemberActionState, formData: FormData) => Promise<MemberActionState>;

const STATUS_STYLE: Record<Member["status"], { bg: string; fg: string; label: string }> = {
  active: { bg: "#EAEDDF", fg: "#4A5A2A", label: "Active" },
  pending: { bg: "#FBF1DC", fg: "#8A6A1F", label: "Pending" },
  suspended: { bg: "#F4E2DD", fg: "#A4503A", label: "Suspended" },
};

function fmtDate(s: string | null): string {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MembersPanel({ members }: { members: Member[] }) {
  const [banner, setBanner] = useState<MemberActionState>(null);
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  function run(action: ServerAction, fd: FormData) {
    setCopied(false);
    startTransition(async () => {
      setBanner(await action(null, fd));
    });
  }

  async function copyLink(link: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 400, margin: 0, letterSpacing: "-0.01em" }}>
            Members
          </h1>
          <p style={{ fontSize: 13, color: MUTED, margin: "6px 0 0" }}>
            Add an email, approve it, then send the member their one-time setup link.
          </p>
        </div>
      </div>

      {/* Add member */}
      <form
        action={(fd) => run(addMemberAction, fd)}
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "flex-end",
          background: "#fff",
          border: `1px solid ${RULE}`,
          borderRadius: 8,
          padding: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "grid", gap: 6, flex: "1 1 240px" }}>
          <label style={{ fontSize: 12, color: MUTED }} htmlFor="m-email">
            Email
          </label>
          <input
            id="m-email"
            name="email"
            type="email"
            required
            placeholder="founder@example.com"
            style={inputStyle}
          />
        </div>
        <div style={{ display: "grid", gap: 6, flex: "1 1 180px" }}>
          <label style={{ fontSize: 12, color: MUTED }} htmlFor="m-name">
            Name (optional)
          </label>
          <input
            id="m-name"
            name="name"
            type="text"
            placeholder="Shel Larsson"
            style={inputStyle}
          />
        </div>
        <button type="submit" disabled={pending} style={primaryBtn(pending)}>
          {pending ? "Working…" : "Add member"}
        </button>
      </form>

      {/* Result banner */}
      {banner && (
        <div
          style={{
            background: banner.ok ? "#fff" : "#FBEAE5",
            border: `1px solid ${banner.ok ? "#CFE0B8" : "#E7C3B8"}`,
            borderRadius: 8,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <p style={{ margin: 0, fontSize: 14, color: banner.ok ? "#4A5A2A" : "#A4503A" }}>
            {banner.ok ? banner.message : banner.error}
          </p>

          {banner.ok && banner.link && (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <input
                  readOnly
                  value={banner.link}
                  onFocus={(e) => e.currentTarget.select()}
                  style={{
                    ...inputStyle,
                    flex: "1 1 320px",
                    fontFamily: "ui-monospace, monospace",
                    fontSize: 13,
                  }}
                />
                <button type="button" onClick={() => copyLink(banner.link!)} style={secondaryBtn}>
                  {copied ? "Copied ✓" : "Copy link"}
                </button>
                {banner.email && (
                  <a
                    href={`mailto:${banner.email}?subject=${encodeURIComponent(
                      "Your Olivier Club access"
                    )}&body=${encodeURIComponent(
                      `Welcome to Olivier Club.\n\nSet your password using this secure one-time link (expires in 7 days):\n${banner.link}\n\nThen sign in at the member dashboard.`
                    )}`}
                    style={{
                      ...secondaryBtn,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                    }}
                  >
                    Email member
                  </a>
                )}
              </div>
              <p style={{ margin: "8px 0 0", fontSize: 12, color: MUTED }}>
                The member opens this link and chooses their own password. Passwords are never sent
                by email.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Member list */}
      {members.length === 0 ? (
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
          No members yet. Add the first one above.
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            border: `1px solid ${RULE}`,
            borderRadius: 8,
            overflowX: "auto",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${RULE}` }}>
                {["Email", "Status", "Password", "Last login", "Actions"].map((h) => (
                  <th key={h} style={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => {
                const st = STATUS_STYLE[m.status];
                const last = i === members.length - 1;
                return (
                  <tr key={m.id} style={{ borderBottom: last ? "none" : `1px solid ${RULE_SOFT}` }}>
                    <td style={{ ...td, color: INK }}>
                      <div style={{ fontWeight: 500 }}>{m.email}</div>
                      {m.name && <div style={{ fontSize: 12, color: MUTED }}>{m.name}</div>}
                      {m.reset_requested_at && (
                        <div style={{ fontSize: 11, color: "#A4503A", marginTop: 3 }}>
                          ⚠ Reset requested {fmtDate(m.reset_requested_at)}
                        </div>
                      )}
                    </td>
                    <td style={td}>
                      <span
                        style={{
                          fontSize: 12,
                          padding: "3px 9px",
                          borderRadius: 20,
                          background: st.bg,
                          color: st.fg,
                          fontWeight: 500,
                        }}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td style={{ ...td, fontSize: 13, color: MUTED }}>
                      {m.has_password ? "Set" : m.token_expires ? "Link sent" : "—"}
                    </td>
                    <td style={{ ...td, fontSize: 13, color: MUTED, whiteSpace: "nowrap" }}>
                      {fmtDate(m.last_login_at)}
                    </td>
                    <td style={td}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {m.status === "pending" && (
                          <RowButton
                            action={approveMemberAction}
                            member={m}
                            run={run}
                            label="Approve"
                            variant="primary"
                          />
                        )}
                        {m.status === "active" && (
                          <RowButton
                            action={resetMemberAction}
                            member={m}
                            run={run}
                            label={m.has_password ? "Reset link" : "Resend link"}
                          />
                        )}
                        {m.status === "active" && (
                          <RowButton
                            action={setFoundingAction}
                            member={m}
                            run={run}
                            label={m.founding ? "★ Founding" : "Mark founding"}
                            founding={(!m.founding).toString()}
                          />
                        )}
                        {m.status !== "suspended" ? (
                          <RowButton
                            action={setStatusAction}
                            member={m}
                            run={run}
                            label="Suspend"
                            status="suspended"
                          />
                        ) : (
                          <RowButton
                            action={setStatusAction}
                            member={m}
                            run={run}
                            label="Re-activate"
                            status="active"
                          />
                        )}
                        <RowButton
                          action={deleteMemberAction}
                          member={m}
                          run={run}
                          label="Delete"
                          variant="danger"
                          confirm={`Remove ${m.email}? This cannot be undone.`}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function RowButton({
  action,
  member,
  run,
  label,
  variant,
  status,
  founding,
  confirm,
}: {
  action: ServerAction;
  member: Member;
  run: (action: ServerAction, fd: FormData) => void;
  label: string;
  variant?: "primary" | "danger";
  status?: string;
  founding?: string;
  confirm?: string;
}) {
  return (
    <form
      action={(fd) => {
        if (confirm && !window.confirm(confirm)) return;
        run(action, fd);
      }}
    >
      <input type="hidden" name="id" value={member.id} />
      <input type="hidden" name="email" value={member.email} />
      {status && <input type="hidden" name="status" value={status} />}
      {founding && <input type="hidden" name="founding" value={founding} />}
      <button type="submit" style={rowBtn(variant)}>
        {label}
      </button>
    </form>
  );
}

/* ── styles ── */
const inputStyle: React.CSSProperties = {
  fontFamily: "inherit",
  fontSize: 14,
  padding: "10px 12px",
  background: "#fff",
  border: `1px solid ${RULE}`,
  borderRadius: 6,
  color: INK,
  outline: "none",
};

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "12px 16px",
  fontSize: 12,
  color: MUTED,
  fontWeight: 400,
  letterSpacing: "0.04em",
  textTransform: "uppercase",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = { padding: "14px 16px", fontSize: 14, verticalAlign: "top" };

function primaryBtn(pending: boolean): React.CSSProperties {
  return {
    padding: "10px 18px",
    background: pending ? "#8A8475" : OLIVE,
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontSize: 14,
    fontFamily: "inherit",
    cursor: pending ? "not-allowed" : "pointer",
    whiteSpace: "nowrap",
  };
}

const secondaryBtn: React.CSSProperties = {
  padding: "10px 16px",
  background: "#fff",
  color: OLIVE,
  border: `1px solid #C8C4B0`,
  borderRadius: 6,
  fontSize: 13,
  fontFamily: "inherit",
  cursor: "pointer",
  whiteSpace: "nowrap",
};

function rowBtn(variant?: "primary" | "danger"): React.CSSProperties {
  const base: React.CSSProperties = {
    fontSize: 12.5,
    padding: "6px 12px",
    borderRadius: 5,
    fontFamily: "inherit",
    cursor: "pointer",
    lineHeight: 1,
    whiteSpace: "nowrap",
  };
  if (variant === "primary") return { ...base, background: OLIVE, color: "#fff", border: "none" };
  if (variant === "danger")
    return { ...base, background: "#fff", color: "#A4503A", border: "1px solid #E0C2B8" };
  return { ...base, background: "#fff", color: OLIVE, border: "1px solid #C8C4B0" };
}
