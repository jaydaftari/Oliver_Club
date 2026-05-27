import type { Metadata } from "next";
import BackLink from "@/components/BackLink";
import Footer from "@/components/Footer";
import VideoBlock from "@/components/VideoBlock";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://olivierclub.com";
const COVER = "https://vavrykworld.com/wp-content/uploads/2026/05/TRAKA-2.png";
const URL = `${BASE_URL}/blog/physical-ai`;

export const metadata: Metadata = {
  title: "From Physical AI discussion",
  description:
    "More than 50% of AI startups abandoned after POC. What's going on nowadays in Silicon Valley triggers both excitement and fear. Insights from Flyby Robotics and Universal AI Services founders.",
  alternates: { canonical: URL },
  openGraph: {
    type: "article",
    url: URL,
    title: "From Physical AI discussion — Olivier Club",
    description:
      "More than 50% of AI startups abandoned after POC. Insights from frontier founders Jason H. Lu (Flyby Robotics) and Fernando Lorenzo (Universal AI Services).",
    publishedTime: "2026-05-13T00:00:00.000Z",
    siteName: "Olivier Club",
    images: [{ url: COVER, alt: "From Physical AI discussion" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "From Physical AI discussion — Olivier Club",
    description:
      "More than 50% of AI startups abandoned after POC. Insights from frontier founders at Olivier Club.",
    images: [COVER],
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "From Physical AI discussion",
  description:
    "More than 50% of AI startups abandoned after POC. What's going on nowadays in Silicon Valley triggers both excitement and fear.",
  image: COVER,
  datePublished: "2026-05-13T00:00:00.000Z",
  url: URL,
  author: { "@type": "Person", name: "Ivan Vavryk" },
  publisher: { "@type": "Organization", name: "Olivier Club", url: BASE_URL },
};

export default function PhysicalAIPost() {
  return (
    <div className="page blog-post-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <BackLink href="/blog" label="Back to Blog" />

      <main className="main">
        <article className="container">
          <div className="article">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="article-cover" src={COVER} alt="From Physical AI discussion" />

            <header className="article-header">
              <h1>From Physical AI discussion</h1>
              <div className="meta">
                <time dateTime="2026-05-13">May 13, 2026</time>
                <span className="dot">•</span>
                <span>8 min read</span>
              </div>
            </header>

            <p>
              More than 50% of AI startups abandoned after POC. What&apos;s going on nowadays in
              Silicon Valley triggers both excitement and fear. Young first-time founders show
              success in fundraising, building up teams quickly, creating hype around AI startups.
              What seems easy to imagine as the bright future of humanity with new technologies
              might not be so realistic when it comes to generating revenue as a long-term game.
            </p>

            <p>
              Olivier Club continues its series of private discussions in partnership with{" "}
              <a href="#">AngelList</a> to bring brilliant minds in one room to talk about what
              really matters not only for startup founders in SF, but for the future of humanity.
            </p>

            <p>Physical AI and how it&apos;s different in a way that matters to your cap table.</p>

            <p>
              Jason Lu puts it plainly: &ldquo;It is a concentrated, deliberate effort on the part
              of a robotics builder to build a version of your robot that can get revenue
              today.&rdquo;
            </p>

            <p>
              The deliberateness is the point. Most founders in frontier tech fall into what Jason
              calls the long-duration trap: they&apos;re so focused on the ten-year vision that they
              miss the customer who is sitting right in front of them, ready to pay for a version of
              the product that exists right now.
            </p>

            <p>
              <strong>Jason H. Lu</strong> is the Founder and CEO of <a href="#">Flyby Robotics</a>.
              Raised $4.5M in a pre-seed funding round. Built a team of talent from Yale and NASA.
              Closed a deal with Palantir. Supplies U.S. military clients. Flyby Robotics has
              achieved 7-figure revenue.
            </p>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="article-inline"
              src="https://olivierhome.com/wp-content/uploads/2026/05/1738444685515.webp"
              alt="Founders at the Physical AI discussion"
              loading="lazy"
            />

            <h2>Revenue Over Hype</h2>

            <p>
              The trap most hardware founders fall into: chasing the ten-year vision while ignoring
              the customer in front of them right now. For Flyby, that first customer was AI
              developers and researchers — well-capitalized, willing to experiment, and didn&apos;t
              need enterprise reliability. That overlap between what the tech can do today and who
              urgently needs exactly that is where revenue starts.
            </p>

            <p>
              Fernando pushes back with the longer view. Amazon lost money for years. OpenAI
              didn&apos;t break even until 2024. The Silicon Valley bet isn&apos;t on today&apos;s
              P&amp;L. It&apos;s on whether the team can deliver real value over a decade. Both are
              right. Holding that tension — revenue now, vision later — is the actual skill.
            </p>

            <h2>Why Physical AI Wins</h2>

            <p>
              Fernando on why physical AI is more durable than software AI: Pareto&apos;s Law. 20%
              of what we do drives 80% of the impact. The other 80% is repetitive, manual, and
              nobody wants to do it. Software can&apos;t pick something up. Software can&apos;t fly
              a sensor into a building with no connectivity. Software can&apos;t patrol a warehouse
              at 2am. Physical AI can.
            </p>

            <p>
              <strong>Fernando Lorenzo</strong>, Founder and Managing Director of{" "}
              <a href="#">Universal AI Services</a>, an AI and Robotics marketplace that allows
              anyone to buy, sell, rent, repair, or design robots from scratch. Built a team of
              talent from Harvard and MIT. Board member of the Harvard SF alumni society.
            </p>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="article-inline"
              src="https://olivierhome.com/wp-content/uploads/2026/05/7f1dfbe7-9c3d-4042-adb7-c9923532c30d.avif"
              alt="Fernando Lorenzo at the Olivier Club discussion"
              loading="lazy"
            />

            <h2>The Breaking Point</h2>

            <p>
              Both founders were asked the same question: when did things actually start to scale?
              Replicability. &ldquo;We built one, it works. We built five, six, seven, eight — every
              single one is working. That is the moment,&rdquo; <strong>Jason</strong> said. Before
              that, every customer is a risk. After it, every customer is a compounding asset.
            </p>

            <p>
              <strong>Fernando&apos;s</strong> breaking point was quite human. He ended up in the
              hospital at CES — three hours of sleep, 180 beats per minute. Not recommending it. But
              at that conference he saw the real shape of global demand: hoteliers in Las Vegas,
              security firms in Manhattan, farmers in Kenya — all asking the same questions. The
              demand for physical automation is unglamorous and everywhere. That&apos;s what makes
              it durable.
            </p>

            <h2>How to Get the Deal When You Have Nothing</h2>

            <p>
              <strong>Jason&apos;s</strong> framework for landing strategic partnerships early:
            </p>

            <p>
              &ldquo;Identify the intersection of what the technology is capable of today and what
              an end user urgently needs. When those two things overlap — when an end customer says
              &lsquo;this is going to save lives right now&rsquo; — partnerships become
              solidified.&rdquo;
            </p>

            <p>
              No shortcut. Just customer discovery done seriously. <strong>Fernando&apos;s</strong>{" "}
              point: surface area. Show up. Ask people smarter than you. Create platforms for others
              to share knowledge. Luck is real — but its geography is predictable. You manufacture
              it by putting yourself in more collisions with the right people.
            </p>

            <h2>To Every Founder</h2>

            <p>
              If you&apos;re building something hard, something physical, something that the market
              doesn&apos;t fully understand yet — keep going. The mountain in front of you is real,
              and so is the person on the other side of it who needs what you&apos;re building. Show
              up consistently, find the customer who can pay you today, build your first unit and
              then build eight more just like it, and think about the impact you want to leave
              behind — not just the exit. The ones who make it are rarely the smartest people in the
              room. They&apos;re the ones who didn&apos;t stop.
            </p>

            <VideoBlock />

            <p className="video-caption">
              This conversation was hosted by Olivier Club in partnership with{" "}
              <a href="#">AngelList</a> at their San Francisco office. Olivier Club runs private
              discussions for frontier founders and investors.
            </p>

            <div className="article-author">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="author-avatar"
                src="https://olivierhome.com/wp-content/uploads/2026/05/IMG_9685-3-scaled-e1778694153354.webp"
                alt="Ivan Vavryk"
              />
              <div className="author-text">
                <span className="label">Written by</span>
                <span className="name">Ivan Vavryk</span>
              </div>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
