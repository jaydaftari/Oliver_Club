import type { Metadata } from "next";
import Link from "next/link";
import BackLink from "@/components/BackLink";
import Footer from "@/components/Footer";
import PhotoStack from "@/components/global/PhotoStack";
import RoadmapCarousel from "@/components/global/RoadmapCarousel";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://olivierclub.com";

export const metadata: Metadata = {
  title: "Global Networking",
  description:
    "Your Hero's Journey starts here. Approved-in-advance brilliant minds meeting at high-signal events — ideas management, startup pitches, acceleration, company visits, and an AI roadmapping engine.",
  alternates: { canonical: `${BASE_URL}/global-networking` },
  openGraph: {
    url: `${BASE_URL}/global-networking`,
    title: "Global Networking — Olivier Club",
    description:
      "Your Hero's Journey starts here. Brilliant minds meeting at high-signal interactive events to change the world.",
  },
};

const APPLY_URL = "/apply?source=global-networking";

export default function GlobalNetworkingPage() {
  return (
    <div className="page gn-scope">
      <BackLink href="/" label="Back to Home" />

      <main className="main">
        <div className="container">
          <section className="hero">
            <div className="hero-text">
              <h1 className="h-hero">
                Your Hero&apos;s Journey
                <br />
                starts here.
              </h1>
              <p className="lede">
                Approved in advance, brilliant minds meeting in terms of high-signal interactive
                events to change the world.
              </p>
              <div className="cta-row">
                <Link className="btn btn-primary" href={APPLY_URL}>
                  Join the Club
                </Link>
              </div>
            </div>
            <div className="hero-side">
              <figure className="polaroid">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="side-img"
                  src="https://vavrykworld.com/wp-content/uploads/2026/04/IMG_2852-scaled.jpg"
                  alt="Olivier Club networking event"
                />
              </figure>
            </div>
          </section>

          <section className="section-sm split" id="apply">
            <div className="split-left">
              <h2 className="h-hero">
                Are you a genius
                <br />
                as well?
              </h2>
              <p className="lede">
                Olivier member is someone who is brave enough to make the first step towards new
                knowledge. Launch ambitious startups connecting with like-minded.
              </p>
              <figure className="polaroid membership-polaroid">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="side-img"
                  src="https://vavrykworld.com/wp-content/uploads/2026/05/IMG_3875-scaled.jpg"
                  alt="Olivier Club members gathering"
                  loading="lazy"
                />
              </figure>
            </div>

            <div className="split-right">
              <ol className="num-list">
                <li>
                  <span className="num">01</span>
                  <div>
                    <h3 className="item-title">Ideas management</h3>
                    <p className="item-body">
                      You create — we make it real. With our tools, experience and people.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="num">02</span>
                  <div>
                    <h3 className="item-title">Talk to those that matter</h3>
                    <p className="item-body">
                      Pitch your startup to people that actually need to hear it.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="num">03</span>
                  <div>
                    <h3 className="item-title">Acceleration</h3>
                    <p className="item-body">
                      We invite vetted founders and investors to accelerate brilliant minds.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="num">04</span>
                  <div>
                    <h3 className="item-title">Company visits &amp; before market access</h3>
                    <p className="item-body">
                      Visit other companies with club members and get access to solutions before
                      their launch on the market.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </section>
        </div>

        {/* Dark green: hiking polaroid stack */}
        <section className="momentum">
          <div className="container momentum-inner">
            <div className="momentum-text">
              <h2 className="h-hero">
                Keeping the
                <br />
                momentum
              </h2>
              <p className="lede">
                Ideas are not born in an office. Decisions should not be made on a single Zoom call.
                We send you to the right places, with the right people.
              </p>
              <p className="stack-hint">Drag the photos to flip through →</p>
            </div>

            <PhotoStack />
          </div>
        </section>

        {/* Roadmapping Engine: app showcase carousel */}
        <section className="roadmap-engine">
          <div className="container">
            <div className="re-head">
              <h2 className="h-hero">
                We are your
                <br />
                Roadmapping Engine
              </h2>
              <p className="lede">
                An AI agent that turns your idea into a step-by-step plan — and introduces you to
                the exact people who can help you build it.
              </p>
            </div>
          </div>

          <RoadmapCarousel />

          <div className="container re-cta">
            <Link className="btn btn-orange" href={APPLY_URL}>
              Apply Now <span className="arrow">→</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
