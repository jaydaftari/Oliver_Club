"use client";

import { useRef } from "react";

/**
 * "Roadmapping Engine" app-showcase carousel. Arrow buttons scroll the track
 * one card at a time; the track also free-scrolls / snaps on touch.
 */
export default function RoadmapCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);

  function step(): number {
    const track = trackRef.current;
    if (!track) return 320;
    const card = track.querySelector(".re-card");
    if (!card) return 320;
    const styles = getComputedStyle(track);
    const gap = parseFloat(styles.columnGap || styles.gap || "24") || 24;
    return card.getBoundingClientRect().width + gap;
  }

  function scroll(dir: 1 | -1) {
    trackRef.current?.scrollBy({ left: dir * step(), behavior: "smooth" });
  }

  return (
    <div className="re-carousel">
      <button className="re-nav re-prev" aria-label="Previous" onClick={() => scroll(-1)}>
        ←
      </button>
      <div className="re-track" ref={trackRef}>
        {/* Card 1: roadmap / steps */}
        <article className="re-card">
          <div className="app-chrome">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
            <span className="app-url">findyourself.ai / roadmap</span>
          </div>
          <div className="app-body app-roadmap">
            <div className="app-row-top">
              <div>
                <p className="app-eyebrow">YOUR ROADMAP</p>
                <h4 className="app-title">Launch an AI robotics marketplace</h4>
              </div>
              <span className="app-pill">38% complete</span>
            </div>
            <ul className="step-list">
              <li className="done">
                <span className="step-ic">✓</span>
                <div>
                  <b>Validate the wedge</b>
                  <span>12 customer interviews · done</span>
                </div>
              </li>
              <li className="done">
                <span className="step-ic">✓</span>
                <div>
                  <b>Define the MVP scope</b>
                  <span>Rent &amp; repair flows first</span>
                </div>
              </li>
              <li className="active">
                <span className="step-ic">▸</span>
                <div>
                  <b>Build the first unit</b>
                  <span>In progress · 2 of 5 tasks</span>
                </div>
              </li>
              <li>
                <span className="step-ic" />
                <div>
                  <b>First 10 paying customers</b>
                  <span>Target: 6 weeks</span>
                </div>
              </li>
              <li>
                <span className="step-ic" />
                <div>
                  <b>Raise a pre-seed round</b>
                  <span>Warm intros ready</span>
                </div>
              </li>
            </ul>
          </div>
        </article>

        {/* Card 2: people to connect with */}
        <article className="re-card">
          <div className="app-chrome">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
            <span className="app-url">findyourself.ai / connect</span>
          </div>
          <div className="app-body app-connect">
            <p className="app-eyebrow">PEOPLE TO CONNECT WITH</p>
            <h4 className="app-title">Matched to your next step</h4>
            <div className="person">
              <span className="avatar" style={{ background: "#C9A26B" }} />
              <div className="p-info">
                <b>Fernando L.</b>
                <span>Founder · AI &amp; Robotics</span>
              </div>
              <button className="p-btn">Connect</button>
            </div>
            <div className="person">
              <span className="avatar" style={{ background: "#7FA8C9" }} />
              <div className="p-info">
                <b>Mara K.</b>
                <span>Pre-seed Investor</span>
              </div>
              <button className="p-btn">Connect</button>
            </div>
            <div className="person">
              <span className="avatar" style={{ background: "#8FB08A" }} />
              <div className="p-info">
                <b>Devin R.</b>
                <span>Hardware Supply Chain</span>
              </div>
              <button className="p-btn">Connect</button>
            </div>
            <p className="app-foot">3 of 14 matches · refreshed today</p>
          </div>
        </article>

        {/* Card 3: AI agent chat */}
        <article className="re-card">
          <div className="app-chrome">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
            <span className="app-url">findyourself.ai / agent</span>
          </div>
          <div className="app-body app-chat">
            <p className="app-eyebrow">ROADMAPPING AGENT</p>
            <div className="bubble user">How do I get my first ten customers?</div>
            <div className="bubble bot">
              Start with the 12 founders you interviewed — 4 already said they&apos;d pay. I drafted
              outreach for each and blocked time on your calendar.
            </div>
            <div className="bubble bot mini">→ 4 warm intros queued</div>
            <div className="chat-input">
              <span>Ask anything…</span>
              <span className="send">↑</span>
            </div>
          </div>
        </article>

        {/* Card 4: progress dashboard */}
        <article className="re-card">
          <div className="app-chrome">
            <span className="dot" />
            <span className="dot" />
            <span className="dot" />
            <span className="app-url">findyourself.ai / momentum</span>
          </div>
          <div className="app-body app-dash">
            <p className="app-eyebrow">MOMENTUM</p>
            <h4 className="app-title">This week</h4>
            <div className="metric-row">
              <div className="metric">
                <b>4</b>
                <span>Intros made</span>
              </div>
              <div className="metric">
                <b>2</b>
                <span>Steps shipped</span>
              </div>
            </div>
            <div className="bars">
              <span style={{ height: "40%" }} />
              <span style={{ height: "65%" }} />
              <span style={{ height: "52%" }} />
              <span style={{ height: "80%" }} />
              <span style={{ height: "70%" }} />
              <span style={{ height: "95%" }} />
            </div>
            <p className="app-foot">On track for your 6-week goal</p>
          </div>
        </article>
      </div>
      <button className="re-nav re-next" aria-label="Next" onClick={() => scroll(1)}>
        →
      </button>
    </div>
  );
}
