/** Shared palette for the member area — light cream theme (2026 redesign). */
export const T = {
  bg: "#efece3", // page background (light cream)
  panel: "#ffffff", // cards
  panelRaised: "#ffffff", // stat cards
  ink: "#1d1e1a", // primary text (near-black)
  inkSoft: "rgba(29,30,26,0.55)",
  inkFaint: "rgba(29,30,26,0.4)",
  accent: "#2c4a35", // forest green
  accentInk: "#f3f0e8", // text on the green accent
  gold: "#c4a06a", // secondary warm accent (dots, dates)
  line: "rgba(29,30,26,0.1)", // hairline borders
  lineStrong: "rgba(29,30,26,0.2)",
  // Dark-green hero band
  heroBg: "#25402d",
  heroInk: "#f5f2ea",
  heroInkSoft: "rgba(245,242,234,0.82)",
  heroInkFaint: "rgba(245,242,234,0.62)",
  danger: "#b06a4a", // clay
  serif: "'Newsreader',serif",
  sans: "'Archivo',sans-serif",
} as const;

export const fieldStyle: React.CSSProperties = {
  fontFamily: T.sans,
  fontSize: 15,
  padding: "13px 15px",
  background: "#ffffff",
  border: "1px solid rgba(29,30,26,0.18)",
  borderRadius: 10,
  color: T.ink,
  outline: "none",
  width: "100%",
};

export function primaryButton(pending?: boolean): React.CSSProperties {
  return {
    width: "100%",
    padding: "13px 18px",
    background: pending ? "rgba(44,74,53,0.55)" : T.accent,
    color: T.accentInk,
    border: "none",
    borderRadius: 999,
    fontFamily: T.sans,
    fontSize: 14,
    fontWeight: 600,
    letterSpacing: "0.04em",
    cursor: pending ? "not-allowed" : "pointer",
  };
}
