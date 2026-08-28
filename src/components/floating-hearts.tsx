"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";

export type Note = {
  id: string;
  title: string;
  text: string;
  accent: string;
};

const DEFAULT_NOTES: Note[] = [
  {
    id: "n1",
    title: "01",
    text: "Every butterfly escapes... except me. I've been happily stuck with you since day one. 🤍",
    accent: "#FFBAD0",
  },
  {
    id: "n2",
    title: "02",
    text: "Is butterfly ki tarah meri har khushi ka raasta bhi aakhir tum tak hi aakar rukta hai. 🫶",
    accent: "#FFD4E2",
  },
  {
    id: "n3",
    title: "03",
    text: "Tumne butterfly ko touch kiya... aur meri heartbeat phir se skip kar gayi. 😭❤️",
    accent: "#FA9CBB",
  },
  {
    id: "n4",
    title: "04",
    text: "Looks like you're really good at catching butterflies... no wonder you caught my heart so easily. ❤️",
    accent: "#FFC8D9",
  },
  {
    id: "n5",
    title: "05",
    text: "This butterfly landed in your hands for a moment... my heart chose to stay there forever. 🦋",
    accent: "#FFDCE7",
  },
];

type Point = { x: number; y: number };
type Bounds = { width: number; height: number };

const rand = (min: number, max: number) => min + Math.random() * (max - min);

const randomPoint = (width: number, height: number, pad = 60): Point => ({
  x: rand(pad, Math.max(pad + 1, width - pad)),
  y: rand(pad, Math.max(pad + 1, height - pad)),
});

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Nothing alive drifts in a straight line. This lays out a few waypoints that
 * bulge off the direct route by a sine-weighted amount, alternating sides on
 * about half the trips, so each crossing arcs differently from the last.
 */
function buildFlightPath(from: Point, to: Point, bounds: Bounds, pad = 40): Point[] {
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const perpX = -dy;
  const perpLength = Math.hypot(perpX, dx) || 1;

  const segments = distance > 380 ? Math.round(rand(4, 6)) : distance > 160 ? Math.round(rand(2, 4)) : 1;

  const roll = Math.random();
  const curviness = roll < 0.25 ? rand(0.05, 0.1) : roll < 0.7 ? rand(0.12, 0.26) : rand(0.28, 0.42);
  const alternate = Math.random() < 0.5;

  const points: Point[] = [from];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const midX = from.x + dx * t;
    const midY = from.y + dy * t;
    const side = alternate ? (i % 2 === 0 ? 1 : -1) : 1;
    const bulge = side * rand(0.6, 1) * curviness * distance * Math.sin(Math.PI * t);
    points.push({
      x: clamp(midX + (perpX / perpLength) * bulge, pad, bounds.width - pad),
      y: clamp(midY + (dx / perpLength) * bulge, pad, bounds.height - pad),
    });
  }
  points.push(to);
  return points;
}

/**
 * A heart, drawn once and beaten rather than flapped: a quick double-thump
 * followed by a longer rest, which reads as a pulse instead of a bounce.
 */
