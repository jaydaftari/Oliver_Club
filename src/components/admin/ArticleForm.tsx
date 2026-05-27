"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Article } from "@/lib/articles";
import { saveArticle } from "@/app/admin/dashboard/actions";

const S: Record<string, React.CSSProperties> = {
  label: { fontSize: 13, color: "#8A8475", marginBottom: 6, display: "block" },
  input: {
    fontFamily: "inherit",
    fontSize: 15,
    padding: "11px 14px",
    background: "#fff",
    border: "1px solid #E0DCD1",
    borderRadius: 6,
    color: "#2A2920",
    width: "100%",
    boxSizing: "border-box",
    outline: "none",
  },
  textarea: {
    fontFamily: "inherit",
    fontSize: 14,
    padding: "11px 14px",
    background: "#fff",
    border: "1px solid #E0DCD1",
    borderRadius: 6,
    color: "#2A2920",
    width: "100%",
    boxSizing: "border-box",
    resize: "vertical" as const,
    outline: "none",
    lineHeight: "1.6",
  },
  field: { display: "grid", gap: 6 },
  row: { display: "grid", gridTemplateColumns: "120px 1fr", gap: 16 },
};

export default function ArticleForm({ article }: { article?: Article }) {
  const [state, action, pending] = useActionState(saveArticle, null);
  const titleRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const coverUrlRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Auto-generate slug from title when slug is empty or matches previous auto
  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!slugRef.current) return;
    slugRef.current.value = e.target.value
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !coverUrlRef.current) return;
    setUploadError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Upload failed");
      coverUrlRef.current.value = json.url;
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  return (
    <>
      <style>{`
        @media (max-width: 480px) {
          .admin-cover-row { flex-direction: column !important; }
          .admin-cover-row button { width: 100%; }
          .admin-form-actions { flex-wrap: wrap; }
          .admin-form-actions button[type="submit"] { flex: 1; }
        }
      `}</style>
      <form action={action} style={{ display: "grid", gap: 20, maxWidth: 680 }}>
        {article && <input type="hidden" name="id" value={article.id} />}

        <div style={S.row}>
          <div style={S.field}>
            <label style={S.label} htmlFor="number">
              Number
            </label>
            <input
              id="number"
              name="number"
              type="number"
              min={1}
              defaultValue={article?.number ?? 1}
              style={S.input}
            />
          </div>
          <div style={S.field}>
            <label style={S.label} htmlFor="title">
              Title <span style={{ color: "#B6543C" }}>*</span>
            </label>
            <input
              ref={titleRef}
              id="title"
              name="title"
              type="text"
              required
              defaultValue={article?.title ?? ""}
              onChange={handleTitleChange}
              style={S.input}
            />
          </div>
        </div>

        <input ref={slugRef} name="slug" type="hidden" defaultValue={article?.slug ?? ""} />

        <div style={S.field}>
          <label style={S.label} htmlFor="cover_url">
            Cover image
          </label>
          <div className="admin-cover-row" style={{ display: "flex", gap: 8 }}>
            <input
              ref={coverUrlRef}
              id="cover_url"
              name="cover_url"
              type="text"
              defaultValue={article?.cover_url ?? ""}
              placeholder="https://... or upload →"
              style={{ ...S.input, flex: 1 }}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              style={{
                flexShrink: 0,
                padding: "0 16px",
                height: 44,
                background: uploading ? "#E0DCD1" : "#fff",
                border: "1px solid #C8C4B0",
                borderRadius: 6,
                fontSize: 13,
                color: uploading ? "#8A8475" : "#5B5A3C",
                fontFamily: "inherit",
                cursor: uploading ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {uploading ? "Uploading…" : "Upload image"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
          </div>
          {uploadError && (
            <p style={{ fontSize: 13, color: "#B6543C", margin: "4px 0 0" }}>{uploadError}</p>
          )}
        </div>

        <div style={S.field}>
          <label style={S.label} htmlFor="excerpt">
            Excerpt
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            rows={2}
            defaultValue={article?.excerpt ?? ""}
            placeholder="Short description shown on cards"
            style={S.textarea}
          />
        </div>

        <div style={S.field}>
          <label style={S.label} htmlFor="content">
            Content <span style={{ color: "#8A8475", fontWeight: 400 }}>(HTML supported)</span>
          </label>
          <textarea
            id="content"
            name="content"
            rows={12}
            defaultValue={article?.content ?? ""}
            placeholder={"<p>Your article content here...</p>"}
            style={S.textarea}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            id="published"
            name="published"
            type="checkbox"
            defaultChecked={article?.published ?? false}
            style={{ width: 16, height: 16, accentColor: "#5B5A3C", cursor: "pointer" }}
          />
          <label htmlFor="published" style={{ fontSize: 15, color: "#2A2920", cursor: "pointer" }}>
            Published
          </label>
        </div>

        {state?.error && <p style={{ fontSize: 14, color: "#B6543C", margin: 0 }}>{state.error}</p>}

        <div
          className="admin-form-actions"
          style={{ display: "flex", gap: 12, alignItems: "center" }}
        >
          <button
            type="submit"
            disabled={pending}
            style={{
              padding: "12px 24px",
              background: pending ? "#8A8475" : "#5B5A3C",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              fontSize: 15,
              fontFamily: "inherit",
              cursor: pending ? "not-allowed" : "pointer",
            }}
          >
            {pending ? "Saving…" : article ? "Save changes" : "Create article"}
          </button>
          <Link
            href="/admin/dashboard"
            style={{ fontSize: 14, color: "#8A8475", textDecoration: "none" }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
