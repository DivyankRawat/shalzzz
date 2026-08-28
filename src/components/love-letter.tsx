"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Caveat, Newsreader } from "next/font/google";

import { seededRandom } from "@/lib/seeded-random";

const serif = Newsreader({ subsets: ["latin"], weight: ["300", "400"], style: ["normal", "italic"] });
const script = Caveat({ subsets: ["latin"], weight: ["500", "600"] });

/* ----------------------------------------------------------- starfield -- */

type Star = {
  top: string;
  left: string;
  size: number;
  glow: number;
  min: number;
  max: number;
  dur: string;
  delay: string;
};

type Sparkle = {
  top: string;
  left: string;
  size: number;
  rotate: number;
  dur: string;
  delay: string;
};

/**
 * Twinkling is per-star rather than one shared keyframe: every star gets its
 * own period, phase and brightness range, so the field shimmers instead of
 * blinking in unison.
 */
function buildStars(count: number): Star[] {
  const rng = seededRandom(2718);
  const stars: Star[] = [];

  for (let i = 0; i < count; i++) {
    const size = Number((0.9 + rng() * 2.6).toFixed(2));
    const bright = rng();
    stars.push({
      top: `${(rng() * 100).toFixed(2)}%`,
      left: `${(rng() * 100).toFixed(2)}%`,
      size,
      glow: Number((size * (2.6 + rng() * 2.6)).toFixed(1)),
      min: Number((0.14 + bright * 0.24).toFixed(2)),
      max: Number((0.58 + bright * 0.42).toFixed(2)),
      dur: `${(2.4 + rng() * 4.6).toFixed(1)}s`,
      delay: `${(rng() * 5).toFixed(1)}s`,
    });
  }

  return stars;
}

/** A handful of bigger four-point stars, to give the field some structure. */
function buildSparkles(count: number): Sparkle[] {
  const rng = seededRandom(1123);
  return Array.from({ length: count }, () => ({
    top: `${(4 + rng() * 92).toFixed(2)}%`,
    left: `${(3 + rng() * 94).toFixed(2)}%`,
    size: Math.round(12 + rng() * 20),
    rotate: Math.round(rng() * 90),
    dur: `${(3.4 + rng() * 3.4).toFixed(1)}s`,
    delay: `${(rng() * 4).toFixed(1)}s`,
  }));
}

const FOUR_POINT =
  "M50 0c0 27.6 22.4 50 50 50-27.6 0-50 22.4-50 50 0-27.6-22.4-50-50-50 27.6 0 50-22.4 50-50z";

/* -------------------------------------------------------------- letter -- */

const LETTER = [
  "I keep trying to find the right words for this, and every time, I end up coming back to the same simple thought: I am so glad it’s you.",
  "Thank you for being in my life — not just on the special days, but on all the ordinary ones too. The days with no occasion, no plans, and nothing to celebrate somehow become some of my favorite memories. Thank you for laughing at my jokes, even the ones that really don’t deserve it. Thank you for being the person I want to tell everything to first, whether it’s something important or something completely stupid.",
  "I know this year hasn’t been easy for you. You’ve had to face a lot, and I’ve seen how strong you’ve been through all of it. You deserve a year that feels a little lighter — more good mornings, long good nights, things finally going your way, and plenty of reasons to make that little face you make when you’re happy but trying not to show it.",
  "I know I’m not always the best at expressing myself, and sometimes I probably don’t say it enough, but I love you more than I’m able to put into words. I’m incredibly proud of you, and I’ll always be here for you — through the good days, the difficult ones, and everything in between.",
  "And I hope you like this little gift from me. It’s a small way of saying something I probably don’t say enough: you mean so much to me. Whatever life brings, you’ll always have me beside you — cheering for you, annoying you, and loving you through all of it.",
  "Once again, happy birthday, my love.",
  "I’m so glad it’s you.",
];