function Heart({
  idPrefix,
  accent,
  beatMs,
}: {
  idPrefix: string;
  accent: string;
  beatMs: number;
}) {
  const gradientId = `${idPrefix}-heart`;

  return (
    <div style={{ width: 60, height: 60, position: "relative" }}>
      <motion.svg
        viewBox="0 0 100 100"
        style={{ width: 60, height: 60, overflow: "visible", display: "block" }}
        animate={{ scale: [1, 1.16, 1.02, 1.09, 1] }}
        transition={{
          duration: beatMs / 1000,
          repeat: Infinity,
          ease: "easeInOut",
          times: [0, 0.14, 0.28, 0.42, 1],
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0%" stopColor="#FFEDF3" />
            <stop offset="45%" stopColor={accent} />
            <stop offset="100%" stopColor="#F4809F" />
          </linearGradient>
        </defs>

        <path
          d="M50 40.2 C 50 18, 12 18, 12 40.2 C 12 62.4, 50 75.7, 50 92 C 50 75.7, 88 62.4, 88 40.2 C 88 18, 50 18, 50 40.2 Z"
          fill={`url(#${gradientId})`}
          stroke="rgba(255,255,255,0.55)"
          strokeWidth={1.4}
          strokeLinejoin="round"
        />

        {/* highlight, so it reads as a glossy object rather than a flat glyph */}
        <ellipse cx="32" cy="37" rx="8" ry="5.5" fill="rgba(255,255,255,0.55)" transform="rotate(-28 32 37)" />
      </motion.svg>
    </div>
  );
}

function FloatingHeart({
  note,
  bounds,
  onOpen,
}: {
  note: Note;
  bounds: Bounds;
  onOpen: (id: string) => void;
}) {
  const controls = useAnimationControls();
  const beatMs = useRef(rand(820, 1250)).current;
  const aliveRef = useRef(true);
  const [hovered, setHovered] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    aliveRef.current = true;
    let cancelled = false;

    (async function fly() {
      let current = randomPoint(bounds.width, bounds.height);
      controls.set({ x: current.x, y: current.y, rotate: 0, opacity: 1 });

      while (!cancelled && aliveRef.current) {
        const destination = randomPoint(bounds.width, bounds.height);
        const points = buildFlightPath(current, destination, bounds);

        // Every leg gets its own speed, so it dawdles across some
        // stretches and darts across others rather than gliding at one rate.
        const speeds = points.map(() => rand(70, 130));
        const legLengths: number[] = [];
        for (let i = 1; i < points.length; i++) {
          legLengths.push(Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y));
        }
        const legTimes = legLengths.map((len, i) => Math.max(0.35, len / speeds[i]));
        const totalTime = legTimes.reduce((a, b) => a + b, 0);
        const duration = clamp(totalTime, 1.4, 7);

        let acc = 0;
        const times = [0];
        for (const t of legTimes) {
          acc += t;
          times.push(acc / totalTime);
        }

        // Bank into the turn, capped so it never looks like a barrel roll.
        const rotations = points.map((p, i) => {
          if (i === 0 || i === points.length - 1) return 0;
          const prev = points[i - 1];
          const next = points[i + 1] ?? p;
          const inAngle = Math.atan2(p.y - prev.y, p.x - prev.x);
          const outAngle = Math.atan2(next.y - p.y, next.x - p.x);
          return clamp(0.6 * (((outAngle - inAngle) * 180) / Math.PI), -16, 16);
        });

        await controls.start({
          x: points.map((p) => p.x),
          y: points.map((p) => p.y),
          rotate: rotations,
          transition: { duration, ease: "easeInOut", times },
        });

        current = destination;
        if (cancelled || !aliveRef.current) break;

        const roll = Math.random();
        if (roll < 0.22) {
          // Settle somewhere and fidget for a beat.
          const beats = Math.round(rand(2, 4));
          for (let i = 0; i < beats && !cancelled && aliveRef.current; i++) {
            await controls.start({
              x: current.x + rand(-6, 6),
              y: current.y + rand(-6, 6),
              rotate: rand(-4, 4),
              transition: { duration: rand(0.3, 0.5), ease: "easeInOut" },
            });
          }
        } else if (roll < 0.47) {
          // Slip out of frame and reappear elsewhere.
          await controls.start({ opacity: 0, transition: { duration: rand(0.5, 0.9), ease: "easeInOut" } });
          setHidden(true);
          const pause = Math.random() < 0.3 ? rand(3200, 6500) : rand(600, 2000);
          await new Promise((r) => setTimeout(r, pause));
          if (cancelled || !aliveRef.current) return;
          const reentry = randomPoint(bounds.width, bounds.height);
          controls.set({ x: reentry.x, y: reentry.y });
          current = reentry;
          setHidden(false);
          await controls.start({ opacity: 1, transition: { duration: rand(0.6, 1), ease: "easeOut" } });
        }
      }
    })();

    return () => {
      cancelled = true;
      aliveRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controls]);

  return (
    <motion.div
      layoutId={`note-${note.id}`}
      onClick={() => {
        aliveRef.current = false;
        onOpen(note.id);
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={controls}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: hidden ? "none" : "auto",
        cursor: "pointer",
        willChange: "transform",
      }}
      whileHover={{ scale: 1.12 }}
      whileTap={{ scale: 0.94 }}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          filter: hovered
            ? "drop-shadow(0 2px 6px rgba(0,0,0,0.45))"
            : "drop-shadow(0 1px 3px rgba(0,0,0,0.3))",
          transition: "filter 0.3s ease",
        }}
      >
        <Heart idPrefix={note.id} accent={note.accent} beatMs={beatMs} />
      </motion.div>
    </motion.div>
  );
}

