# Gift

A scroll-snapped birthday site: a countdown gate opens onto seven full-screen
sections, each with its own animation, on a shared black/white/pink palette.

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · GSAP.
Deploys to Vercel as-is.

## The palette

One theme throughout: a black ground, charcoal for raised surfaces and the
curtain, off-white for type, and soft pink as the only accent.

| Token | Value | Used for |
|-------|-------|----------|
| `--ink` | `#000000` | every screen's ground |
| `--ink-2` | `#0d0d0f` | raised panels |
| `--charcoal` | `#121212` | the curtain's lighter stripe, against `--ink` |
| `--paper` | `#f3efe7` | body copy, doodles, polaroid frames |
| `--muted` | `#8a8a90` | secondary labels |
| `--accent` / `--accent-soft` / `--accent-deep` | `#ffb7ce` / `#ffd4e2` / `#f4809f` | headings, digits, hearts, chat bubbles |

They are declared in [src/app/globals.css](src/app/globals.css). The two
standalone pages in `public/` restate the same values locally, since they
cannot import it.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## The sections

| # | Section | What it does |
|---|---------|--------------|
| — | `ShowtimeLock` | Cinema-marquee countdown gate in charcoal and black. Odometer digits, chasing marquee bulbs, projector flicker and a sweeping beam. At zero the curtains part; to skip early, click the small star in the corner, which turns into the **Preview** button. |
| 1 | `/birthday.html` | Odometer rolls up to the age, then the number **scatters into hearts** that swarm along bowed paths and re-form as next year's number, which blooms out of them as they let go. "Happy Birthday" drifts up *behind* the number in the same Archivo Black face, over pure black. Spotify-style mini player with seek. |
| 2 | `HeroSection` | Memory thumbnails ride a looping SVG path (`offset-path`), draggable with momentum and slowing on hover. Frame spacing is set by how many ride the path, so `repeat` takes fractional values. |
| 3 | `FloatingHearts` + `PhotoCards` | Hearts beat and wander on curved, speed-varied flight paths, opening a torn-paper note when clicked; behind them, draggable polaroids that tilt toward the cursor and fling with velocity. Each carries a star and a handwritten title, and a tap (not a drag) opens it in the shared `PhotoLightbox` — the same popup the faces wall uses. |
| 4 | `Scrapbook` | A real page-turning book (`page-flip`) on a black stage, over a seeded scatter of dimmed photos and small drifting white hearts. `BOOK_SCALE` sizes the book: page-flip needs real pixel dimensions, and the page collage rides along because Tailwind's `translate-*` resolve from `--spacing`. |
| 5 | `LoveLetter` | A letter on a translucent card over a glowing starfield — every star twinkles on its own period and phase, placed by the shared seeded PRNG so the field is identical on server and client. |
| 6 | `Faces` | A *faces you make* wall of six polaroids, each leaning its own way and straightening on hover. Clicking one opens it centred, with its title and description in white beneath the photo; backdrop click or Esc closes. |
| 7 | `/last.html` | An iMessage thread that types itself out when the section scrolls into view, over a large blurred heart behind the phone. Leave part-way through and it replays from the top on your next visit; once it has finished, the thread is left as it is. |

### Why two plain HTML files

Sections 1 and 6 each drive a full page of their own with standalone GSAP
timelines (and, for the opener, a canvas the size of the viewport). They stay
plain documents in `public/` and are mounted in `<iframe>`s, which keeps their
timelines and audio isolated from React's render cycle.

## The countdown

`ShowtimeLock` reads the clock from `/api/time`, not from the visitor's
machine — a local `Date()` would let anyone in early by changing their system
time. Change the date in [src/app/page.tsx](src/app/page.tsx):

```tsx
<ShowtimeLock showPreviewButton targetDate={new Date("2026-08-28T18:30:00.000Z")}>
```

That value is `2026-08-29T00:00:00+05:30` — midnight IST on 29 August. Once it is in the
past the gate opens immediately on load. The **Preview** button skips it at any
time; drop `showPreviewButton` to remove it.

The age shown in section 1 comes from `BIRTH_UTC_MS` near the top of the script
in [public/birthday.html](public/birthday.html) — birth year is the knob that
decides where the reveal lands (Aug 5 1999 → 27). The watermark deliberately
shows one year *less* until the hearts re-form it as the new age.

## Assets

Everything lives in `public/`: `ref/` (photos), `pages/` + `elements/` +
`frames/` (scrapbook collage), `sounds/pipi-song.mp3`, `bg2.jpg`.

`next.config.ts` sets `images: { unoptimized: true }` — the scrapbook stacks
dozens of transparent PNGs at hand-tuned `scale-*`/`translate-*` offsets, and
serving them untouched keeps that composition exact.

## Deploying

Push to a Git repo and import it on Vercel; no environment variables are
needed. `/api/time` is a dynamic route, so keep the default Node runtime rather
than a static export — a static build would drop the countdown's server clock.

## Swapping in the real photos

`public/faces/` holds the six shots for the *faces you make* wall, separate
from the photos the other screens share. Drop replacements in over
`face-1.jpg` … `face-6.jpg` — they are cropped square, so anything roughly
square works best — and edit the titles in
[src/components/faces.tsx](src/components/faces.tsx).

The letter text is the `LETTER` array at the top of
[src/components/love-letter.tsx](src/components/love-letter.tsx).
# shalzzz
