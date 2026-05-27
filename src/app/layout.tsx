import type { Metadata } from "next";
import "./globals.css";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://olivierclub.com";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Olivier Club — Private Network for Visionaries & Founders",
    template: "%s — Olivier Club",
  },
  description:
    "A private membership club connecting founders, investors, and engineers across 12 countries. Curated events, a startup pre-accelerator, and a social wellness community for ambitious people.",
  keywords: [
    "startup founders network",
    "private membership club",
    "founder community",
    "investor networking",
    "startup accelerator",
    "market intelligence",
    "entrepreneur club",
    "Silicon Valley networking",
    "Olivier Club",
  ],
  authors: [{ name: "Olivier Club", url: BASE_URL }],
  creator: "Olivier Club",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Olivier Club",
    title: "Olivier Club — Private Network for Visionaries & Founders",
    description:
      "A private membership club connecting founders, investors, and engineers across 12 countries. Curated events, a startup pre-accelerator, and a social wellness community.",
    images: [
      {
        url: "https://vavrykworld.com/wp-content/uploads/2026/01/2e800bec-e172-4b1a-9292-e00f9b48b1ca.webp",
        width: 1200,
        height: 630,
        alt: "Olivier Club — Private Network for Visionaries",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Olivier Club — Private Network for Visionaries & Founders",
    description:
      "A private membership club connecting founders, investors, and engineers across 12 countries.",
    images: [
      "https://vavrykworld.com/wp-content/uploads/2026/01/2e800bec-e172-4b1a-9292-e00f9b48b1ca.webp",
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
