"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { T } from "./theme";

const ITEMS = [
  { label: "Overview", href: "/dashboard" },
  { label: "Events", href: "/dashboard/events" },
  { label: "Workshops", href: "/dashboard/workshops" },
  { label: "Connections", href: "/dashboard/connections" },
  { label: "Discussions", href: "/dashboard/discussions" },
  { label: "Profile", href: "/dashboard/profile" },
];

export default function MemberNav() {
  const pathname = usePathname();

  return (
    <nav style={{ display: "flex", gap: "clamp(18px,3vw,36px)", flexWrap: "wrap" }}>
      {ITEMS.map(({ label, href }) => {
        const active =
          href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            style={{
              position: "relative",
              textDecoration: "none",
              font: `600 12px/1 ${T.sans}`,
              letterSpacing: "0.13em",
              textTransform: "uppercase",
              color: active ? T.ink : T.inkSoft,
              paddingBottom: 7,
            }}
          >
            {label}
            {active && (
              <span
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: 2,
                  background: T.accent,
                  borderRadius: 2,
                }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
