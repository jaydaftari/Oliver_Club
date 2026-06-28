import Link from "next/link";
import { T } from "./theme";

/**
 * Olivier Club brand mark — the goggles photo as a circular logo plus the
 * "Olivier / Club" wordmark. Pass `href` to make it a link.
 */
export default function Logo({ size = 38, href }: { size?: number; href?: string }) {
  const mark = (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo.png"
        alt="Olivier Club"
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: "1.5px solid rgba(44,74,53,0.35)",
          flex: "none",
        }}
      />
      <span style={{ display: "flex", flexDirection: "column", gap: 3, lineHeight: 1 }}>
        <span
          style={{
            fontFamily: T.serif,
            fontWeight: 500,
            fontSize: Math.round(size * 0.55),
            color: T.ink,
          }}
        >
          Olivier
        </span>
        <span
          style={{
            font: `600 9px/1 ${T.sans}`,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
            color: T.accent,
          }}
        >
          Club
        </span>
      </span>
    </span>
  );

  return href ? (
    <Link href={href} style={{ textDecoration: "none" }}>
      {mark}
    </Link>
  ) : (
    mark
  );
}
