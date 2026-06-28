"use client";

import { useState, useTransition } from "react";
import type { AdminEvent, ClubEvent } from "@/lib/club";
import { CATEGORY_LABELS, type EventCategory } from "@/lib/club-constants";
import {
  createEventAction,
  updateEventAction,
  deleteEventAction,
  type EventActionState,
} from "@/app/admin/dashboard/events-actions";

const INK = "#2A2920";
const MUTED = "#6B6558";
const OLIVE = "#5B5A3C";
const RULE = "#E0DCD1";
const RULE_SOFT = "#F0EDE6";

const CATEGORIES: EventCategory[] = ["pitch", "workshop", "strategic", "other"];

/** ISO → value for <input type="datetime-local"> in the viewer's local zone. */
function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes()
  )}`;
}

function fmtWhen(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function EventsPanel({ events }: { events: AdminEvent[] }) {
  const [editing, setEditing] = useState<ClubEvent | null>(null);
  const [banner, setBanner] = useState<EventActionState>(null);
  const [pending, startTransition] = useTransition();
  // Remount the form when switching between create / edit so defaultValues reset.
  const formKey = editing ? `edit-${editing.id}` : "create";

  function submit(fd: FormData) {
    startTransition(async () => {
      const res = editing ? await updateEventAction(null, fd) : await createEventAction(null, fd);
      setBanner(res);
      if (res?.ok) setEditing(null);
    });
  }

  function remove(ev: ClubEvent) {
    if (!window.confirm(`Delete "${ev.title}"?`)) return;
    const fd = new FormData();
    fd.set("id", String(ev.id));
    startTransition(async () => {
      setBanner(await deleteEventAction(null, fd));
      if (editing?.id === ev.id) setEditing(null);
    });
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 400, margin: 0, letterSpacing: "-0.01em" }}>
          Events
        </h1>
        <p style={{ fontSize: 13, color: MUTED, margin: "6px 0 0" }}>
          Events you publish here appear on every member&apos;s dashboard with live RSVP counts.
        </p>
      </div>

      {/* Create / edit form */}
      <form
        key={formKey}
        action={submit}
        style={{
          background: "#fff",
          border: `1px solid ${RULE}`,
          borderRadius: 8,
          padding: 16,
          marginBottom: 20,
          display: "grid",
          gap: 12,
        }}
      >
        {editing && <input type="hidden" name="id" value={editing.id} />}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 6, flex: "2 1 260px" }}>
            <label style={lbl} htmlFor="e-title">
              Title
            </label>
            <input
              id="e-title"
              name="title"
              required
              defaultValue={editing?.title ?? ""}
              placeholder="Founders Pitch Night"
              style={inputStyle}
            />
          </div>
          <div style={{ display: "grid", gap: 6, flex: "1 1 160px" }}>
            <label style={lbl} htmlFor="e-cat">
              Category
            </label>
            <select
              id="e-cat"
              name="category"
              defaultValue={editing?.category ?? "other"}
              style={inputStyle}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "grid", gap: 6, flex: "1 1 200px" }}>
            <label style={lbl} htmlFor="e-date">
              Date &amp; time
            </label>
            <input
              id="e-date"
              name="starts_at"
              type="datetime-local"
              required
              defaultValue={editing ? toLocalInput(editing.starts_at) : ""}
              style={inputStyle}
            />
          </div>
          <div style={{ display: "grid", gap: 6, flex: "2 1 260px" }}>
            <label style={lbl} htmlFor="e-loc">
              Location
            </label>
            <input
              id="e-loc"
              name="location"
              defaultValue={editing?.location ?? ""}
              placeholder="19:00 · Olivier House, Lisbon"
              style={inputStyle}
            />
          </div>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <label style={lbl} htmlFor="e-desc">
            Description (optional)
          </label>
          <textarea
            id="e-desc"
            name="description"
            rows={2}
            defaultValue={editing?.description ?? ""}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button type="submit" disabled={pending} style={primaryBtn(pending)}>
            {pending ? "Saving…" : editing ? "Save changes" : "Add event"}
          </button>
          {editing && (
            <button type="button" onClick={() => setEditing(null)} style={secondaryBtn}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {banner && (
        <p
          style={{
            margin: "0 0 16px",
            fontSize: 13.5,
            color: banner.ok ? "#4A5A2A" : "#A4503A",
          }}
        >
          {banner.message}
        </p>
      )}

      {/* Event list */}
      {events.length === 0 ? (
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
          No events yet. Add the first one above.
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
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${RULE}` }}>
                {["Event", "Category", "When", "Actions"].map((h) => (
                  <th key={h} style={th}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((ev, i) => {
                const past = ev.past;
                return (
                  <tr
                    key={ev.id}
                    style={{
                      borderBottom: i < events.length - 1 ? `1px solid ${RULE_SOFT}` : "none",
                    }}
                  >
                    <td style={{ ...td, color: INK }}>
                      <div style={{ fontWeight: 500 }}>{ev.title}</div>
                      {ev.location && (
                        <div style={{ fontSize: 12, color: MUTED }}>{ev.location}</div>
                      )}
                    </td>
                    <td style={{ ...td, fontSize: 13, color: MUTED }}>
                      {CATEGORY_LABELS[ev.category]}
                    </td>
                    <td style={{ ...td, fontSize: 13, color: MUTED, whiteSpace: "nowrap" }}>
                      {fmtWhen(ev.starts_at)}
                      {past && <span style={{ marginLeft: 8, color: "#A0907A" }}>· past</span>}
                    </td>
                    <td style={td}>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <button type="button" onClick={() => setEditing(ev)} style={rowBtn()}>
                          Edit
                        </button>
                        <button type="button" onClick={() => remove(ev)} style={rowBtn("danger")}>
                          Delete
                        </button>
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

/* ── styles ── */
const lbl: React.CSSProperties = { fontSize: 12, color: MUTED };
const inputStyle: React.CSSProperties = {
  fontFamily: "inherit",
  fontSize: 14,
  padding: "10px 12px",
  background: "#fff",
  border: `1px solid ${RULE}`,
  borderRadius: 6,
  color: INK,
  outline: "none",
  width: "100%",
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
  color: MUTED,
  border: `1px solid #C8C4B0`,
  borderRadius: 6,
  fontSize: 13,
  fontFamily: "inherit",
  cursor: "pointer",
};
function rowBtn(variant?: "danger"): React.CSSProperties {
  const base: React.CSSProperties = {
    fontSize: 12.5,
    padding: "6px 12px",
    borderRadius: 5,
    fontFamily: "inherit",
    cursor: "pointer",
    lineHeight: 1,
    background: "#fff",
  };
  if (variant === "danger") return { ...base, color: "#A4503A", border: "1px solid #E0C2B8" };
  return { ...base, color: OLIVE, border: "1px solid #C8C4B0" };
}
