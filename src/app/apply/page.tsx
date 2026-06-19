import type { Metadata } from "next";
import HeroJourneyGame from "@/components/apply/HeroJourneyGame";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://olivierclub.com";

const ALLOWED_SOURCES = new Set([
  "global-networking",
  "social-wellness",
  "market-intelligence",
  "direct",
]);

export const metadata: Metadata = {
  title: "Begin your Hero Journey",
  description:
    "Apply to join Olivier Club — a private network for founders, investors, and engineers across 12 countries.",
  alternates: { canonical: `${BASE_URL}/apply` },
  openGraph: {
    url: `${BASE_URL}/apply`,
    title: "Begin your Hero Journey — Olivier Club",
    description:
      "Apply to join Olivier Club — a private network for founders, investors, and engineers.",
  },
  robots: { index: false, follow: true },
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ApplyPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const raw = sp.source;
  const sourceParam = Array.isArray(raw) ? raw[0] : raw;
  const source = sourceParam && ALLOWED_SOURCES.has(sourceParam) ? sourceParam : "direct";

  return <HeroJourneyGame source={source} />;
}
