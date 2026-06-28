"use client";

/** Client island for the 404 page's "Go back" control (uses browser history). */
export default function NotFoundBack() {
  return (
    <button
      type="button"
      onClick={() => {
        try {
          history.back();
        } catch {
          /* no history — stay put */
        }
      }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 9,
        cursor: "pointer",
        background: "transparent",
        border: "1px solid rgba(203,176,122,0.4)",
        borderRadius: 999,
        padding: "14px 26px",
        font: "600 12.5px/1 'Archivo',sans-serif",
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        color: "#efe9d8",
      }}
    >
      Go back
    </button>
  );
}
