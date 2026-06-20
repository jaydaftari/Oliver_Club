"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import Link from "next/link";
import { submitApplication, type ApplicationInput } from "@/app/actions/apply";
import styles from "./HeroJourneyGame.module.css";

/* ---- The ski-game engine exposed by /apply-game.js ------------------- */
type SkiGameApi = {
  init(canvas: HTMLCanvasElement): void;
  skiToStop(k: number, cb?: () => void): void;
  summit(cb?: () => void): void;
  reset(): void;
  skierPos(): { x: number; y: number };
  stops: number;
};
/* ---- Web Speech API (speech-to-text) — minimal typings -------------- */
type SpeechAlternative = { transcript: string };
type SpeechResult = { isFinal: boolean; 0: SpeechAlternative; length: number };
type SpeechResultList = { length: number; [index: number]: SpeechResult };
type SpeechRecognitionEvent = { resultIndex: number; results: SpeechResultList };
type SpeechRecognitionErrorEvent = { error: string };
type SpeechRecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
};
type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SkiGame?: SkiGameApi;
    SkiSound?: {
      resume(): void;
      jump(): void;
      land(): void;
    };
    webkitAudioContext?: typeof AudioContext;
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

type Question = {
  id: keyof Omit<ApplicationInput, "source"> | "commit";
  q: string;
  desc?: string;
  type: "text" | "textarea" | "email" | "final";
  placeholder?: string;
  chips?: string[];
  optional?: boolean;
  required: boolean;
};

const QUESTIONS: Question[] = [
  {
    id: "identity",
    q: "What do you call yourself?",
    type: "text",
    placeholder: "Type it your way…",
    chips: ["Founder", "Scientist", "Artist", "Investor", "Engineer"],
    required: true,
  },
  {
    id: "conflict",
    q: "What's your conflict?",
    desc: "The world is not perfect — what is there to change?",
    type: "textarea",
    placeholder: "The thing that keeps you up at night…",
    required: true,
  },
  {
    id: "solution",
    q: "What is your vision of the solution?",
    type: "textarea",
    placeholder: "Paint the picture…",
    required: true,
  },
  {
    id: "path",
    q: "Your path is an asset. What led you here?",
    type: "textarea",
    placeholder: "The road so far…",
    required: true,
  },
  {
    id: "leader",
    q: "How does a person become a leader?",
    type: "textarea",
    placeholder: "Your honest take…",
    required: true,
  },
  {
    id: "teach",
    q: "What are you definitely able to teach others?",
    type: "textarea",
    placeholder: "Your edge…",
    required: true,
  },
  {
    id: "email",
    q: "Your email",
    type: "email",
    placeholder: "your@email.com",
    required: true,
  },
  {
    id: "links",
    q: "Social links / website",
    optional: true,
    type: "text",
    placeholder: "https:// …  (optional)",
    required: false,
  },
  {
    id: "commit",
    q: "If we told you that once you start this journey your life will never be the same — would you still go on it?",
    type: "final",
    required: false,
  },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Answers = Partial<Record<Question["id"], string>>;

/* ---- Retro sound effects (Web Audio, no assets) --------------------- */
function makeSfx() {
  let ac: AudioContext | null = null;
  let muted = false;
  function ctx(): AudioContext | null {
    if (muted) return null;
    if (!ac) {
      try {
        const Ctor = window.AudioContext || window.webkitAudioContext;
        if (!Ctor) return null;
        ac = new Ctor();
      } catch {
        return null;
      }
    }
    if (ac && ac.state === "suspended") ac.resume();
    return ac;
  }
  function tone(freq: number, dur: number, type: OscillatorType, vol = 0.05, when = 0) {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime + when;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + dur + 0.03);
  }
  function swish(when = 0) {
    const c = ctx();
    if (!c) return;
    const t = c.currentTime + when;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(720, t);
    o.frequency.exponentialRampToValueAtTime(280, t + 0.34);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.045, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.36);
    o.connect(g);
    g.connect(c.destination);
    o.start(t);
    o.stop(t + 0.4);
  }
  return {
    resume() {
      ctx();
    },
    select() {
      tone(560, 0.07, "square", 0.035);
    },
    advance() {
      tone(430, 0.05, "square", 0.03);
      swish(0.02);
    },
    back() {
      tone(300, 0.08, "square", 0.03);
    },
    jump() {
      tone(300, 0.22, "square", 0.05);
      tone(620, 0.22, "triangle", 0.03, 0.02);
    },
    land() {
      tone(240, 0.14, "triangle", 0.06);
      tone(150, 0.16, "square", 0.03, 0.02);
    },
    success() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, "triangle", 0.06, i * 0.14));
      tone(1568, 0.4, "triangle", 0.04, 0.58);
    },
    setMuted(m: boolean) {
      muted = !!m;
    },
    isMuted() {
      return muted;
    },
  };
}

