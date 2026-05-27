import { neon } from "@neondatabase/serverless";

const DATABASE_URL =
  "postgresql://neondb_owner:npg_tsB1OGvINic6@ep-dry-poetry-aqdm37p4.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

const articles = [
  {
    number: 2,
    title: "The Fundraising Playbook Nobody Talks About",
    slug: "fundraising-playbook",
    excerpt:
      "Most founders think fundraising is about the pitch. It isn't. It's about the relationship you built six months before you needed the money.",
    cover_url: "https://vavrykworld.com/wp-content/uploads/2026/05/Gary-3.png",
    published: true,
    content: `<p>Most founders think fundraising is about the pitch. It isn't. It's about the relationship you built six months before you needed the money. Olivier Club brought together three founders who have collectively raised over $40M to break down what actually works — and what wastes everyone's time.</p>

<p>The room was small. Twelve people. No recording. That's the point.</p>

<h2>The Myth of the Cold Intro</h2>

<p>Gary Sheng opened with a blunt observation: "If you're relying on cold intros to close your round, you're already behind." The founders who close rounds quickly aren't better at pitching — they're better at showing up before they need anything. Conferences, Substacks, Twitter threads, dinners like this one. They've built enough trust that when they say 'we're raising,' investors already want in.</p>

<p>The cold intro has a 2–3% conversion rate on a good day. A warm intro from someone an investor trusts converts at 40–60%. That math should change how you spend your time in the twelve months before you raise.</p>

<h2>What VCs Actually Want to See</h2>

<p>Not traction — though traction helps. What moves a serious investor is conviction. Specifically: do you understand the problem better than anyone else in the room? Can you defend your assumptions when pushed? Have you talked to a hundred customers, or did you talk to five and call it research?</p>

<p>One founder in the room described losing a term sheet because she couldn't answer a question about her churn rate by customer segment. Not because the churn was bad — it was fine. Because the investor wanted to know she had thought about it. She hadn't. That was the signal.</p>

<h2>The Right Time to Raise</h2>

<p>Raise when you don't need to. This is repeated constantly and almost never followed. The reason founders raise at the worst possible time — when runway is short, when they're stressed, when they'll take bad terms — is that they waited too long to start building the relationships.</p>

<p>A practical framework from the discussion: start investor conversations 9 months before you actually need capital. Not pitching — talking. Sharing what you're building. Asking for their perspective on the market. Let them watch you execute. By the time you formally open the round, the check should feel like the obvious next step for both sides.</p>

<h2>On Saying No</h2>

<p>The most counterintuitive advice came near the end: learn to say no to investors. Not every check is a good check. A VC who doesn't understand your market will ask bad questions at board meetings. An angel with unrealistic timelines will create pressure that deforms your roadmap. Money is not neutral — it comes with the worldview of the person who wrote it.</p>

<p>Choose your investors the way you choose your co-founders. You'll be working with them for a decade.</p>

<div class="article-author" style="margin-top:48px;padding-top:28px;border-top:1px solid #E0DCD1;display:flex;align-items:center;gap:18px;">
  <img class="author-avatar" src="https://olivierhome.com/wp-content/uploads/2026/05/IMG_9685-3-scaled-e1778694153354.webp" alt="Ivan Vavryk" style="width:44px;height:44px;border-radius:50%;object-fit:cover;" />
  <div class="author-text">
    <span class="label" style="font-size:12px;color:#8A8475;display:block;">Written by</span>
    <span class="name" style="font-size:15px;color:#2A2920;">Ivan Vavryk</span>
  </div>
</div>`,
  },
  {
    number: 3,
    title: "Networks That Compound: Building Relationships That Last",
    slug: "networks-that-compound",
    excerpt:
      "The strongest networks aren't built by collecting contacts. They're built by creating value for people before you need anything from them.",
    cover_url: "https://vavrykworld.com/wp-content/uploads/2026/05/Gary-2.png",
    published: true,
    content: `<p>The strongest networks aren't built by collecting contacts. They're built by creating value for people before you need anything from them. At our London gathering, a founder, a former operator, and a venture-backed CEO unpacked how they think about relationships — not as transactions, but as compounding assets.</p>

<h2>Weak Ties Are More Valuable Than You Think</h2>

<p>Everyone focuses on their inner circle. The five people they call at 2am. But research — and experience — consistently shows that the most impactful opportunities come from weak ties: the acquaintance from a conference two years ago, the investor you grabbed coffee with once and stayed in touch with, the operator in a different industry who sees your problem from a completely different angle.</p>

<p>Strong ties share your worldview. Weak ties expose you to worlds you wouldn't have found otherwise. That asymmetry is where opportunities live.</p>

<h2>The Geographic Mistake</h2>

<p>We asked the room: how many of you have a meaningful relationship with someone in a city you don't live in? Every hand went up. How many of you actively invest time in maintaining those relationships? Three hands stayed up.</p>

<p>Geography still matters in venture. Deals get done in San Francisco. Connections get made in London. Regulations get shaped in Brussels. Being physically present in the right rooms at the right moments is irreplaceable — which is exactly why Olivier Club puts members on planes.</p>

<p>The founders who consistently outperform their peers aren't just smarter or better-funded. They have optionality. They know people in every time zone who would take their call.</p>

<h2>On Being Useful First</h2>

<p>The most practical advice from the session came from a founder who has built what she calls a "give first" practice. Every week, she identifies three people in her network she can do something for — a warm intro, a piece of research, a job candidate for their open role. Not because she needs something. Because in three years she might, and by then the account will be full.</p>

<p>"Most people show up in someone's inbox when they need a favor," she said. "I try to show up when I have one to give. It sounds obvious. Almost nobody actually does it."</p>

<h2>The Long Game</h2>

<p>Relationships that matter take years. The investors who backed this room's founders were, in most cases, people they had known for two to five years before a check was written. The co-founders who stayed together through hard times had built trust long before the company existed. The customers who became champions had been served well, again and again, before they ever picked up the phone to refer a friend.</p>

<p>There is no shortcut to this. The only strategy is to start early, to be genuinely useful, and to stay in the game long enough for the compounding to show up.</p>

<div class="article-author" style="margin-top:48px;padding-top:28px;border-top:1px solid #E0DCD1;display:flex;align-items:center;gap:18px;">
  <img class="author-avatar" src="https://olivierhome.com/wp-content/uploads/2026/05/IMG_9685-3-scaled-e1778694153354.webp" alt="Ivan Vavryk" style="width:44px;height:44px;border-radius:50%;object-fit:cover;" />
  <div class="author-text">
    <span class="label" style="font-size:12px;color:#8A8475;display:block;">Written by</span>
    <span class="name" style="font-size:15px;color:#2A2920;">Ivan Vavryk</span>
  </div>
</div>`,
  },
  {
    number: 4,
    title: "Staying Sharp: The Founder's Guide to Mental Edge",
    slug: "founder-mental-edge",
    excerpt:
      "The best founders aren't the ones who work the most hours. They're the ones who protect their ability to think clearly when it matters most.",
    cover_url: "https://vavrykworld.com/wp-content/uploads/2026/03/Add-a-heading-38.png",
    published: true,
    content: `<p>The best founders aren't the ones who work the most hours. They're the ones who protect their ability to think clearly when it matters most. Olivier Club sat down with a neuroscientist, a founder who sold his company for $90M, and an executive coach who works with some of the most high-performing people in tech to talk about one thing: the mind as a competitive advantage.</p>

<h2>The Biggest Lie in Startup Culture</h2>

<p>Sleep deprivation is not a badge of honor. It is a performance destroyer. The science on this is not ambiguous: after 20 hours without sleep, cognitive function declines to the equivalent of a 0.08 blood alcohol level. After 24 hours, decision-making quality drops by over 30%. The founders who romanticize 4-hour nights are not working harder — they are producing worse work, slower, with more errors, and they are building habits that will eventually cost them their company or their health.</p>

<p>"I lost my Series B because I made a decision about a term sheet at 1am after a 16-hour day," said one founder in the room. "I knew better. I was too tired to act on what I knew."</p>

<h2>Decision Hygiene</h2>

<p>High-stakes decisions deserve protected time. Not email time. Not between-meetings time. Dedicated, uninterrupted blocks where your brain has fuel, you're not context-switching, and you have the information you actually need.</p>

<p>The founder who sold his company at $90M described a simple rule: no irreversible decisions after 6pm. Reversible ones — scheduling, communication, operational choices — fine. But anything that couldn't be undone waited until morning. "It sounds rigid," he said. "It saved me from myself multiple times."</p>

<h2>The Energy Audit</h2>

<p>The executive coach introduced a framework she uses with founder clients: the energy audit. For two weeks, track not your hours but your energy — what drained you, what energized you, what left you flat. Most founders are shocked by the results. The meetings that feel productive are often the ones that cost the most. The solo deep-work blocks they keep cutting are the ones that fuel everything else.</p>

<p>Once you have the data, the question is simple: what can you remove, delegate, or restructure? Most founders are spending 60–70% of their time on work that doesn't require them specifically. That's not humility. That's waste.</p>

<h2>Recovery Is Part of the Work</h2>

<p>The neuroscientist closed with something that landed hard in the room: your brain consolidates learning, builds new connections, and solves problems you couldn't solve while awake — during rest. The insight you need for your product roadmap is more likely to come on a hike than in a fourth consecutive hour of a strategy document.</p>

<p>This isn't permission to be lazy. It's permission to take recovery seriously. The founders who last — who build companies over decades, not sprints — have figured out that protecting their mental edge is not self-indulgence. It is their single most important competitive advantage.</p>

<p>The room left quieter than it arrived. That's usually a good sign.</p>

<div class="article-author" style="margin-top:48px;padding-top:28px;border-top:1px solid #E0DCD1;display:flex;align-items:center;gap:18px;">
  <img class="author-avatar" src="https://olivierhome.com/wp-content/uploads/2026/05/IMG_9685-3-scaled-e1778694153354.webp" alt="Ivan Vavryk" style="width:44px;height:44px;border-radius:50%;object-fit:cover;" />
  <div class="author-text">
    <span class="label" style="font-size:12px;color:#8A8475;display:block;">Written by</span>
    <span class="name" style="font-size:15px;color:#2A2920;">Ivan Vavryk</span>
  </div>
</div>`,
  },
];

