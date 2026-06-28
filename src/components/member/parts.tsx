import Link from "next/link";
import { connectAction } from "@/app/(member)/dashboard/actions";
import { SubmitButton } from "./SubmitButton";
import type { Person, ActivityItem, Workshop } from "@/lib/club";
import type { LumaEvent } from "@/lib/luma";
import { vimeoEmbedSrc } from "@/lib/club-constants";
import { T } from "./theme";

/** Shared light-theme pieces used by the dashboard routes. */

export const AVATAR_COLORS = ["#c4a06a", "#6b88a8", "#6f8f6a", "#b06a4a", "#3c6048"];

export function avatarStyle(seed: number, size: number): React.CSSProperties {
  return {
    width: size,
    height: size,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    font: `600 ${Math.round(size * 0.34)}px/1 ${T.sans}`,
    color: T.accentInk,
    background:
      AVATAR_COLORS[((seed % AVATAR_COLORS.length) + AVATAR_COLORS.length) % AVATAR_COLORS.length],
    flex: "none",
  };
}

export function monthDay(iso: string): { m: string; d: string } {
  const date = new Date(iso);
  return {
    m: date.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    d: String(date.getDate()).padStart(2, "0"),
  };
}

export function timeLabel(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

const panel: React.CSSProperties = {
  background: T.panel,
  border: "1px solid rgba(29,30,26,0.14)",
  borderRadius: 18,
  padding: 26,
};
export const PANEL = panel;

export function SectionHead({
  eyebrow,
  title,
  cta,
}: {
  eyebrow: string;
  title: string;
  cta?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 16,
      }}
    >
      <div>
        <div
          style={{
            font: `600 11px/1 ${T.sans}`,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: T.accent,
          }}
        >
          {eyebrow}
        </div>
        <h3 style={{ fontFamily: T.serif, fontWeight: 400, fontSize: 22, margin: "8px 0 0" }}>
          {title}
        </h3>
      </div>
      {cta && (
        <span
          style={{
            font: `600 11px/1 ${T.sans}`,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "rgba(29,30,26,0.5)",
          }}
        >
          {cta}
        </span>
      )}
    </div>
  );
}

export function EmptyNote({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        padding: "28px 0",
        textAlign: "center",
        color: "rgba(29,30,26,0.45)",
        fontSize: 13.5,
      }}
    >
      {children}
    </div>
  );
}

/** A single upcoming event sourced from the Luma calendar. */
export function LumaEventCard({ event }: { event: LumaEvent }) {
  const { m, d } = monthDay(event.start_at);
  return (
    <a
      href={event.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        gap: 16,
        alignItems: "center",
        padding: 15,
        border: "1px solid rgba(29,30,26,0.14)",
        borderRadius: 14,
        background: "#faf8f2",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div
        style={{
          width: 58,
          height: 64,
          borderRadius: 12,
          background: "#f0ece2",
          border: "1px solid rgba(29,30,26,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
        }}
      >
        <span style={{ font: `700 10px/1 ${T.sans}`, letterSpacing: "0.12em", color: T.accent }}>
          {m}
        </span>
        <span style={{ fontFamily: T.serif, fontSize: 25, lineHeight: 1.2 }}>{d}</span>
      </div>
      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
        <div
          style={{
            font: `600 10px/1 ${T.sans}`,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: T.accent,
            marginBottom: 5,
          }}
        >
          {timeLabel(event.start_at)}
        </div>
        <div style={{ fontFamily: T.serif, fontSize: 19, lineHeight: 1.2 }}>{event.name}</div>
        {event.location && (
          <div style={{ fontSize: 12.5, color: "rgba(29,30,26,0.55)", marginTop: 3 }}>
            {event.location}
          </div>
        )}
      </div>
      <span
        style={{
          flex: "none",
          border: "1px solid rgba(29,30,26,0.25)",
          borderRadius: 999,
          padding: "9px 17px",
          font: `600 12px/1 ${T.sans}`,
          letterSpacing: "0.04em",
          color: T.ink,
          whiteSpace: "nowrap",
        }}
      >
        View ↗
      </span>
    </a>
  );
}

/** A member with a Connect button. */
export function PersonRow({ person, size = 40 }: { person: Person; size?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <div style={avatarStyle(person.id, size)}>{person.initials}</div>
      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 600 }}>{person.name}</div>
        <div style={{ fontSize: 12, color: "rgba(29,30,26,0.55)" }}>{person.role}</div>
      </div>
      <form action={connectAction}>
        <input type="hidden" name="otherId" value={person.id} />
        <SubmitButton
          aria-label={`Connect with ${person.name}`}
          pendingLabel="Connecting…"
          style={{
            flex: "none",
            cursor: "pointer",
            background: T.accent,
            border: `1px solid ${T.accent}`,
            borderRadius: 999,
            padding: "6px 15px",
            font: `600 11px/1 ${T.sans}`,
            letterSpacing: "0.05em",
            color: T.accentInk,
          }}
        >
          Connect
        </SubmitButton>
      </form>
    </div>
  );
}

export function ActivityRow({ item, seed }: { item: ActivityItem; seed: number }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={avatarStyle(seed, 32)}>{item.initials}</div>
      <div
        style={{
          flex: "1 1 auto",
          minWidth: 0,
          fontSize: 13,
          lineHeight: 1.45,
          color: "rgba(29,30,26,0.78)",
        }}
      >
        <span style={{ fontWeight: 600, color: T.ink }}>{item.actor}</span> {item.text}
        <div style={{ fontSize: 11, color: "rgba(29,30,26,0.4)", marginTop: 2 }}>{item.when}</div>
      </div>
    </div>
  );
}

/** Responsive grid of Vimeo workshop players. */
export function WorkshopGrid({ workshops }: { workshops: Workshop[] }) {
  if (workshops.length === 0) {
    return (
      <div style={panel}>
        <EmptyNote>No workshop recordings have been published yet.</EmptyNote>
      </div>
    );
  }
  return (
    <div
      style={{
        display: "grid",
        gap: 22,
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
      }}
    >
      {workshops.map((w) => {
        const src = vimeoEmbedSrc(w.vimeo_url);
        return (
          <div
            key={w.id}
            style={{
              background: T.panel,
              border: "1px solid rgba(29,30,26,0.14)",
              borderRadius: 16,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                position: "relative",
                paddingTop: "56.25%",
                background: src ? "#000" : "rgba(29,30,26,0.05)",
              }}
            >
              {src ? (
                <iframe
                  src={src}
                  title={w.title}
                  loading="lazy"
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
                    textAlign: "center",
                    padding: 18,
                    fontSize: 13,
                    color: "rgba(29,30,26,0.5)",
                  }}
                >
                  Recording coming soon
                </div>
              )}
            </div>
            <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ fontFamily: T.serif, fontSize: 19, lineHeight: 1.2 }}>{w.title}</div>
              {w.description && (
                <div style={{ fontSize: 13, lineHeight: 1.5, color: "rgba(29,30,26,0.6)" }}>
                  {w.description}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Small link used in section headers, etc. */
export function SoftLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} style={{ color: T.accent, textDecoration: "none" }}>
      {children}
    </Link>
  );
}
