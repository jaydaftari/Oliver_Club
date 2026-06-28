"use client";

import { useState, useTransition } from "react";
import type { Workshop } from "@/lib/club";
import { vimeoEmbedSrc, formatTimecode } from "@/lib/club-constants";
import {
  createWorkshopAction,
  updateWorkshopAction,
  deleteWorkshopAction,
  type WorkshopActionState,
} from "@/app/admin/dashboard/workshops-actions";

const INK = "#2A2920";
const MUTED = "#6B6558";
const OLIVE = "#5B5A3C";
const RULE = "#E0DCD1";

export default function WorkshopsPanel({ workshops }: { workshops: Workshop[] }) {
  const [editing, setEditing] = useState<Workshop | null>(null);
  const [banner, setBanner] = useState<WorkshopActionState>(null);
  const [pending, startTransition] = useTransition();
  const formKey = editing ? `edit-${editing.id}` : "create";

  function submit(fd: FormData) {
    startTransition(async () => {
      const res = editing
        ? await updateWorkshopAction(null, fd)
        : await createWorkshopAction(null, fd);
      setBanner(res);
      if (res?.ok) setEditing(null);
    });
  }

  function remove(w: Workshop) {
    if (!window.confirm(`Delete "${w.title}"?`)) return;
    const fd = new FormData();
    fd.set("id", String(w.id));
    startTransition(async () => {
      setBanner(await deleteWorkshopAction(null, fd));
      if (editing?.id === w.id) setEditing(null);
    });
  }

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 400, margin: 0, letterSpacing: "-0.01em" }}>
          Workshops
        </h1>
        <p style={{ fontSize: 13, color: MUTED, margin: "6px 0 0" }}>
          Vimeo videos shown in the Workshops tab of every member&apos;s dashboard.
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
          <div style={{ display: "grid", gap: 6, flex: "1 1 220px" }}>
            <label style={lbl} htmlFor="w-title">
              Title
            </label>
            <input
              id="w-title"
              name="title"
              defaultValue={editing?.title ?? ""}
              placeholder="Storytelling for Founders"
              style={inputStyle}
            />
          </div>
          <div style={{ display: "grid", gap: 6, flex: "2 1 320px" }}>
            <label style={lbl} htmlFor="w-url">
              Vimeo URL
            </label>
            <input
              id="w-url"
              name="vimeo_url"
              required
              defaultValue={editing?.vimeo_url ?? ""}
              placeholder="https://vimeo.com/1205089464"
              style={inputStyle}
            />
          </div>
        </div>
        <div style={{ display: "grid", gap: 6 }}>
          <label style={lbl} htmlFor="w-desc">
            Description (optional)
          </label>
          <textarea
            id="w-desc"
            name="description"
            rows={2}
            defaultValue={editing?.description ?? ""}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <div style={{ display: "grid", gap: 6, flex: "1 1 160px" }}>
            <label style={lbl} htmlFor="w-start">
              Key point — start
            </label>
            <input
              id="w-start"
              name="start_time"
              defaultValue={formatTimecode(editing?.start_seconds ?? 0) || "0:00"}
              placeholder="0:00"
              style={inputStyle}
            />
          </div>
          <div style={{ display: "grid", gap: 6, flex: "1 1 160px" }}>
            <label style={lbl} htmlFor="w-end">
              Key point — end
            </label>
            <input
              id="w-end"
              name="end_time"
              defaultValue={formatTimecode(editing?.end_seconds)}
              placeholder="full length"
              style={inputStyle}
            />
          </div>
          <p style={{ ...lbl, flex: "2 1 260px", margin: 0, lineHeight: 1.4 }}>
            The clip plays from start to end by default. Use <code>m:ss</code> (e.g. 1:30) or plain
            seconds. Leave end blank to play to the end. Members can still scrub the whole video.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button type="submit" disabled={pending} style={primaryBtn(pending)}>
            {pending ? "Saving…" : editing ? "Save changes" : "Add workshop"}
          </button>
          {editing && (
            <button type="button" onClick={() => setEditing(null)} style={secondaryBtn}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {banner && (
        <p style={{ margin: "0 0 16px", fontSize: 13.5, color: banner.ok ? "#4A5A2A" : "#A4503A" }}>
          {banner.message}
        </p>
      )}

      {/* Grid of workshops with embedded previews */}
      {workshops.length === 0 ? (
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
          No workshops yet. Add the first one above.
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 16,
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          }}
        >
          {workshops.map((w) => {
            const src = vimeoEmbedSrc(w.vimeo_url);
            return (
              <div
                key={w.id}
                style={{
                  background: "#fff",
                  border: `1px solid ${RULE}`,
                  borderRadius: 10,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ position: "relative", paddingTop: "56.25%", background: "#000" }}>
                  {src ? (
                    <iframe
                      src={src}
                      title={w.title}
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        border: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontSize: 13,
                      }}
                    >
                      Invalid Vimeo URL
                    </div>
                  )}
                </div>
                <div
                  style={{ padding: 14, display: "flex", flexDirection: "column", gap: 6, flex: 1 }}
                >
                  <div style={{ fontSize: 15, fontWeight: 500, color: INK }}>{w.title}</div>
                  {w.description && (
                    <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.4 }}>
                      {w.description}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: MUTED }}>
                    Key point: {formatTimecode(w.start_seconds) || "0:00"} –{" "}
                    {formatTimecode(w.end_seconds) || "end"}
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: "auto", paddingTop: 8 }}>
                    <button type="button" onClick={() => setEditing(w)} style={rowBtn()}>
                      Edit
                    </button>
                    <button type="button" onClick={() => remove(w)} style={rowBtn("danger")}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
