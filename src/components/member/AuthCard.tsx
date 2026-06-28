import { T } from "./theme";
import Logo from "./Logo";

/** Centered card on the light cream backdrop, shared by the auth pages. */
export default function AuthCard({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        color: T.ink,
        fontFamily: T.sans,
        WebkitFontSmoothing: "antialiased",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Brand */}
        <div style={{ marginBottom: 32 }}>
          <Logo size={40} href="/" />
        </div>

        {eyebrow && (
          <div
            style={{
              font: `600 11px/1 ${T.sans}`,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: T.accent,
              marginBottom: 14,
            }}
          >
            {eyebrow}
          </div>
        )}
        <h1
          style={{
            fontFamily: T.serif,
            fontWeight: 400,
            fontSize: 32,
            lineHeight: 1.05,
            margin: 0,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              margin: "12px 0 0",
              color: T.inkSoft,
              fontSize: 14.5,
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        )}

        <div style={{ marginTop: 28 }}>{children}</div>

        {footer && <div style={{ marginTop: 22, fontSize: 13.5, color: T.inkSoft }}>{footer}</div>}
      </div>
    </div>
  );
}

export function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor: string }) {
  return (
    <label htmlFor={htmlFor} style={{ fontSize: 12.5, color: T.inkSoft }}>
      {children}
    </label>
  );
}