export default function LoveLetter() {
  const stars = useMemo(() => buildStars(180), []);
  const sparkles = useMemo(() => buildSparkles(11), []);

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black">
      <style>{STAR_CSS}</style>

      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        {stars.map((s, i) => (
          <span
            key={i}
            className="star"
            style={
              {
                top: s.top,
                left: s.left,
                width: s.size,
                height: s.size,
                "--glow": `${s.glow}px`,
                "--min": s.min,
                "--max": s.max,
                "--dur": s.dur,
                "--delay": s.delay,
              } as React.CSSProperties
            }
          />
        ))}

        {sparkles.map((s, i) => (
          <span
            key={`sp-${i}`}
            className="sparkle"
            style={
              {
                top: s.top,
                left: s.left,
                width: s.size,
                height: s.size,
                "--rot": `${s.rotate}deg`,
                "--dur": s.dur,
                "--delay": s.delay,
              } as React.CSSProperties
            }
          >
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <path d={FOUR_POINT} fill="currentColor" />
            </svg>
          </span>
        ))}
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-8 sm:py-12">
        <motion.article
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="letter-card max-h-[calc(100dvh-4rem)] w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#F3EFE7]/15 bg-black/70 px-5 py-7 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-[3px] sm:px-10 sm:py-10 lg:max-w-4xl lg:px-14"
        >
          <p className="text-center text-[10px] uppercase tracking-[0.32em] text-[#F3EFE7]/45">
            a letter
          </p>

          <h2 className={`${script.className} mt-2 text-center text-[1.9rem] text-[#FFB7CE] sm:mt-3 sm:text-[2.75rem]`}>
            For you
          </h2>

          <div className={`${serif.className} mt-5 space-y-3.5 text-[#F3EFE7]/85 sm:mt-6 sm:space-y-4`}>
            {LETTER.map((line, i) => (
              <p key={i} className="text-[14px] leading-[1.75] sm:text-[15px] sm:leading-[1.8]">
                {line}
              </p>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4 sm:mt-7">
            <span className="h-px flex-1 bg-[#F3EFE7]/15" />
            <span className={`${script.className} text-2xl text-[#FFB7CE]`}>always yours</span>
          </div>
        </motion.article>
      </div>
    </section>
  );
}

const STAR_CSS = `
  .letter-card { scrollbar-width: thin; scrollbar-color: rgba(243,239,231,0.22) transparent; }
  .letter-card::-webkit-scrollbar { width: 6px; }
  .letter-card::-webkit-scrollbar-thumb { background: rgba(243,239,231,0.22); border-radius: 3px; }
  .letter-card::-webkit-scrollbar-track { background: transparent; }

  .star {
    position: absolute;
    border-radius: 9999px;
    background: #fff;
    opacity: var(--min);
    box-shadow:
      0 0 var(--glow) rgba(255, 255, 255, 0.85),
      0 0 calc(var(--glow) * 2.2) rgba(255, 255, 255, 0.35);
    animation: star-twinkle var(--dur) ease-in-out infinite alternate;
    animation-delay: var(--delay);
    will-change: opacity, transform;
  }
  @keyframes star-twinkle {
    from { opacity: var(--min); transform: scale(0.85); }
    to   { opacity: var(--max); transform: scale(1.25); }
  }

  .sparkle {
    position: absolute;
    color: rgba(255, 255, 255, 0.92);
    filter:
      drop-shadow(0 0 6px rgba(255, 255, 255, 0.75))
      drop-shadow(0 0 18px rgba(255, 255, 255, 0.4));
    animation: sparkle-pulse var(--dur) ease-in-out infinite alternate;
    animation-delay: var(--delay);
    will-change: opacity, transform;
  }
  @keyframes sparkle-pulse {
    from { opacity: 0.3; transform: rotate(var(--rot)) scale(0.8); }
    to   { opacity: 1;   transform: rotate(var(--rot)) scale(1.12); }
  }

  @media (prefers-reduced-motion: reduce) {
    .star, .sparkle { animation: none; opacity: 0.8; }
  }
`;
