import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import BackLink from "@/components/BackLink";
import Footer from "@/components/Footer";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://olivierclub.com";

export const metadata: Metadata = {
  title: "Global Networking",
  description:
    "Approved in advance, brilliant minds meeting in high-signal interactive events across 12 countries. Startup pitches, masterminds, company visits, and before-market product access.",
  alternates: { canonical: `${BASE_URL}/global-networking` },
  openGraph: {
    url: `${BASE_URL}/global-networking`,
    title: "Global Networking — Olivier Club",
    description:
      "Approved in advance, brilliant minds meeting in high-signal interactive events across 12 countries. Startup pitches, masterminds, company visits.",
  },
};

const APPLY_URL = "/apply?source=global-networking";

export default function GlobalNetworkingPage() {
  return (
    <div className="page">
      <BackLink href="/" label="Back to Home" />

      <main className="main">
        <div className="container">
          <section className="hero">
            <div className="hero-text">
              <h1 className="h-hero">
                We are connecting
                <br />
                people with vision.
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
              <Image
                className="side-img"
                src="https://vavrykworld.com/wp-content/uploads/2026/04/IMG_2852-scaled.jpg"
                alt="Olivier Club networking event"
                width={800}
                height={600}
                style={{ width: "100%", height: "auto" }}
                priority
              />
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
              <div className="cta-row">
                <Link className="btn btn-primary" href={APPLY_URL}>
                  <span>Apply Now</span>
                  <span className="arrow">→</span>
                </Link>
              </div>
              <Image
                className="side-img membership-img"
                src="https://vavrykworld.com/wp-content/uploads/2026/05/IMG_3875-scaled.jpg"
                alt="Olivier Club members gathering"
                width={800}
                height={600}
                style={{ width: "100%", height: "auto" }}
              />
            </div>

            <div className="split-right">
              <ol className="num-list">
                <li>
                  <span className="num">01</span>
                  <div>
                    <h3 className="item-title">Networking in 12 countries</h3>
                    <p className="item-body">
                      Visit unlimited networking events of Olivier Club around the world.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="num">02</span>
                  <div>
                    <h3 className="item-title">Startup pitches</h3>
                    <p className="item-body">Pitch your startup to investors and other founders.</p>
                  </div>
                </li>
                <li>
                  <span className="num">03</span>
                  <div>
                    <h3 className="item-title">Masterminds</h3>
                    <p className="item-body">Strategic sessions with club members.</p>
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
      </main>

      <Footer />
    </div>
  );
}
