import type { Metadata } from "next";
import Link from "next/link";
import BackLink from "@/components/BackLink";
import Footer from "@/components/Footer";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://olivierclub.com";
const APPLY_URL = "/apply?source=social-wellness";

export const metadata: Metadata = {
  title: "Social Wellness Special",
  description:
    "A lifestyle community for founders and visionaries. Padel, golf, running, surfing, yoga, private networking events, and exclusive product access — tuned to sharpen decision-making.",
  alternates: { canonical: `${BASE_URL}/social-wellness` },
  openGraph: {
    url: `${BASE_URL}/social-wellness`,
    title: "Social Wellness Special — Olivier Club",
    description:
      "A lifestyle community for founders and visionaries. Padel, golf, running, private events, and exclusive product access.",
  },
};

export default function SocialWellnessPage() {
  return (
    <div className="page">
      <BackLink href="/" label="Back to Home" />

      <main className="main">
        <div className="container">
          <section className="hero">
            <div className="hero-text">
              <h1 className="h-hero">
                Social Wellness
                <br />
                Special
              </h1>
              <p className="lede">
                Community that was formed by people who everyday tune their lifestyle to influence
                their decision-making in a better way.
              </p>
              <div className="cta-row">
                <Link className="btn btn-primary" href={APPLY_URL}>
                  Join the Club
                </Link>
              </div>
            </div>
            <div />
          </section>

          <section className="section split" id="apply">
            <div className="split-left">
              <h2 className="h-hero">
                What Your
                <br />
                Membership Includes
              </h2>
              <p className="lede">
                Connect with like-minded visionaries while participating in exclusive lifestyle
                activities. Play padel, golf, join running club and get access to networking events.
              </p>
              <div className="cta-row">
                <Link className="btn btn-primary" href={APPLY_URL}>
                  <span>Apply Now</span>
                  <span className="arrow">→</span>
                </Link>
              </div>
            </div>

            <div className="split-right">
              <ol className="num-list">
                <li>
                  <span className="num">01</span>
                  <div>
                    <h3 className="item-title">Sports Club</h3>
                    <p className="item-body">
                      Running, padel, surfing, yoga sessions, golf and more.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="num">02</span>
                  <div>
                    <h3 className="item-title">Networking events</h3>
                    <p className="item-body">
                      Private events in luxury places with members of the club.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="num">03</span>
                  <div>
                    <h3 className="item-title">Pitch events &amp; Masterminds</h3>
                    <p className="item-body">
                      Present your startups, ideas and share work progress.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="num">04</span>
                  <div>
                    <h3 className="item-title">Access to exclusive products</h3>
                    <p className="item-body">
                      Be first one to get access to tools and solutions before they go to market.
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
