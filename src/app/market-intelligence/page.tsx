import type { Metadata } from "next";
import Link from "next/link";
import BackLink from "@/components/BackLink";
import Footer from "@/components/Footer";
import VideoBlock from "@/components/VideoBlock";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://olivierclub.com";
const APPLY_URL = "/apply?source=market-intelligence";

export const metadata: Metadata = {
  title: "Market Intelligence Program",
  description:
    "A 5-stage startup pre-accelerator for founders with an MVP. Validation, pivoting, team-building, first traction, and investor readiness — led by vetted CMOs and investors.",
  alternates: { canonical: `${BASE_URL}/market-intelligence` },
  openGraph: {
    url: `${BASE_URL}/market-intelligence`,
    title: "Market Intelligence Program — Olivier Club",
    description:
      "A 5-stage startup pre-accelerator led by vetted CMOs: idea validation, pivoting, team-building, first traction, and investor readiness.",
  },
};

export default function MarketIntelligencePage() {
  return (
    <div className="page">
      <BackLink href="/" label="Back to Home" />

      <main className="main">
        <div className="container">
          <section className="hero hero-single">
            <div className="hero-text">
              <h1 className="h-hero">Market Intelligence Program</h1>
              <p className="lede" style={{ maxWidth: "52ch" }}>
                Built by CMOs and investors for strategists, those who are sick enough with their
                ideas.
              </p>
              <VideoBlock landscape />
            </div>
          </section>

          <section className="section">
            <h2 className="section-title">The Five Stages</h2>

            <ol className="num-list expanded">
              <li>
                <span className="num">01</span>
                <div>
                  <h3 className="item-title">Inspector</h3>
                  <p className="item-body">
                    We validate your idea from every angle—market trends, competitive landscape, and
                    psychological factors. Is this a problem worth solving? Do you have the
                    conviction to see it through? We assess both the external opportunity and the
                    internal drive, giving you honest clarity on whether this will work and what
                    needs to change.
                  </p>
                </div>
              </li>
              <li>
                <span className="num">02</span>
                <div>
                  <h3 className="item-title">Pivoting &amp; Improvement</h3>
                  <p className="item-body">
                    Ideas evolve. We help you make the right corrections before you scale the wrong
                    thing. Through our network of external experts, influencers, and exclusive
                    events, we stress-test your assumptions, identify what will last, and refine
                    your approach to capture rising trends.
                  </p>
                </div>
              </li>
              <li>
                <span className="num">03</span>
                <div>
                  <h3 className="item-title">Team-Building</h3>
                  <p className="item-body">
                    65% of partnerships break. We teach you how to build the right team from day
                    one—identifying co-founder fit, structuring equity, and creating a culture that
                    survives the inevitable pressure. The right team is your unfair advantage.
                  </p>
                </div>
              </li>
              <li>
                <span className="num">04</span>
                <div>
                  <h3 className="item-title">First Traction</h3>
                  <p className="item-body">
                    This is where strategy meets execution. We provide you with a Go-To-Market
                    strategy, all the tools, resources, and environment you need to gain real
                    traction. No fluff—just a clear path to your first customers, revenue, and proof
                    that this works.
                  </p>
                </div>
              </li>
              <li>
                <span className="num">05</span>
                <div>
                  <h3 className="item-title">Investor Readiness</h3>
                  <p className="item-body">
                    We prepare you for fundraising the right way. Through our partnerships with VCs,
                    angels, and accelerators, we shape the environment where founders meet
                    investors—but only when you&apos;re ready. We ensure you walk into those rooms
                    with traction, clarity, and a compelling story.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          <section className="cta-block">
            <h2 className="h-section">Ready to Scale?</h2>
            <p className="body">
              If you have an MVP and the drive to build something that matters, we want to hear from
              you.
            </p>
            <Link className="btn btn-primary" href={APPLY_URL}>
              <span>Apply Now</span>
              <span className="arrow">→</span>
            </Link>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