async function seed() {
  await sql`
    CREATE TABLE IF NOT EXISTS oc_discussions (
      id           SERIAL PRIMARY KEY,
      number       INTEGER NOT NULL DEFAULT 1,
      title        TEXT NOT NULL,
      slug         TEXT NOT NULL UNIQUE,
      excerpt      TEXT NOT NULL DEFAULT '',
      cover_url    TEXT NOT NULL DEFAULT '',
      content      TEXT NOT NULL DEFAULT '',
      published    BOOLEAN NOT NULL DEFAULT false,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      published_at TIMESTAMPTZ
    )
  `;

  for (const a of articles) {
    await sql`
      INSERT INTO oc_discussions (number, title, slug, excerpt, cover_url, content, published, published_at)
      VALUES (
        ${a.number}, ${a.title}, ${a.slug}, ${a.excerpt},
        ${a.cover_url}, ${a.content}, ${a.published},
        ${a.published ? new Date().toISOString() : null}
      )
      ON CONFLICT (slug) DO UPDATE SET
        number       = EXCLUDED.number,
        title        = EXCLUDED.title,
        excerpt      = EXCLUDED.excerpt,
        cover_url    = EXCLUDED.cover_url,
        content      = EXCLUDED.content,
        published    = EXCLUDED.published,
        published_at = COALESCE(oc_discussions.published_at, EXCLUDED.published_at)
    `;
    console.log(`✓ ${a.title}`);
  }

  console.log("Done.");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
