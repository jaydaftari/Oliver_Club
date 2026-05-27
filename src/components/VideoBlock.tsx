"use client";

import { useState } from "react";

const VIMEO_PORTRAIT =
  "https://player.vimeo.com/video/1191995814?h=37fe445194&badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=0&controls=0&title=0&byline=0&portrait=0&loop=0&dnt=1";

const VIMEO_LANDSCAPE =
  "https://player.vimeo.com/video/1182624628?h=529145f751&background=1&autoplay=1&loop=1&muted=1";

interface Props {
  landscape?: boolean;
}

export default function VideoBlock({ landscape = false }: Props) {
  const [playing, setPlaying] = useState(false);

  if (landscape) {
    return (
      <div className="video-block video-block-landscape">
        <iframe
          className="video-iframe"
          src={VIMEO_LANDSCAPE}
          allow="autoplay; fullscreen; picture-in-picture"
          frameBorder="0"
          title="Market Intelligence Program"
        />
      </div>
    );
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
          className="video-iframe"
          src={VIMEO_PORTRAIT}
          allow="autoplay; fullscreen; picture-in-picture"
          frameBorder="0"
        />
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="video-poster"
            src="https://vavrykworld.com/wp-content/uploads/2026/05/TRAKA-2.png"
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
