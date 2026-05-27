"use client";

import { removeArticle } from "@/app/admin/dashboard/actions";

export default function DeleteButton({ id, title }: { id: number; title: string }) {
  return (
    <form action={removeArticle} style={{ display: "inline" }}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm(`Delete "${title}"?`)) e.preventDefault();
        }}
        style={{
          fontSize: 13,
          color: "#B6543C",
          background: "#fff",
          border: "1px solid #E8C4B8",
          borderRadius: 5,
          cursor: "pointer",
          fontFamily: "inherit",
          padding: "8px 14px",
          lineHeight: 1,
        }}
      >
        Delete
      </button>
    </form>
  );
}
