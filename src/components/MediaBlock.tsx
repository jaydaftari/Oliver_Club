"use client";

import { useState } from "react";

export default function MediaBlock() {
  const [clicked, setClicked] = useState(false);

  return (
    <div className="media-block" role="img" aria-label="Program intro video placeholder">
      <button
        className="play-btn"
        type="button"
        aria-label="Play intro video"
        onClick={() => setClicked(true)}
        style={clicked ? { transform: "scale(0.95)" } : undefined}
        onTransitionEnd={() => setClicked(false)}
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
      <span className="placeholder-label">
        {clicked ? "[ video would play here ]" : "[ intro video ]"}
      </span>
    </div>
  );
}
