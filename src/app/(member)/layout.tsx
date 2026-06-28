import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Member — Olivier Club",
  robots: "noindex, nofollow",
};

/**
 * Layout for the member area (login, dashboard, account, password flows).
 * Loads the dashboard typefaces; pages render on the dark olive theme.
 */
export default function MemberLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      {/* eslint-disable-next-line @next/next/no-page-custom-font -- scoped to the member area only */}
      <link
        href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=Newsreader:ital,opsz,wght@0,6..72,300;0,6..72,400;0,6..72,500;1,6..72,400&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  );
}
