"use client";

import { useEffect, useRef, useState } from "react";
import Player from "@vimeo/player";
import { parseVimeo, formatTimecode } from "@/lib/club-constants";
import { T } from "./theme";

/**
 * Vimeo workshop player with a custom, always-visible control bar (the native
 * Vimeo bar auto-hides). Supports "key points": playback starts at `start` and
 * pauses once at `end` — the clip an admin curated — but the member can scrub the
 * full timeline at any time, which releases the clamp so the whole video plays.
 */
export default function WorkshopPlayer({
  vimeoUrl,
  title,
  start = 0,
  end = null,
}: {
  vimeoUrl: string;
  title: string;
  start?: number;
  end?: number | null;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);
  const clampActiveRef = useRef(false);
  const selfSeekingRef = useRef(false);
  const scrubbingRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const v = parseVimeo(vimeoUrl);
    if (!v) return;

    const player = new Player(mount, {
      url: v.hash ? `https://vimeo.com/${v.id}/${v.hash}` : `https://vimeo.com/${v.id}`,
      controls: false, // we render our own persistent control bar
      title: false,
      byline: false,
      portrait: false,
      dnt: true,
      playsinline: true,
    });
    playerRef.current = player;
    clampActiveRef.current = end != null && end > start;

    player
      .ready()
      .then(async () => {
        setReady(true);
        try {
          setDuration(await player.getDuration());
          setMuted(await player.getMuted());
        } catch {
          /* ignore */
        }
        if (start > 0) {
          selfSeekingRef.current = true; // our seek isn't the member taking control
          await player.setCurrentTime(start).catch(() => {});
        }
      })
      .catch(() => {});

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onSeeked = () => {
      if (selfSeekingRef.current) {
        selfSeekingRef.current = false;
        return;
      }
      clampActiveRef.current = false; // member scrubbed → let them roam the whole video
    };
    const onTimeUpdate = (data: { seconds: number; duration: number }) => {
      if (data.duration && data.duration !== duration) setDuration(data.duration);
      if (!scrubbingRef.current) setCurrent(data.seconds);
      if (clampActiveRef.current && end != null && data.seconds >= end) {
        clampActiveRef.current = false; // pause once at the end of the curated clip
        player.pause().catch(() => {});
      }
    };

    player.on("play", onPlay);
    player.on("pause", onPause);
    player.on("seeked", onSeeked);
    player.on("timeupdate", onTimeUpdate);

    return () => {
      player.off("play", onPlay);
      player.off("pause", onPause);
      player.off("seeked", onSeeked);
      player.off("timeupdate", onTimeUpdate);
      player.destroy().catch(() => {});
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vimeoUrl, start, end]);

  function togglePlay() {
    const p = playerRef.current;
    if (!p) return;
    if (playing) p.pause().catch(() => {});
    else p.play().catch(() => {});
  }

  function toggleMute() {
    const p = playerRef.current;
    if (!p) return;
    const next = !muted;
    setMuted(next);
    p.setMuted(next).catch(() => {});
  }

  function seekTo(value: number) {
    const p = playerRef.current;
    if (!p) return;
    clampActiveRef.current = false; // an explicit seek means the member is in control
    setCurrent(value);
    p.setCurrentTime(value).catch(() => {});
  }

  function fullscreen() {
    playerRef.current?.requestFullscreen().catch(() => {});
  }

  const pct = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div
        ref={mountRef}
        aria-label={title}
        className="workshop-player"
        style={{ position: "absolute", inset: 0 }}
      />

      {/* tap-to-play layer (sits above the iframe, below the control bar) */}
      <button
        type="button"
        aria-label={playing ? "Pause" : "Play"}
        onClick={togglePlay}
        style={{
          position: "absolute",
          inset: 0,
          background: "transparent",
          cursor: "pointer",
        }}
      />

      {/* custom control bar */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          padding: "26px 12px 10px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))",
          opacity: ready ? 1 : 0,
          transition: "opacity 0.2s",
        }}
      >
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "Pause" : "Play"}
          style={ctrlBtn}
        >
          {playing ? "❚❚" : "►"}
        </button>

        <input
          type="range"
          className="wp-range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={Math.min(current, duration || 0)}
          disabled={!duration}
          aria-label="Seek"
          onPointerDown={() => {
            scrubbingRef.current = true;
          }}
          onPointerUp={() => {
            scrubbingRef.current = false;
          }}
          onChange={(e) => seekTo(Number(e.target.value))}
          style={{
            flex: "1 1 auto",
            background: `linear-gradient(to right, ${T.accent} ${pct}%, rgba(255,255,255,0.3) ${pct}%)`,
          }}
        />

        <span
          style={{
            font: `600 11.5px/1 ${T.sans}`,
            color: "#fff",
            whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {formatTimecode(current)} / {formatTimecode(duration)}
        </span>

        <button
          type="button"
          onClick={toggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          style={ctrlBtn}
        >
          {muted ? "🔇" : "🔊"}
        </button>
        <button type="button" onClick={fullscreen} aria-label="Fullscreen" style={ctrlBtn}>
          ⛶
        </button>
      </div>
    </div>
  );
}

const ctrlBtn: React.CSSProperties = {
  flex: "none",
  width: 30,
  height: 30,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  background: "rgba(0,0,0,0.45)",
  color: "#fff",
  fontSize: 12,
  lineHeight: 1,
  cursor: "pointer",
};
