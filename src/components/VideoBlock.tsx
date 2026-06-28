"use client";

import { useEffect, useRef, useState } from "react";

const VIMEO_PORTRAIT =
  "https://player.vimeo.com/video/1191995814?h=37fe445194&badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1&controls=0&title=0&byline=0&portrait=0&loop=0&dnt=1";

const VIMEO_LANDSCAPE =
  "https://player.vimeo.com/video/1182624628?h=529145f751&background=1&autoplay=1&loop=1&muted=1";

interface Props {
  landscape?: boolean;
  /** Poster still shown immediately while the video iframe loads. */
  poster?: string;
}

export default function VideoBlock({ landscape = false, poster }: Props) {
  const [playing, setPlaying] = useState(false);

  if (landscape) {
    return <LandscapeVideo poster={poster} />;
  }

  function play() {
    if (!playing) setPlaying(true);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      play();
    }
  }

  return (
    <div
      className={`video-block${playing ? " playing" : ""}`}
      role={playing ? undefined : "button"}
      tabIndex={playing ? -1 : 0}
      aria-label={playing ? undefined : "Play discussion recording"}
      onClick={play}
      onKeyDown={handleKeyDown}
    >
      {playing ? (
        <iframe
          className="video-iframe video-fade video-loaded"
          src={VIMEO_PORTRAIT}
          allow="autoplay; fullscreen; picture-in-picture"
          frameBorder="0"
          title="Discussion recording"
        />
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="video-poster"
            src={poster || "https://vavrykworld.com/wp-content/uploads/2026/05/TRAKA-2.png"}
            alt=""
            aria-hidden="true"
          />
          <div className="play-btn" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Background landscape video: shows the poster instantly, defers the heavy
 * Vimeo iframe until the tile scrolls near the viewport, then fades the video
 * in once it has actually loaded — so the tile is never a long black box.
 */
function LandscapeVideo({ poster }: { poster?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [posterOk, setPosterOk] = useState(Boolean(poster));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      // No IO support → just load the video. Runs once on mount.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { rootMargin: "250px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="video-block video-block-landscape" ref={ref}>
      {poster && posterOk && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="video-poster"
          src={poster}
          alt=""
          aria-hidden="true"
          onError={() => setPosterOk(false)}
        />
      )}
      {!loaded && <span className="video-spinner" aria-hidden="true" />}
      {inView && (
        <iframe
          className={`video-iframe video-fade${loaded ? " video-loaded" : ""}`}
          src={VIMEO_LANDSCAPE}
          allow="autoplay; fullscreen; picture-in-picture"
          frameBorder="0"
          title="Market Intelligence Program"
          onLoad={() => setLoaded(true)}
        />
      )}
    </div>
  );
}