function NoteCard({ note, onClose }: { note: Note; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(12,10,9,0.6)",
        backdropFilter: "blur(4px)",
        pointerEvents: "auto",
      }}
    >
      <motion.div
        layoutId={`note-${note.id}`}
        onClick={(e) => e.stopPropagation()}
        transition={{ type: "spring", stiffness: 240, damping: 26 }}
        className="fn-card"
        style={{
          width: "min(380px, 88vw)",
          padding: "2.4rem 2.1rem 2rem",
          background: "#1E1A17",
          position: "relative",
          // Torn-paper edge, cut top and bottom so the note reads as a scrap
          // rather than a rectangle.
          clipPath:
            "polygon(0% 1.5%,3% 0%,9% 1.2%,16% 0%,24% 1.4%,32% 0.2%,40% 1.1%,48% 0%,56% 1.3%,64% 0.1%,72% 1.2%,80% 0%,88% 1%,94% 0.2%,100% 1.4%,100% 98.5%,96% 100%,90% 98.7%,83% 100%,75% 98.6%,67% 100%,59% 98.8%,51% 100%,43% 98.7%,35% 100%,27% 98.6%,19% 100%,11% 98.8%,4% 100%,0% 98.6%)",
          boxShadow: "0 24px 60px -18px rgba(0,0,0,0.7)",
        }}
      >
        <svg
          style={{ position: "absolute", inset: 0, opacity: 0.05, mixBlendMode: "overlay", pointerEvents: "none" }}
          width="100%"
          height="100%"
        >
          <filter id="fn-grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#fn-grain)" />
        </svg>

        <div
          style={{
            position: "absolute",
            top: "34%",
            left: 0,
            right: 0,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 20%, rgba(255,255,255,0.08) 80%, transparent)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          style={{ position: "relative" }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.1rem" }}>
            <span
              style={{
                fontFamily: "'JetBrains Mono', ui-monospace, monospace",
                fontSize: "0.72rem",
                letterSpacing: "0.02em",
                color: note.accent,
              }}
            >
              N&deg;{note.title}
            </span>
            <span style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.12)" }} />
          </div>

          <p
            style={{
              fontFamily: "'Newsreader', ui-serif, Georgia, serif",
              fontWeight: 400,
              fontSize: "1.2rem",
              lineHeight: 1.6,
              color: "#EDE6DA",
              margin: 0,
              letterSpacing: "0.005em",
            }}
          >
            {note.text}
          </p>
        </motion.div>

        <button
          onClick={onClose}
          aria-label="Close note"
          style={{
            position: "absolute",
            top: 16,
            right: 18,
            border: "none",
            background: "transparent",
            color: "rgba(237,230,218,0.55)",
            cursor: "pointer",
            fontFamily: "'JetBrains Mono', ui-monospace, monospace",
            fontSize: "0.85rem",
            lineHeight: 1,
          }}
        >
          close
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function FloatingHearts({ notes = DEFAULT_NOTES }: { notes?: Note[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<Bounds>({ width: 1200, height: 800 });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setBounds({ width, height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const selected = useMemo(() => notes.find((n) => n.id === selectedId) || null, [notes, selectedId]);

  return (
    <div
      ref={containerRef}
      className="fn-root"
      style={{ position: "absolute", inset: 0, zIndex: 5, pointerEvents: "none" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;1,6..72,400&family=JetBrains+Mono:wght@400;500&display=swap');
      `}</style>

      {notes.map((note) =>
        note.id === selectedId ? null : (
          <FloatingHeart
            key={`${note.id}-${resetKey}`}
            note={note}
            bounds={bounds}
            onOpen={setSelectedId}
          />
        ),
      )}

      <AnimatePresence>
        {selected && (
          <NoteCard
            key={selected.id}
            note={selected}
            onClose={() => {
              setSelectedId(null);
              // Remounting restarts the flight loop the click halted.
              setResetKey((k) => k + 1);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
