import type { Metadata } from "next";
import BackLink from "@/components/BackLink";
import Footer from "@/components/Footer";
import ApplicationForm from "@/components/ApplicationForm";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://olivierclub.com";

export const metadata: Metadata = {
  title: "Apply",
  description:
    "Apply to join Olivier Club — a private network for founders, investors, and engineers across 12 countries.",
  alternates: { canonical: `${BASE_URL}/apply` },
  openGraph: {
    url: `${BASE_URL}/apply`,
    title: "Apply — Olivier Club",
    description:
      "Apply to join Olivier Club — a private network for founders, investors, and engineers.",
  },
  robots: { index: false, follow: true },
};

const SOURCE_COPY: Record<string, { eyebrow: string; tagline: string }> = {
  "global-networking": {
    eyebrow: "Global Networking",
    tagline: "High-signal events across 12 countries — apply to join the next one.",
  },
  "social-wellness": {
    eyebrow: "Social Wellness",
    tagline:
      "A community for ambitious people who care about how they live, not just what they build.",
  },
  "market-intelligence": {
    eyebrow: "Market Intelligence",
    tagline: "Pre-accelerator for founders with an MVP, led by vetted CMOs.",
  },
  direct: {
    eyebrow: "Olivier Club",
    tagline: "A private network for founders, investors, and engineers who want to make a dent.",
  },
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function ApplyPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const raw = sp.source;
  const sourceParam = Array.isArray(raw) ? raw[0] : raw;
  const source = sourceParam && SOURCE_COPY[sourceParam] ? sourceParam : "direct";
  const copy = SOURCE_COPY[source];

  return (
    <div className="page">
      <BackLink href="/" label="Back to Home" />

      <main className="main">
        <div className="container">
          <div className="apply-shell">
            <header className="apply-header">
              <p className="eyebrow">{copy.eyebrow}</p>
              <h1 className="h-hero">Join Olivier Club.</h1>
              <p className="lede apply-lede">{copy.tagline}</p>
              <p className="apply-meta">
                Every application is reviewed personally. Takes about a minute.
              </p>
            </header>

            <ApplicationForm source={source} />

            <p className="apply-footnote">
              We&apos;ll only use your details to follow up about your application. No newsletter,
              no resale.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
