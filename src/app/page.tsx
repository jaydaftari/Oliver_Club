import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/components/Footer";
import EmailForm from "@/components/EmailForm";
import DiscussionsScroll from "@/components/DiscussionsScroll";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://olivierclub.com";

export const metadata: Metadata = {
  title: "Olivier Club — Private Network for Visionaries & Founders",
  description:
    "A private membership club connecting founders, investors, and engineers across 12 countries. Curated events, Market Intelligence pre-accelerator, and social wellness community for ambitious people.",
  alternates: { canonical: BASE_URL },
  openGraph: {
    url: BASE_URL,
    title: "Olivier Club — Private Network for Visionaries & Founders",
    description:
      "A private membership club connecting founders, investors, and engineers across 12 countries. Curated events, Market Intelligence pre-accelerator, and social wellness community.",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Olivier Club",
  url: BASE_URL,
  logo: `${BASE_URL}/favicon.ico`,
  description:
    "A private membership club connecting founders, investors, and engineers across 12 countries through curated events, a startup pre-accelerator, and a social wellness community.",
  contactPoint: {
    "@type": "ContactPoint",
    email: "contact@olivierclub.com",
    contactType: "customer service",
  },
  sameAs: ["https://www.instagram.com/olivierclub", "https://olivierhome.com"],
};

export default function HomePage() {
  return (
    <div className="page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      <main className="main">
        <div className="container">
          <section className="home-intro">
            <h1 className="h-display">Olivier, made for visionaries and ambitious people.</h1>

            <p className="explore-label">Explore, connect, create:</p>

            <div className="explore-list">
              <p className="explore-item">
                <Link className="lead-link" href="/global-networking">
                  Meet the greatest
                </Link>{" "}
                - Founders, investors and engineers impacting the future.
              </p>
              <p className="explore-item">
                <a
                  className="lead-link"
                  href="https://olivierhome.com/"
                  target="_blank"
                  rel="noopener"
                >
                  Live with innovators
                </a>{" "}
                - Home for visionaries. Build your next game-changing idea on the yacht ride or take
                a hike with like-minded people.
              </p>
              <p className="explore-item">
                <Link className="lead-link" href="/market-intelligence">
                  Market Intelligence Program
                </Link>{" "}
                - pre-accelerator for founders with MVP, led by vetted CMOs focused on go-to-market
                strategy and real traction.
              </p>
            </div>

            <div className="home-cta-row">
              <Link className="btn btn-ghost" href="/global-networking">
                See some events
              </Link>
              <Link className="btn btn-ghost" href="/blog">
                Insights
              </Link>
            </div>

            <DiscussionsScroll />

            <div className="home-email">
              <div className="home-email-left">
                <p className="prompt">
                  We contact every person willing to impact the world. Drop your email here:
                </p>
                <EmailForm />
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="palm"
                src="https://vavrykworld.com/wp-content/uploads/2026/01/2e800bec-e172-4b1a-9292-e00f9b48b1ca.webp"
                alt="Palm leaves over the sea at golden hour"
                loading="lazy"
              />
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
