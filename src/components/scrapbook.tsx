"use client";

import { useEffect, useMemo, useRef } from "react";
import Image from "next/image";

import { seededRandom } from "@/lib/seeded-random";

/* ------------------------------------------------------------------ book -- */

/**
 * How much bigger the book is than its authored 400x500 page.
 *
 * page-flip maps pointer coordinates against its configured pixel size, so a
 * CSS transform on the container would scale the visuals while leaving drag
 * and corner detection reading the old geometry. It has to be told the real
 * size instead. The collage on each page is placed with Tailwind translate
 * utilities, which resolve to `calc(var(--spacing) * n)` - so scaling
 * `--spacing` on the book carries the whole composition up with it.
 */
const BOOK_SCALE = 1.3;
const PAGE_W = Math.round(400 * BOOK_SCALE);
const PAGE_H = Math.round(500 * BOOK_SCALE);

function FlipBook() {
  const bookRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!bookRef.current) return;
    let flip: { destroy: () => void } | null = null;
    let cancelled = false;

    // page-flip reaches for the DOM on construction, so it is pulled in only
    // once we are on the client and the pages are actually mounted.
    (async () => {
      const { PageFlip } = await import("page-flip");
      if (cancelled || !bookRef.current) return;
      const instance = new PageFlip(bookRef.current, {
        width: PAGE_W,
        height: PAGE_H,
        autoSize: false,
        showCover: true,
        drawShadow: true,
        maxShadowOpacity: 0.5,
        usePortrait: false,
        startPage: 0,
      });
      instance.loadFromHTML(bookRef.current.querySelectorAll(".book-page"));
      flip = instance;
    })();

    return () => {
      cancelled = true;
      flip?.destroy();
    };
  }, []);

  return (
    <div ref={bookRef} style={{ "--spacing": `${0.25 * BOOK_SCALE}rem` } as React.CSSProperties}>
      <div className="book-page bg-blue-700 text-white" data-density="hard" style={{ width: 200, height: 700 }}>
        <Image
          src="/pages/front.png"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain scale-130 translate-x-3 pointer-events-none select-none"
        />
        <div className="flex h-full items-center justify-center text-5xl font-bold" />
      </div>

      <div className="  book-page bg-amber-50 text-black" style={{ width: 600, height: 500 }}>
        <Image src="/pages/left.jpg" alt="Front Cover" fill priority draggable={false} className="object-contain  pointer-events-none select-none" />
        <Image src="/elements/fwine.png" alt="Front Cover" fill priority draggable={false} className="object-contain  -rotate-12  -translate-x-34 -translate-y-33 scale-35   " />
        <Image src="/elements/side3.png" alt="Front Cover" fill priority draggable={false} className="object-contain   -translate-x-23 -translate-y-14 scale-78   " />
        <Image src="/elements/mouse.png" alt="Front Cover" fill priority draggable={false} className="object-contain   z-50 translate-x-20 translate-y-46 scale-55   " />
        <Image src="/elements/butter.png" alt="Front Cover" fill priority draggable={false} className="object-contain scale-45 rotate-30  -translate-x-28 translate-y-32 " />
        <Image src="/ref/girl.jpeg" alt="Front Cover" fill priority draggable={false} className="object-contain scale-33  rotate-10  translate-x-14 -translate-y-23 " />
        <Image src="/elements/frame10.png" alt="Front Cover" fill priority draggable={false} className="object-contain scale-65 rotate-10  translate-x-14 -translate-y-20 " />
        <Image src="/elements/text1.png" alt="Front Cover" fill priority draggable={false} className="object-contain scale-45   translate-x-10 translate-y-15 " />
      </div>

      <div className="relative overflow-hidden book-page bg-amber-50 text-black" style={{ width: 600, height: 500 }}>
        <Image src="/pages/right.jpg" alt="Front Cover" fill priority draggable={false} className="object-contain  pointer-events-none select-none" />
        <Image src="/elements/paper.png" alt="Front Cover" fill priority draggable={false} className="object-contain rotate-90 shadow-black   translate-x-18 translate-y-38  scale-50   " />
        <Image src="/elements/starB.png" alt="Front Cover" fill priority draggable={false} className="object-contain shadow-black  -rotate-50 -translate-x-17 translate-y-30  scale-50   " />
        <Image src="/ref/girl.jpeg" alt="Front Cover" fill priority draggable={false} className="object-contain shadow-black rotate-20  translate-x-19 -translate-y-22  scale-22   " />
        <Image src="/ref/girl2.jpeg" alt="Front Cover" fill priority draggable={false} className="object-contain shadow-black rotate-20  translate-x-26 -translate-y-43  scale-22   " />
        <Image src="/ref/girl3.jpeg" alt="Front Cover" fill priority draggable={false} className="object-contain shadow-black rotate-20  translate-x-11 translate-y-1  scale-22   " />
        <Image src="/elements/frame9.png" alt="Front Cover" fill priority draggable={false} className="object-contain shadow-black rotate-12  translate-x-18 -translate-y-20  scale-80   " />
        <Image src="/elements/text2.png" alt="Front Cover" fill priority draggable={false} className="object-contain shadow-black rotate-0 -translate-x-13 -translate-y-40  scale-60   " />
        <Image src="/elements/kit.png" alt="Front Cover" fill priority draggable={false} className="object-contain shadow-black rotate-0 -translate-x-13 -translate-y-16  scale-60   " />
      </div>

      <div className="relative overflow-hidden book-page bg-amber-50 text-black" style={{ width: 600, height: 500 }}>
        <Image src="/pages/left.jpg" alt="Front Cover" fill priority draggable={false} className="object-contain pointer-events-none select-none" />
        <Image src="/elements/billa6.png" alt="Lyrics" fill priority draggable={false} className="object-contain scale-55 rotate-1 -translate-x-30 -translate-y-10" />
        <Image src="/elements/side1.png" alt="Wine" fill priority draggable={false} className="object-contain scale-50 rotate-180 -translate-x-26 translate-y-31" />
        <Image src="/elements/starem.png" alt="Tape" fill priority draggable={false} className="object-contain scale-16 -rotate-18 translate-x-18 -translate-y-56 z-20" />
        <Image src="/ref/girl4.jpeg" alt="Frame" fill priority draggable={false} className="object-contain scale-33 rotate-17 translate-x-13 -translate-y-21 z-30" />
        <Image src="/elements/frame11.png" alt="Frame" fill priority draggable={false} className="object-contain scale-75 rotate-18 translate-x-10 -translate-y-11 z-30" />
        <Image src="/elements/moon.png" alt="Recorder" fill priority draggable={false} className="object-contain scale-34 -rotate-14 -translate-x-20 translate-y-30 z-40" />
        <Image src="/elements/fits.png" alt="Recorder" fill priority draggable={false} className="object-contain scale-44 -rotate-14 -translate-x-30 -translate-y-50 z-40" />
        <Image src="/elements/note1.png" alt="Disk" fill priority draggable={false} className="object-contain scale-68 -rotate-7 z-50 translate-x-14 translate-y-38 " />
        <Image src="/elements/lovetape.png" alt="Old Paper" fill priority draggable={false} className="object-contain scale-19 rotate-0 z-50 translate-x-10 translate-y-24" />
      </div>

      <div className="relative overflow-hidden book-page bg-amber-50 text-black" style={{ width: 600, height: 500 }}>
        <Image src="/pages/right.jpg" alt="Front Cover" fill priority draggable={false} className="object-contain pointer-events-none select-none" />
        <Image src="/elements/side2.png" alt="Disk" fill priority draggable={false} className="object-contain scale-68  rotate-0 z-50 translate-x-16 translate-y-23 " />
        <Image src="/elements/billa.png" alt="Disk" fill priority draggable={false} className="object-contain scale-38  rotate-0 z-50 -translate-x-14 -translate-y-28 " />
        <Image src="/elements/boqey.png" alt="Disk" fill priority draggable={false} className="object-contain scale-48  rotate-0 z-50 -translate-x-14 translate-y-28 " />
        <Image src="/ref/girl5.jpeg" alt="Disk" fill priority draggable={false} className="object-contain scale-32  rotate-0 z-50 translate-x-19 -translate-y-32 " />
        <Image src="/frames/frame5.png" alt="Disk" fill priority draggable={false} className="object-contain scale-68  rotate-0 z-50 translate-x-18 -translate-y-28 " />
        <Image src="/elements/miss.png" alt="Disk" fill priority draggable={false} className="object-contain scale-48  rotate-18 z-50 translate-x-28 translate-y-4 " />
      </div>

      <div className="relative overflow-hidden book-page bg-amber-50 text-black" style={{ width: 600, height: 500 }}>
        <Image src="/pages/left.jpg" alt="Front Cover" fill priority draggable={false} className="object-contain pointer-events-none select-none" />
        <Image src="/elements/side4.png" alt="Disk" fill priority draggable={false} className="object-contain scale-68  rotate-0 z-50 -translate-x-22 translate-y-23 " />
        <Image src="/elements/disk.png" alt="Disk" fill priority draggable={false} className="object-contain scale-68  rotate-0 z-50 -translate-x-50 -translate-y-15 " />
        <Image src="/elements/disk.png" alt="Disk" fill priority draggable={false} className="object-contain scale-68  rotate-0 z-50 -translate-x-50 -translate-y-15 " />
        <Image src="/elements/billa5.png" alt="Disk" fill priority draggable={false} className="object-contain scale-68  rotate-0 z-50 translate-x-19 translate-y-33 " />
        <Image src="/ref/girl4.jpeg" alt="Disk" fill priority draggable={false} className="object-contain scale-26  -rotate-11 z-50 translate-x-4 -translate-y-12 " />
        <Image src="/ref/girl10.jpeg" alt="Disk" fill priority draggable={false} className="object-contain scale-26  rotate-11 z-50 translate-x-16 -translate-y-40 " />
        <Image src="/elements/frame8.png" alt="Disk" fill priority draggable={false} className="object-contain scale-68  rotate-0 z-50 translate-x-10 -translate-y-25 " />
        <Image src="/elements/twoStar.png" alt="Disk" fill priority draggable={false} className="object-contain scale-38  rotate-0 z-50 -translate-x-14 translate-y-20 " />
        <Image src="/elements/text3.png" alt="Disk" fill priority draggable={false} className="object-contain scale-48  rotate-0 z-50 -translate-x-22 -translate-y-48 " />
      </div>

      <div className="relative overflow-hidden book-page bg-amber-50 text-black" style={{ width: 600, height: 500 }}>
        <Image src="/pages/right.jpg" alt="Front Cover" fill priority draggable={false} className="object-contain pointer-events-none select-none" />
        <Image src="/elements/side5.png" alt="Disk" fill priority draggable={false} className="object-contain scale-78  rotate-0 z-50 translate-x-22 translate-y-14 " />
        <Image src="/elements/text4.png" alt="Disk" fill priority draggable={false} className="object-contain scale-58  rotate-0 z-50 -translate-x-6 -translate-y-40 " />
        <Image src="/ref/girl9.jpeg" alt="Disk" fill priority draggable={false} className="object-contain scale-28  -rotate-4 z-50 -translate-x-18 -translate-y-16 " />
        <Image src="/ref/girl8.jpeg" alt="Disk" fill priority draggable={false} className="object-contain scale-27  rotate-10 z-50 -translate-x-11 translate-y-13 " />
        <Image src="/elements/frame7.png" alt="Disk" fill priority draggable={false} className="object-contain scale-68  rotate-0 z-50 -translate-x-14 translate-y-1 " />
        <Image src="/elements/billa4.png" alt="Disk" fill priority draggable={false} className="object-contain scale-58  rotate-0 z-50 -translate-x-17 translate-y-40 " />
      </div>

      <div className="relative overflow-hidden book-page bg-blue-700 text-white" data-density="hard" style={{ width: 600, height: 500 }}>
        <Image
          src="/pages/back.png"
          alt="Front Cover"
          fill
          priority
          draggable={false}
          className="object-contain scale-130 translate-x-3 pointer-events-none select-none"
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- backdrop -- */

type ScatterConfig = {
  minTop: number;
  maxTop: number;
  minLeft: number;
  maxLeft: number;
  minSize: number;
  maxSize: number;
  minRot: number;
  maxRot: number;
  excludeTop: [number, number];
  excludeLeft: [number, number];
};

/** The book sits dead centre — nothing in the backdrop may land under it. */
function inDeadZone(top: number, left: number, cfg: ScatterConfig) {
  return (
    top > cfg.excludeTop[0] &&
    top < cfg.excludeTop[1] &&
    left > cfg.excludeLeft[0] &&
    left < cfg.excludeLeft[1]
  );
}

type Placement = { top: string; left: string; rotate: number; size: number; delay: number };

function overlapAmount(
  a: { top: number; left: number; size: number },
  b: { top: number; left: number; size: number },
) {
  const dx = a.left - b.left;
  const dy = a.top - b.top;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return (0.11 * a.size) / 2 + (0.11 * b.size) / 2 - distance;
}

/**
 * Best-of-60 dart throwing: each photo tries a handful of spots and keeps the
 * one that crowds its neighbours least, bailing early the moment it finds a
 * placement that overlaps nothing.
 */
function scatterPhotos(rng: () => number, count: number, cfg: ScatterConfig): Placement[] {
  const placed: { top: number; left: number; size: number }[] = [];
  const out: Placement[] = [];

  for (let i = 0; i < count; i++) {
    let best: { top: number; left: number; size: number; rotate: number } | null = null;
    let bestScore = Infinity;

    for (let attempt = 0; attempt < 60; attempt++) {
      const top = cfg.minTop + rng() * (cfg.maxTop - cfg.minTop);
      const left = cfg.minLeft + rng() * (cfg.maxLeft - cfg.minLeft);
      const size = Math.round(cfg.minSize + rng() * (cfg.maxSize - cfg.minSize));
      const rotate = Math.round(cfg.minRot + rng() * (cfg.maxRot - cfg.minRot));
      if (inDeadZone(top, left, cfg)) continue;

      const candidate = { top, left, size };
      const crowding = placed.reduce((m, p) => Math.max(m, overlapAmount(candidate, p)), -Infinity);
      const score = placed.length === 0 ? -Infinity : crowding;

      if (score < bestScore) {
        bestScore = score;
        best = { top, left, size, rotate };
      }
      if (score <= 0) break;
    }

    const chosen =
      best ?? {
        top: cfg.minTop + rng() * (cfg.maxTop - cfg.minTop),
        left: cfg.minLeft + rng() * (cfg.maxLeft - cfg.minLeft),
        size: Math.round(cfg.minSize + rng() * (cfg.maxSize - cfg.minSize)),
        rotate: Math.round(cfg.minRot + rng() * (cfg.maxRot - cfg.minRot)),
      };

    placed.push({ top: chosen.top, left: chosen.left, size: chosen.size });
    out.push({
      top: `${chosen.top.toFixed(1)}%`,
      left: `${chosen.left.toFixed(1)}%`,
      rotate: chosen.rotate,
      size: chosen.size,
      delay: Number((0.5 * rng()).toFixed(2)),
    });
  }

  return out;
}

function scatterDoodles(rng: () => number, cfg: ScatterConfig, count = 14): Placement[] {
  const out: Placement[] = [];
  for (let i = 0; i < count; i++) {
    let top = 0;
    let left = 0;
    let tries = 0;
    do {
      top = cfg.minTop + rng() * (cfg.maxTop - cfg.minTop);
      left = cfg.minLeft + rng() * (cfg.maxLeft - cfg.minLeft);
      tries++;
    } while (inDeadZone(top, left, cfg) && tries < 25);

    out.push({
      top: `${top.toFixed(1)}%`,
      left: `${left.toFixed(1)}%`,
      rotate: Math.round(cfg.minRot + rng() * (cfg.maxRot - cfg.minRot)),
      size: Math.round(cfg.minSize + rng() * (cfg.maxSize - cfg.minSize)),
      delay: Number((0.5 * rng()).toFixed(2)),
    });
  }
  return out;
}

const BG_PHOTOS = [
  "/ref/girl.jpeg",
  "/ref/girl2.jpeg",
  "/ref/girl4.jpeg",
  "/ref/girl5.jpeg",
  "/ref/girl7.jpeg",
  "/ref/girl8.jpeg",
  "/ref/girl10.jpeg",
  "/ref/girl9.jpeg",
];

function BgPhoto({
  src,
  top,
  left,
  size,
  rotate,
  delay,
}: Placement & { src: string }) {
  return (
    <div
      className="bg-photo"
      style={
        {
          top,
          left,
          width: size,
          height: size,
          "--rot": `${rotate}deg`,
          "--delay": `${delay}s`,
        } as React.CSSProperties
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        draggable={false}
        onError={(e) => {
          e.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}

type DoodleProps = React.SVGProps<SVGSVGElement>;

const SolidHeart = (props: DoodleProps) => (
  <svg viewBox="0 0 100 100" {...props}>
    <path d="M50 40.2 C 50 18, 12 18, 12 40.2 C 12 62.4, 50 75.7, 50 92 C 50 75.7, 88 62.4, 88 40.2 C 88 18, 50 18, 50 40.2 Z" />
  </svg>
);

export default function Scrapbook() {
  const photos = useMemo(
    () =>
      scatterPhotos(seededRandom(7), BG_PHOTOS.length, {
        minTop: 3,
        maxTop: 90,
        minLeft: 3,
        maxLeft: 86,
        minSize: 130,
        maxSize: 205,
        minRot: -18,
        maxRot: 18,
        excludeTop: [30, 70],
        excludeLeft: [30, 70],
      }).map((p, i) => ({ ...p, src: BG_PHOTOS[i] })),
    [],
  );

  const hearts = useMemo(() => {
    const placeRng = seededRandom(21);
    const driftRng = seededRandom(33);
    return scatterDoodles(
      placeRng,
      {
        minTop: 2,
        maxTop: 94,
        minLeft: 2,
        maxLeft: 92,
        minSize: 8,
        maxSize: 18,
        minRot: -24,
        maxRot: 24,
        excludeTop: [34, 66],
        excludeLeft: [34, 66],
      },
      90,
    ).map((h) => ({
      ...h,
      dx: `${(driftRng() * 2 - 1) * 14}px`,
      dy: `${-(10 + driftRng() * 22)}px`,
      float: `${(7 + driftRng() * 8).toFixed(1)}s`,
    }));
  }, []);

  return (
    <div className="stage">
      <style>{STAGE_CSS}</style>


      <div className="stage__traces">
        {photos.map((p, i) => (
          <BgPhoto key={i} {...p} />
        ))}
      </div>

      <div className="stage__hearts">
        {hearts.map(({ top, left, size, rotate, delay, dx, dy, float }, i) => (
          <div
            key={i}
            className="bg-heart"
            style={
              {
                top,
                left,
                width: size,
                height: size,
                "--rot": `${rotate}deg`,
                "--delay": `${delay}s`,
                "--dx": dx,
                "--dy": dy,
                "--float": float,
              } as React.CSSProperties
            }
          >
            <SolidHeart />
          </div>
        ))}
      </div>

      <div className="stage__grain" />
      <div className="stage__vignette" />

      <div className="stage__book">
        <div className="stage__book-shadow" />
        <FlipBook />
      </div>
    </div>
  );
}

const STAGE_CSS = `
        .stage {

          position: relative;
          min-height: 100dvh;
          width: 100%;
          overflow: hidden;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* background traces: photos + doodles, pushed back together */
        .stage__traces {
          position: absolute;
          inset: 0;
          /* one dial for "how present the background texture is" */
          opacity: 0.5;
        }

        .bg-photo {
          position: absolute;
          overflow: hidden;
          border-radius: 1.1rem;
          opacity: 0;
          filter: grayscale(0.35) saturate(0.75) brightness(0.6) contrast(1.02) blur(0.6px);
          box-shadow: 0 14px 30px -18px rgba(0,0,0,0.7);
          transform: rotate(var(--rot)) scale(0.94);
          animation: bg-in 1.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: var(--delay);
        }
        .bg-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .bg-photo::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(160deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.6) 100%);
        }

        .stage__hearts {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .bg-heart {
          position: absolute;
          opacity: 0;
          color: rgba(255,255,255,0.4);
          filter: drop-shadow(0 0 5px rgba(255,255,255,0.5)) drop-shadow(0 0 13px rgba(255,255,255,0.22));
          animation:
            bg-heart-in 1.2s ease-out forwards,
            bg-heart-drift var(--float) ease-in-out infinite alternate;
          animation-delay: var(--delay), var(--delay);
          will-change: transform, opacity;
        }
        .bg-heart svg { width: 100%; height: 100%; fill: currentColor; display: block; }

        .stage__grain {
          position: absolute;
          inset: -10%;
          opacity: 0.045;
          mix-blend-mode: overlay;
          pointer-events: none;
          background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>");
        }

        .stage__vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(120% 100% at 50% 55%, transparent 34%, rgba(0,0,0,0.68) 100%);
          pointer-events: none;
        }

        .stage__book {
          position: relative;
          z-index: 5;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stage__book-shadow {
          position: absolute;
          bottom: -2%;
          left: 50%;
          width: 56%;
          height: 44px;
          transform: translateX(-50%);
          background: radial-gradient(ellipse at center, rgba(0,0,0,0.6), transparent 72%);
          filter: blur(10px);
          pointer-events: none;
        }

        @keyframes bg-in {
          from { opacity: 0; transform: rotate(var(--rot)) scale(0.94); }
          to   { opacity: 1; transform: rotate(var(--rot)) scale(1); }
        }
        @keyframes bg-heart-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bg-heart-drift {
          from { transform: translate3d(0, 0, 0) rotate(var(--rot)); }
          to   { transform: translate3d(var(--dx), var(--dy), 0) rotate(calc(var(--rot) + 8deg)); }
        }

        @media (max-width: 640px) {
          .stage__traces { transform: scale(0.6); transform-origin: 50% 40%; opacity: 0.35; }
        }

        @media (prefers-reduced-motion: reduce) {
          .bg-photo, .bg-heart { animation: none; opacity: 1; }
        }
      `;
