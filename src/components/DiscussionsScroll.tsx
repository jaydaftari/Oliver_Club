import Image from "next/image";

// Recent discussions on the homepage are three fixed, static banners (the design).
// They are not links. Dynamic, DB-driven write-ups live on the Insights page (/blog).
const BANNERS = [
  "/discussions/discussion-1.png",
  "/discussions/discussion-2.png",
  "/discussions/discussion-3.png",
];

export default function DiscussionsScroll() {
  return (
    <section className="past-events">
      <h2 className="h-section">Recent discussions</h2>
      <div className="past-grid">
        {BANNERS.map((src) => (
          <div key={src} className="past-card">
            <Image
              src={src}
              alt="Past Olivier Club discussion"
              fill
              style={{ objectFit: "cover" }}
              sizes="(max-width: 720px) 360px, 300px"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
