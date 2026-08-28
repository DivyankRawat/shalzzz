"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import gsap from "gsap";

type Remaining = {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

type Unit = "days" | "hours" | "minutes" | "seconds";

export type ShowtimeLockProps = {
  tickerText?: string;
  marqueeTitle?: string;
  marqueeSub?: string;
  doorsText?: string;
  songSrc?: string;
  songVolume?: number;
  redirectTo?: string;
  targetDate?: Date | string;
  showPreviewButton?: boolean;
  children?: React.ReactNode;
};

const DEFAULT_TARGET = "2026-08-29T00:00:00+05:30";

/**
 * How long the marquee holds once the date has already passed. Without it the
 * gate opens on the same frame it mounts and nobody ever sees it; with it the
 * clock runs down from ten and the curtains part through the usual path.
 */
const GRACE_MS = 10_000;

/**
 * The ticker scrolls by translating the track -50%, which only reads as an
 * endless strip while half the track is at least as wide as the screen.
 * Twenty-four copies keep it filled past a 4K display.
 */
const TICKER_COPIES = 24;

export default function ShowtimeLock({
  tickerText = "SAVE THE DATE · AUGUST 29 ·",
  marqueeTitle = "NOW SHOWING",
  marqueeSub = "Birthday celebration, live August 29th",
  doorsText = "doors open at midnight, IST",
  songSrc,
  songVolume = 0.6,
  redirectTo,
  targetDate = DEFAULT_TARGET,
  showPreviewButton = true,
  children,
}: ShowtimeLockProps) {
  const router = useRouter();

  const [showChildren, setShowChildren] = useState(false);
  const [opened, setOpened] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [previewArmed, setPreviewArmed] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const ambienceRef = useRef<HTMLDivElement>(null);
  const flickerRef = useRef<HTMLDivElement>(null);
  const curtainLRef = useRef<HTMLDivElement>(null);
  const curtainRRef = useRef<HTMLDivElement>(null);
  const lockContentRef = useRef<HTMLDivElement>(null);
  const bulbTopRef = useRef<HTMLDivElement>(null);
  const bulbBottomRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const daysRef = useRef<HTMLDivElement>(null);
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);
  const secondsRef = useRef<HTMLDivElement>(null);

  const builtRef = useRef<Record<Unit, boolean>>({
    days: false,
    hours: false,
    minutes: false,
    seconds: false,
  });
  const openedOnceRef = useRef(false);
  const reducedRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const targetMsRef = useRef(new Date(targetDate).getTime());
  const graceUntilRef = useRef<number | null>(null);

  useEffect(() => {
    reducedRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setHydrated(true);
  }, []);

  // The lock owns the viewport while it is up, so the page underneath must
  // not be scrollable behind it.
  useEffect(() => {
    if (opened) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [opened]);

  useEffect(() => {
    if (opened || !hydrated) return;
    const fill = (el: HTMLDivElement | null, count: number) => {
      if (!el) return;
      el.innerHTML = "";
      for (let i = 0; i < count; i++) {
        const dot = document.createElement("span");
        dot.className = "bulb-dot";
        el.appendChild(dot);
      }
    };
    fill(bulbTopRef.current, 22);
    fill(bulbBottomRef.current, 22);
  }, [opened, hydrated]);

  // Marquee bulbs chase around the rails, and the whole frame carries a faint
  // projector flicker driven by a self-scheduling tween — a fixed keyframe
  // loop reads as a pulse, random re-tweens read as a lamp.
  useEffect(() => {
    if (opened || !hydrated || reducedRef.current) return;

    const dots = rootRef.current?.querySelectorAll(".bulb-dot");
    const bulbTween =
      dots && dots.length
        ? gsap.to(dots, {
            opacity: 1,
            scale: 1.5,
            duration: 0.5,
            ease: "power1.inOut",
            stagger: { each: 0.045, repeat: -1, yoyo: true },
          })
        : null;

    let stopped = false;
    const flick = () => {
      if (stopped) return;
      gsap.to(flickerRef.current, {
        opacity: () => Math.random() * 0.045,
        duration: () => 0.06 + Math.random() * 0.18,
        ease: "power1.inOut",
        onComplete: flick,
      });
    };
    flick();

    return () => {
      stopped = true;
      bulbTween?.kill();
      if (flickerRef.current) gsap.killTweensOf(flickerRef.current);
    };
  }, [opened, hydrated]);

  useEffect(() => {
    if (opened || !songSrc || !hydrated) return;
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = songVolume;
    const tryPlay = () => {
      audio.play().catch(() => {});
    };
    tryPlay();
    window.addEventListener("pointerdown", tryPlay, { once: true });
    return () => {
      window.removeEventListener("pointerdown", tryPlay);
      audio.pause();
      audio.currentTime = 0;
    };
  }, [opened, songSrc, songVolume, hydrated]);

  // --- odometer ------------------------------------------------------------

  const buildOdometer = useCallback((host: HTMLDivElement, digits: number[]) => {
    host.innerHTML = "";
    for (let i = 0; i < digits.length; i++) {
      const col = document.createElement("span");
      col.className = "od-col";
      const strip = document.createElement("span");
      strip.className = "od-strip";
      for (let d = 0; d < 10; d++) {
        const digit = document.createElement("span");
        digit.className = "od-digit";
        digit.textContent = String(d);
        strip.appendChild(digit);
      }
      col.appendChild(strip);
      host.appendChild(col);
    }
  }, []);

  const rollOdometer = useCallback(
    (host: HTMLDivElement, digits: number[], animate: boolean) => {
      [...host.children].forEach((col, i) => {
        const h = col.getBoundingClientRect().height;
        const strip = col.querySelector(".od-strip");
        if (!strip) return;
        if (animate && !reducedRef.current) {
          gsap.to(strip, { y: -digits[i] * h, duration: 0.5, ease: "power3.out" });
        } else {
          gsap.set(strip, { y: -digits[i] * h });
        }
      });
    },
    [],
  );

  const setUnit = useCallback(
    (host: HTMLDivElement | null, unit: Unit, value: string) => {
      if (!host) return;
      const digits = value.split("").map(Number);
      if (!builtRef.current[unit]) {
        buildOdometer(host, digits);
        builtRef.current[unit] = true;
        // Column height is only measurable once the browser has laid the
        // freshly built strips out, so the first placement waits a frame.
        requestAnimationFrame(() => rollOdometer(host, digits, false));
        return;
      }
      rollOdometer(host, digits, true);
    },
    [buildOdometer, rollOdometer],
  );

  // --- curtain call --------------------------------------------------------

  const open = useCallback(() => {
    if (openedOnceRef.current) return;
    openedOnceRef.current = true;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    gsap.killTweensOf(rootRef.current?.querySelectorAll(".bulb-dot") ?? []);
    if (flickerRef.current) gsap.killTweensOf(flickerRef.current);

    const finish = () => {
      if (redirectTo) {
        router.push(redirectTo);
        return;
      }
      setShowChildren(true);
      requestAnimationFrame(() => {
        if (reducedRef.current) {
          setOpened(true);
        } else {
          gsap.to(rootRef.current, {
            opacity: 0,
            duration: 0.6,
            delay: 0.15,
            ease: "power2.out",
            onComplete: () => setOpened(true),
          });
        }
      });
    };

    const left = curtainLRef.current;
    const right = curtainRRef.current;

    if (!reducedRef.current && left && right) {
      if (audioRef.current && !audioRef.current.paused) {
        gsap.to(audioRef.current, { volume: 0, duration: 1.1, ease: "power1.in" });
      }
      gsap
        .timeline({ onComplete: finish })
        .to(lockContentRef.current, {
          opacity: 0,
          y: -10,
          duration: 0.35,
          ease: "power2.inOut",
        })
        .addLabel("open", "+=0.05")
        .to(left, { xPercent: -100, duration: 1, ease: "power3.inOut", force3D: true }, "open")
        .to(right, { xPercent: 100, duration: 1, ease: "power3.inOut", force3D: true }, "open")
        .to(ambienceRef.current, { opacity: 0, duration: 0.6, ease: "power2.out" }, "open");
    } else {
      finish();
    }
  }, [redirectTo, router]);

  useEffect(() => {
    if (opened) return;

    // The remaining time comes off the server clock, not the visitor's — a
    // local Date() would let anyone walk in early by changing their system time.
    async function remaining(): Promise<Remaining> {
      const res = await fetch("/api/time", { cache: "no-store" });
      const { now } = (await res.json()) as { now: number };
      let diff = targetMsRef.current - now;

      // Date already gone: run a short countdown instead of opening instantly.
      // The deadline is pinned on the first tick, in server time, so it stays
      // accurate however long each request takes.
      if (diff <= 0) {
        if (graceUntilRef.current === null) graceUntilRef.current = now + GRACE_MS;
        diff = graceUntilRef.current - now;
      }

      if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
      const total = Math.floor(diff / 1000);
      return {
        total,
        days: Math.floor(total / 86400),
        hours: Math.floor((total % 86400) / 3600),
        minutes: Math.floor((total % 3600) / 60),
        seconds: total % 60,
      };
    }

    async function tick() {
      const r = await remaining();
      setUnit(daysRef.current, "days", String(Math.min(r.days, 99)).padStart(2, "0"));
      setUnit(hoursRef.current, "hours", String(r.hours).padStart(2, "0"));
      setUnit(minutesRef.current, "minutes", String(r.minutes).padStart(2, "0"));
      setUnit(secondsRef.current, "seconds", String(r.seconds).padStart(2, "0"));
      if (r.total <= 0) open();
    }

    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [opened, setUnit, open]);

  const lock = (
    <div className="showtime-root " ref={rootRef}>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Anton&family=Bebas+Neue&family=Caveat:wght@500;600&family=JetBrains+Mono:wght@500;700&display=swap"
      />
      {songSrc && <audio ref={audioRef} src={songSrc} loop preload="auto" />}

      <div ref={ambienceRef}>
        <div className="rail left" />
        <div className="rail right" />
        <div className="flicker" ref={flickerRef} />
        <div className="vignette" />
        <div className="spotlight" />
        <div className="grain" />
      </div>

      {showPreviewButton &&
        (previewArmed ? (
          <button type="button" className="preview-btn" onClick={open}>
            Preview
          </button>
        ) : (
          <button
            type="button"
            className="preview-star"
            onClick={() => setPreviewArmed(true)}
            aria-label="Reveal the preview button"
          >
            <svg viewBox="0 0 100 100" aria-hidden="true">
              <path
                d="M50 0c0 27.6 22.4 50 50 50-27.6 0-50 22.4-50 50 0-27.6-22.4-50-50-50 27.6 0 50-22.4 50-50z"
                fill="currentColor"
              />
            </svg>
          </button>
        ))}

      <div className="lock">
        <div className="curtain-l" ref={curtainLRef} />
        <div className="curtain-r" ref={curtainRRef} />

        <div className="screen">
          <span className="corner corner-tl" aria-hidden="true">
            &#10022;
          </span>
          <span className="corner corner-tr" aria-hidden="true">
            &#10022;
          </span>
          <span className="corner corner-bl" aria-hidden="true">
            &#10022;
          </span>
          <span className="corner corner-br" aria-hidden="true">
            &#10022;
          </span>

          <div className="lock-content" ref={lockContentRef}>
            <div className="lock-banner">
              <div className="bulb-rail top" ref={bulbTopRef} />

              <div className="ticker">
                <div className="ticker-track">
                  {Array.from({ length: TICKER_COPIES }, (_, i) => (
                    <span key={i}>{tickerText}</span>
                  ))}
                </div>
              </div>

              <div className="bulb-rail bottom" ref={bulbBottomRef} />
            </div>

            <div className="lock-body">
            <h1 className="marquee-title">
              <span className="marquee-title-star" aria-hidden="true">
                &#10022;
              </span>
              {marqueeTitle}
              <span className="marquee-title-star" aria-hidden="true">
                &#10022;
              </span>
            </h1>
            <p className="marquee-sub">{marqueeSub}</p>

            <div className="hero-days">
              <div className="od-number" ref={daysRef} />
              <div className="hero-caption">days to curtain</div>
            </div>

            <div className="rest-row">
              <div className="bulb-tile">
                <div className="od-number" ref={hoursRef} />
                <span className="bulb-label">hrs</span>
              </div>
              <div className="bulb-tile">
                <div className="od-number" ref={minutesRef} />
                <span className="bulb-label">min</span>
              </div>
              <div className="bulb-tile">
                <div className="od-number" ref={secondsRef} />
                <span className="bulb-label">sec</span>
              </div>
            </div>

            <div className="perforation" aria-hidden="true" />
            <p className="lock-foot">{doorsText}</p>
            </div>
          </div>
        </div>
      </div>

      <style>{SHOWTIME_CSS}</style>
    </div>
  );

  return (
    <>
      {showChildren && !redirectTo && children}
      {!opened && hydrated && createPortal(lock, document.body)}
    </>
  );
}

const SHOWTIME_CSS = `
        .showtime-root {
          --bg: #000000;
          --bg-2: #0d0d0f;
          --paper: #f3efe7;
          --accent: #ffb7ce;
          --accent-glow: rgba(255, 183, 206, 0.5);
          --curtain: #000000;
          --curtain-2: #121212;
          --muted: #8a8a90;
          --film: #141418;
          --font-display: 'Bebas Neue', sans-serif;
          --font-marquee: 'Anton', 'Bebas Neue', sans-serif;
          --font-script: 'Caveat', cursive;
          --font-mono: 'JetBrains Mono', monospace;
          --accent-soft: #ffd4e2;
          --rail: 26px;

          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          height: 100dvh;
          z-index: 999;
          background: radial-gradient(120% 90% at 50% 40%, var(--bg-2) 0%, var(--bg) 70%);
          color: var(--paper);
          font-family: var(--font-mono);
          -webkit-font-smoothing: antialiased;
          overflow: hidden;
          isolation: isolate;
        }
        .showtime-root * {
          box-sizing: border-box;
        }

        .showtime-root .rail {
          position: absolute;
          top: 0;
          bottom: 0;
          width: var(--rail);
          z-index: 3;
          background-color: var(--film);
          background-image: radial-gradient(circle, var(--bg) 5px, transparent 5.6px);
          background-size: 100% 30px;
          background-position: center;
        }
        .showtime-root .rail.left {
          left: 0;
        }
        .showtime-root .rail.right {
          right: 0;
        }

        .showtime-root .flicker {
          position: absolute;
          inset: 0;
          z-index: 2;
          background: #fff;
          opacity: 0;
          pointer-events: none;
          mix-blend-mode: overlay;
        }

        /* Soft dark corners so the frame reads like it's lit by a single
           projector beam rather than flat-lit edge to edge. */
        .showtime-root .vignette {
          position: absolute;
          inset: 0;
          z-index: 4;
          pointer-events: none;
          background: radial-gradient(120% 85% at 50% 42%, transparent 45%, rgba(0, 0, 0, 0.55) 100%);
        }

        /* A slow, faint beam sweeping past the title — the one bit of
           ambient motion that reads as "cinema" rather than "loading". */
        .showtime-root .spotlight {
          position: absolute;
          top: -20%;
          left: -30%;
          width: 60%;
          height: 140%;
          z-index: 4;
          pointer-events: none;
          background: linear-gradient(
            100deg,
            transparent 0%,
            rgba(255, 183, 206, 0.05) 45%,
            rgba(255, 183, 206, 0.09) 50%,
            rgba(255, 183, 206, 0.05) 55%,
            transparent 100%
          );
          animation: showtime-sweep 9s ease-in-out infinite;
          mix-blend-mode: screen;
        }
        @keyframes showtime-sweep {
          0% { transform: translateX(0); }
          50% { transform: translateX(220%); }
          100% { transform: translateX(0); }
        }

        /* Very light grain so the charcoal gradients don't band on
           flat panels. */
        .showtime-root .grain {
          position: absolute;
          inset: 0;
          z-index: 5;
          pointer-events: none;
          opacity: 0.05;
          mix-blend-mode: overlay;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
          background-size: 160px 160px;
        }

        /* The way in is a small star rather than a labelled button; one click
           turns it into the real thing, so the frame stays uncluttered. */
        .showtime-root .preview-star {
          position: absolute;
          top: max(14px, env(safe-area-inset-top));
          right: max(16px, env(safe-area-inset-right));
          z-index: 1000;
          width: 13px;
          height: 13px;
          padding: 0;
          border: none;
          background: none;
          color: var(--accent);
          cursor: pointer;
          line-height: 0;
          filter: drop-shadow(0 0 5px var(--accent-glow));
          transition: transform 0.2s ease;
        }
        .showtime-root .preview-star:hover {
          transform: scale(1.35);
        }
        .showtime-root .preview-star svg {
          width: 100%;
          height: 100%;
          display: block;
          animation: showtime-star-twinkle 3.2s ease-in-out infinite alternate;
        }
        .showtime-root .preview-star:hover svg {
          animation: none;
          opacity: 1;
        }
        @keyframes showtime-star-twinkle {
          from { opacity: 0.35; }
          to   { opacity: 0.95; }
        }

        .showtime-root .preview-btn {
          animation: showtime-preview-in 0.32s cubic-bezier(0.16, 1, 0.3, 1) both;
          position: absolute;
          top: max(14px, env(safe-area-inset-top));
          right: max(14px, env(safe-area-inset-right));
          z-index: 1000;
          font-family: var(--font-display);
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--accent-soft);
          background: rgba(13, 13, 15, 0.55);
          border: 1px solid rgba(255, 212, 226, 0.4);
          border-radius: 999px;
          padding: 6px 14px;
          cursor: pointer;
          backdrop-filter: blur(2px);
          transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
        }
        @keyframes showtime-preview-in {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }
        .showtime-root .preview-btn:hover {
          background: rgba(255, 212, 226, 0.16);
          border-color: var(--accent-soft);
          color: var(--paper);
        }

        .showtime-root .lock {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          padding: calc(var(--rail) + 10px);
        }

        /* The actual "projector screen" — a real 16:9 box, centered, so the
           ticker and text are framed instead of stretching across whatever
           width the monitor happens to be. Shrinks by height on short
           screens and by width on narrow ones, whichever runs out first. */

      .showtime-root .screen {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  container-type: size;
  box-shadow: inset 0 0 0 1px rgba(255, 212, 226, 0.16), inset 0 0 40px rgba(0, 0, 0, 0.4);
}

        .showtime-root .corner {
          position: absolute;
          z-index: 15;
          font-size: clamp(10px, 1.8cqw, 14px);
          color: var(--accent-soft);
          opacity: 0.55;
          text-shadow: 0 0 6px var(--accent-glow);
          pointer-events: none;
        }
        .showtime-root .corner-tl { top: 10px; left: 12px; }
        .showtime-root .corner-tr { top: 10px; right: 12px; }
        .showtime-root .corner-bl { bottom: 10px; left: 12px; }
        .showtime-root .corner-br { bottom: 10px; right: 12px; }

        .showtime-root .curtain-l,
        .showtime-root .curtain-r {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 52%;
          z-index: 1;
          will-change: transform;
          transform: translateZ(0);
          backface-visibility: hidden;
          /* Wide, soft-edged stripes instead of a tight hard-edged repeat —
             tight repeating patterns shimmer/moiré under transform on most
             displays, which is what read as a "glitch" during the curtain
             animation. */
          background-image:
            radial-gradient(140% 55% at 50% -8%, rgba(255, 255, 255, 0.1), transparent 60%),
            linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0) 12%, rgba(0,0,0,0) 88%, rgba(0,0,0,0.3) 100%),
            repeating-linear-gradient(
            90deg,
            var(--curtain) 0,
            var(--curtain) 26px,
            var(--curtain-2) 34px,
            var(--curtain-2) 60px,
            var(--curtain) 68px
          );
          box-shadow: 0 0 60px rgba(0, 0, 0, 0.6) inset;
        }
        .showtime-root .curtain-l {
          left: 0;
          transform-origin: left;
        }
        .showtime-root .curtain-r {
          right: 0;
          transform-origin: right;
        }

    .showtime-root .lock-content {
  position: relative;
  z-index: 10;
  width: 100%;
  height: 100%;
  padding: 24px 0 3cqh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  text-align: center;
}

        /* The marquee band keeps its place at the top of the frame; everything
           below it centres in whatever height is left. */
        .showtime-root .lock-banner {
          width: 100%;
          flex: 0 0 auto;
        }
        .showtime-root .lock-body {
          flex: 1 1 auto;
          width: 100%;
          min-height: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .showtime-root .bulb-rail {
          display: flex;
          justify-content: space-between;
          padding: 0 4px;
          width: 100%;
        }
        .showtime-root .bulb-rail.top {
          margin-bottom: 7px;
        }
        .showtime-root .bulb-rail.bottom {
          margin-top: 7px;
          margin-bottom: 24px;
        }
        .showtime-root .bulb-rail .bulb-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--accent);
          opacity: 0.25;
          box-shadow: 0 0 4px var(--accent-glow);
        }

        .showtime-root .ticker {
          width: 100%;
          overflow: hidden;
          border-top: 1px solid var(--accent-glow);
          border-bottom: 1px solid var(--accent-glow);
          padding: 1.4cqh 0;
          /* Fade the scrolling text at both edges instead of a hard cut. */
          -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
          mask-image: linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%);
        }
        .showtime-root .ticker-track {
          display: flex;
          white-space: nowrap;
          animation: showtime-scroll 16s linear infinite;
        }
        .showtime-root .ticker-track span {
          font-family: var(--font-display);
          font-size: clamp(11px, 2.4cqw, 15px);
          letter-spacing: 0.22em;
          color: var(--accent);
          padding-right: 2.4em;
        }
        @keyframes showtime-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        .showtime-root .marquee-title {
          font-family: var(--font-marquee);
          font-weight: 400;
          font-size: clamp(2.1rem, 9.4cqw, 4.8rem);
          letter-spacing: 0.01em;
          color: #ffffff;
          line-height: 0.9;
          text-shadow:
            0 1px 0 rgba(0, 0, 0, 0.5),
            0 2px 0 rgba(0, 0, 0, 0.35),
            0 0 22px var(--accent-glow),
            0 0 60px rgba(255, 183, 206, 0.22);
          margin-top: 0;
          display: inline-flex;
          align-items: center;
          gap: 0.4em;
          animation: showtime-title-in 1.1s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .showtime-root .marquee-title-star {
          font-size: 0.32em;
          color: var(--accent);
          opacity: 0.8;
          animation: showtime-twinkle 2.4s ease-in-out infinite;
        }
        .showtime-root .marquee-title-star:last-child {
          animation-delay: 1.1s;
        }
        @keyframes showtime-title-in {
          from { opacity: 0; transform: translateY(10px) scale(0.97); letter-spacing: 0.16em; }
          to { opacity: 1; transform: translateY(0) scale(1); letter-spacing: 0.03em; }
        }
        @keyframes showtime-twinkle {
          0%, 100% { opacity: 0.35; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.1); }
        }
        .showtime-root .marquee-sub {
          font-family: var(--font-script);
          font-size: clamp(1rem, 3cqw, 1.4rem);
          color: var(--accent-soft);
          margin: 1cqh 0 0;
          text-shadow: 0 0 14px rgba(255, 212, 226, 0.3);
        }

        .showtime-root .hero-days {
          position: relative;
          margin: 3cqh 0 0.6cqh;
        }
        .showtime-root .hero-days::before {
          content: '';
          position: absolute;
          inset: -14% -10%;
          z-index: -1;
          background: radial-gradient(50% 60% at 50% 45%, rgba(255, 183, 206, 0.16) 0%, transparent 75%);
          filter: blur(2px);
        }
        .showtime-root .hero-days .od-col {
          width: clamp(34px, 9cqw, 64px);
          height: clamp(48px, 12cqw, 92px);
        }
        .showtime-root .hero-days .od-digit {
          height: clamp(48px, 12cqw, 92px);
          font-size: clamp(2rem, 7.5cqw, 4.4rem);
        }
        .showtime-root .hero-days .od-number {
          display: inline-flex;
          gap: 2px;
        }
        .showtime-root .hero-caption {
          font-family: var(--font-display);
          font-size: clamp(10px, 2cqw, 13px);
          letter-spacing: 0.3em;
          color: var(--muted);
        }

        .showtime-root .rest-row {
          display: flex;
          gap: 1.4cqw;
          margin-top: 2.6cqh;
          flex-wrap: wrap;
          justify-content: center;
        }
        .showtime-root .bulb-tile {
          position: relative;
          background: linear-gradient(180deg, var(--bg-2) 0%, rgba(13, 13, 15, 0.9) 100%);
          border: 1px solid rgba(243, 239, 231, 0.14);
          border-radius: 8px;
          padding: 1.4cqh 1.4cqw 1cqh;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.6cqh;
          box-shadow: 0 14px 30px -14px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(243, 239, 231, 0.06);
          overflow: hidden;
        }
        .showtime-root .bulb-tile::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent), transparent);
          opacity: 0.65;
        }
        .showtime-root .bulb-tile .od-number {
          display: flex;
          gap: 1px;
        }
        .showtime-root .bulb-label {
          font-family: var(--font-display);
          font-size: clamp(9px, 1.6cqw, 10.5px);
          letter-spacing: 0.24em;
          color: var(--muted);
        }

        .showtime-root .od-col {
          position: relative;
          width: clamp(18px, 4.6cqw, 26px);
          height: clamp(28px, 7cqw, 40px);
          overflow: hidden;
          display: inline-block;
          border-radius: 3px;
          background: linear-gradient(180deg, #141418 0%, #08080a 100%);
          box-shadow: inset 0 0 0 1px rgba(255, 212, 226, 0.18), inset 0 2px 4px rgba(0, 0, 0, 0.6);
        }
        .showtime-root .od-col::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: rgba(0, 0, 0, 0.55);
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.03);
          z-index: 1;
          pointer-events: none;
        }
        .showtime-root .od-strip {
          display: flex;
          flex-direction: column;
        }
        .showtime-root .od-digit {
          height: clamp(28px, 7cqw, 40px);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-mono);
          font-weight: 700;
          font-size: clamp(1.1rem, 3.2cqw, 1.7rem);
          font-variant-numeric: tabular-nums;
          color: var(--accent);
          text-shadow: 0 0 10px var(--accent-glow);
        }

        .showtime-root .perforation {
          width: min(220px, 60%);
          height: 1px;
          margin-top: 2.4cqh;
          background-image: radial-gradient(circle, rgba(255, 212, 226, 0.5) 1.1px, transparent 1.2px);
          background-size: 9px 1px;
          background-repeat: repeat-x;
          opacity: 0.7;
        }
        .showtime-root .lock-foot {
          margin-top: 1.1cqh;
          font-size: clamp(9px, 1.6cqw, 10.5px);
          letter-spacing: 0.16em;
          color: var(--accent-soft);
          text-transform: uppercase;
        }

        @media (max-width: 560px) {
          .showtime-root {
            --rail: 12px;
          }
        }


        @media (max-height: 480px), (max-width: 380px) {
          .showtime-root .bulb-rail.top,
          .showtime-root .ticker,
          .showtime-root .corner {
            display: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .showtime-root .ticker-track {
            animation: none !important;
          }
          .showtime-root .spotlight,
          .showtime-root .marquee-title,
          .showtime-root .marquee-title-star {
            animation: none !important;
          }
        }
      `;