export default function HeroJourneyGame({ source }: { source: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const sfxRef = useRef<ReturnType<typeof makeSfx> | null>(null);
  const answersRef = useRef<Answers>({});
  const submittedRef = useRef(false);
  const followRaf = useRef<number | null>(null);
  const recRef = useRef<SpeechRecognitionInstance | null>(null);
  const voiceBaseRef = useRef(""); // field text captured when dictation started
  const voiceFinalRef = useRef(""); // finalized transcript so far

  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);

  const Q = QUESTIONS[step];
  const canDictate = voiceSupported && (Q.type === "text" || Q.type === "textarea");

  /* ---- engine boot (after the script tag has loaded) ---------------- */
  const boot = useCallback(() => {
    if (!canvasRef.current || !window.SkiGame) return;
    sfxRef.current = makeSfx();
    window.SkiSound = sfxRef.current;
    window.SkiGame.init(canvasRef.current);
    window.SkiGame.skiToStop(0);
    setReady(true);
  }, []);

  // If the script was already present (fast nav / cache), boot immediately.
  useEffect(() => {
    if (window.SkiGame && !ready) boot();
  }, [boot, ready]);

  // Unlock audio on first interaction.
  useEffect(() => {
    const unlock = () => sfxRef.current?.resume();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  // Lock body scroll while the full-screen game is mounted.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      if (followRaf.current) cancelAnimationFrame(followRaf.current);
    };
  }, []);

  // Focus the field whenever a new question renders.
  useEffect(() => {
    if (!ready || Q.type === "final") return;
    const id = window.setTimeout(() => fieldRef.current?.focus(), 60);
    return () => window.clearTimeout(id);
  }, [step, ready, Q.type]);

  // Mobile: float the question card above the on-screen keyboard. The card is
  // anchored to the bottom of the layout viewport, which the keyboard covers —
  // so lift it by the keyboard's height (visualViewport vs. layout viewport).
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () => {
      const stage = stageRef.current;
      if (!stage) return;
      const keyboard = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      // >150px reliably distinguishes a keyboard from URL-bar chrome shifts.
      stage.style.bottom = keyboard > 150 ? `${keyboard + 8}px` : "";
    };
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    sync();
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
    };
  }, []);

  // Detect speech-to-text support after mount. Deliberately post-mount (not a
  // lazy initializer) so server and first client render agree — `window` is
  // absent during SSR, and gating the button on it would mismatch hydration.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setVoiceSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  // Stop any active dictation whenever we move to another question (or unmount)
  // so speech never bleeds from one answer into the next.
  useEffect(() => {
    return () => {
      recRef.current?.abort();
      recRef.current = null;
    };
  }, [step]);

  function stopVoice() {
    recRef.current?.stop();
  }

  async function toggleVoice() {
    if (listening) {
      stopVoice();
      return;
    }
    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor || !fieldRef.current) return;

    const BLOCKED = "Mic blocked. Allow it via the address-bar lock icon, then reload.";

    // The browser's speech service refuses plain-http origins (http://localhost
    // included) and returns "not-allowed" no matter the mic permission. So on a
    // non-https page, guide to HTTPS up front instead of failing confusingly.
    if (window.location.protocol !== "https:") {
      setError("Voice needs https — type your answer, or use the live site.");
      return;
    }

    // Already-denied origins won't even prompt — report precisely.
    try {
      const status = await navigator.permissions?.query({
        name: "microphone" as PermissionName,
      });
      if (status?.state === "denied") {
        setError(BLOCKED);
        return;
      }
    } catch {
      // Permissions API not available for "microphone" — fall through.
    }

    // Trigger the reliable mic prompt. Once the origin is granted, recognition
    // won't fail with "not-allowed". Release the stream immediately so it
    // doesn't contend with the recognizer.
    if (navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      } catch (err) {
        const name = err instanceof DOMException ? err.name : "";
        setError(name === "NotFoundError" ? "No microphone found." : BLOCKED);
        return;
      }
    }

    const rec = new Ctor();
    rec.lang = navigator.language || "en-US";
    rec.continuous = true;
    rec.interimResults = true;

    voiceBaseRef.current = fieldRef.current.value;
    voiceFinalRef.current = "";

    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i];
        const text = r[0].transcript;
        if (r.isFinal) voiceFinalRef.current += text;
        else interim += text;
      }
      const base = voiceBaseRef.current;
      const spoken = (voiceFinalRef.current + interim).replace(/^\s+/, "");
      const joined = base ? `${base.replace(/\s+$/, "")} ${spoken}` : spoken;
      if (fieldRef.current) fieldRef.current.value = joined;
      setError("");
    };
    rec.onerror = (e) => {
      setListening(false);
      switch (e.error) {
        case "not-allowed":
          setError(BLOCKED);
          break;
        case "service-not-allowed":
          setError("Voice isn't supported here — type your answer.");
          break;
        case "audio-capture":
          setError("No microphone found.");
          break;
        case "no-speech":
          setError("Didn't catch that — try again.");
          break;
        // "aborted" = we stopped it on purpose (e.g. moving on) — stay silent.
      }
    };
    rec.onend = () => {
      setListening(false);
      recRef.current = null;
    };

    recRef.current = rec;
    try {
      rec.start();
      setListening(true);
      sfxRef.current?.select();
    } catch {
      setListening(false);
    }
  }

  function readField(): string {
    return fieldRef.current?.value.trim() ?? "";
  }

  function shake() {
    const el = cardRef.current;
    if (!el) return;
    el.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(-8px)" },
        { transform: "translateX(8px)" },
        { transform: "translateX(-5px)" },
        { transform: "translateX(0)" },
      ],
      { duration: 260, easing: "ease-in-out" }
    );
  }

  function advance() {
    const val = readField();
    if (Q.required && !val) {
      setError("This one matters — give it a shot.");
      shake();
      return;
    }
    if (Q.type === "email" && !EMAIL_RE.test(val)) {
      setError("That email looks off. Try again.");
      shake();
      return;
    }
    answersRef.current[Q.id] = val;
    setError("");
    sfxRef.current?.advance();
    const next = step + 1;
    window.SkiGame?.skiToStop(next);
    setStep(next);
  }

  function goBack() {
    if (Q.type !== "final") answersRef.current[Q.id] = readField();
    const prev = Math.max(0, step - 1);
    setError("");
    sfxRef.current?.back();
    window.SkiGame?.skiToStop(prev);
    setStep(prev);
  }

  function positionSuccess() {
    const game = window.SkiGame;
    const el = successRef.current;
    if (!submittedRef.current || !game || !el) return;
    const p = game.skierPos();
    const h = el.offsetHeight || 150;
    const top = Math.max(78, Math.round(p.y - h - 10));
    // The bubble is centered on its left coord (translateX(-50%)); keep it
    // fully on-screen on narrow viewports.
    const halfW = el.offsetWidth / 2 + 8;
    const cx = Math.min(Math.max(p.x, halfW), window.innerWidth - halfW);
    el.style.left = `${Math.round(cx)}px`;
    el.style.top = `${top}px`;
    followRaf.current = requestAnimationFrame(positionSuccess);
  }

  async function finish() {
    if (submittedRef.current || submitting) return;
    setSubmitting(true);
    setError("");

    const a = answersRef.current;
    const payload: ApplicationInput = {
      identity: a.identity ?? "",
      conflict: a.conflict ?? "",
      solution: a.solution ?? "",
      path: a.path ?? "",
      leader: a.leader ?? "",
      teach: a.teach ?? "",
      email: a.email ?? "",
      links: a.links ?? "",
      source,
    };

    const result = await submitApplication(payload);
    if (!result.ok) {
      setSubmitting(false);
      // Jump back to the offending field so they can fix it.
      const idx = result.field ? QUESTIONS.findIndex((qq) => qq.id === result.field) : -1;
      if (idx >= 0) {
        window.SkiGame?.skiToStop(idx);
        setStep(idx);
      }
      setError(result.message);
      shake();
      return;
    }

    submittedRef.current = true;
    sfxRef.current?.advance();

    // Fade the question stage out, then send the skier to the summit.
    if (stageRef.current) {
      stageRef.current.style.opacity = "0";
      window.setTimeout(() => {
        if (stageRef.current) stageRef.current.style.display = "none";
      }, 360);
    }

    window.SkiGame?.summit(() => {
      setShowSuccess(true);
      sfxRef.current?.success();
      positionSuccess();
    });
  }

  function onChipPick(value: string) {
    if (fieldRef.current) fieldRef.current.value = value;
    fieldRef.current?.focus();
    setError("");
    sfxRef.current?.select();
  }

  function onKeyDown(e: React.KeyboardEvent) {
    const single = Q.type !== "textarea";
    if (e.key === "Enter" && (single || e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      advance();
    }
  }

  const stepLabel = `${String(step + 1).padStart(2, "0")} / 0${QUESTIONS.length}`;
  const isLast = step === QUESTIONS.length - 1;
  const defaultValue = answersRef.current[Q.id] ?? "";

  return (
    <div className={styles.root}>
      <Script src="/apply-game.js" strategy="afterInteractive" onLoad={boot} />

      {/* Branded loading screen — covers the blank canvas until the engine
          boots, so a slow connection shows progress instead of an empty sky. */}
      <div className={`${styles.loader} ${ready ? styles.loaderHidden : ""}`} aria-hidden={ready}>
        <p className={styles.loaderTitle}>OLIVIER</p>
        <div className={styles.loaderBar} />
        <p className={styles.loaderSub}>Preparing your hero journey…</p>
      </div>

      <canvas ref={canvasRef} className={styles.scene} />

      <div className={styles.hud}>
        <Link className={styles.brand} href="/">
          OLIVIER
        </Link>
        <div className={styles.hudRight}>
          <div className={styles.pips}>
            {QUESTIONS.map((_, i) => (
              <div
                key={i}
                className={`${styles.pip} ${
                  i < step ? styles.pipDone : i === step ? styles.pipCur : ""
                }`}
              />
            ))}
          </div>
          <span className={styles.stepCount}>{stepLabel}</span>
          <Link className={styles.close} href="/" aria-label="Leave the journey">
            EXIT
          </Link>
        </div>
      </div>

      <div className={styles.stage} ref={stageRef}>
        {/* key={step} retriggers the entrance animation each question */}
        <div key={step} ref={cardRef} className={`${styles.card} ${styles.cardAnimin}`}>
          <p className={styles.qIndex}>QUESTION {String(step + 1).padStart(2, "0")}</p>
          <h1 className={styles.qText}>
            {Q.q}
            {Q.optional && <span className={styles.qOptional}>OPTIONAL</span>}
          </h1>
          {Q.desc && <p className={styles.qDesc}>{Q.desc}</p>}

          {Q.type === "final" ? (
            <>
              <div className={`${styles.row} ${styles.rowStart}`}>
                <div className={styles.nav}>
                  <button className={`${styles.btn} ${styles.btnBack}`} onClick={goBack}>
                    ← BACK
                  </button>
                  <button
                    className={`${styles.btn} ${styles.btnPrimary} ${styles.btnStart}`}
                    onClick={finish}
                    disabled={submitting}
                  >
                    {submitting ? "STARTING…" : "START MY HERO JOURNEY →"}
                  </button>
                </div>
              </div>
              {error && <p className={styles.err}>{error}</p>}
              <p className={styles.hint}>No turning back from here. The mountain is waiting.</p>
            </>
          ) : (
            <>
              {Q.chips && (
                <div className={styles.chips}>
                  {Q.chips.map((c) => (
                    <button
                      type="button"
                      key={c}
                      className={styles.chip}
                      onClick={() => onChipPick(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              )}
              <div className={styles.fieldWrap}>
                {Q.type === "textarea" ? (
                  <textarea
                    ref={fieldRef}
                    className={`${styles.field} ${canDictate ? styles.fieldVoice : ""}`}
                    placeholder={Q.placeholder}
                    rows={3}
                    defaultValue={defaultValue}
                    onChange={() => error && setError("")}
                    onKeyDown={onKeyDown}
                  />
                ) : (
                  <input
                    ref={fieldRef}
                    className={`${styles.field} ${canDictate ? styles.fieldVoice : ""}`}
                    type={Q.type === "email" ? "email" : "text"}
                    placeholder={Q.placeholder}
                    defaultValue={defaultValue}
                    onChange={() => error && setError("")}
                    onKeyDown={onKeyDown}
                  />
                )}
                {canDictate && (
                  <button
                    type="button"
                    className={`${styles.voiceBtn} ${listening ? styles.voiceBtnOn : ""}`}
                    onClick={toggleVoice}
                    aria-pressed={listening}
                    aria-label={listening ? "Stop voice input" : "Fill with voice"}
                    title={listening ? "Stop voice input" : "Fill with voice"}
                  >
                    <MicIcon />
                  </button>
                )}
              </div>
              {canDictate && (
                <p className={styles.voiceHint}>
                  {listening
                    ? "Listening… speak now. Tap the mic to stop."
                    : "Tap the mic to dictate."}
                </p>
              )}
              <div className={styles.row}>
                <div className={styles.err}>{error}</div>
                <div className={styles.nav}>
                  {step > 0 && (
                    <button className={`${styles.btn} ${styles.btnBack}`} onClick={goBack}>
                      ← BACK
                    </button>
                  )}
                  <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={advance}>
                    {isLast ? "FINISH →" : "NEXT →"}
                  </button>
                </div>
              </div>
              <p className={styles.hint}>
                Press <b>{Q.type !== "textarea" ? "Enter" : "Ctrl + Enter"}</b> to continue
              </p>
            </>
          )}
        </div>
      </div>

      <div
        ref={successRef}
        className={`${styles.success} ${showSuccess ? styles.successShow : ""}`}
      >
        <div className={styles.bubble}>
          <p className={styles.big}>SUCCESS!</p>
          <p className={styles.sub}>Wait for a first signal.</p>
        </div>
        <div>
          <Link className={styles.homeLink} href="/">
            RETURN HOME
          </Link>
        </div>
      </div>
    </div>
  );
}

/* A clear, conventional microphone icon. */
function MicIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10v1a7 7 0 0 0 14 0v-1" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  );
}
