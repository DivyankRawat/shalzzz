"use client";

import { useRef, useState } from "react";
import { Caveat } from "next/font/google";

import { DraggableCardBody, DraggableCardContainer } from "@/components/ui/draggable-card";
import PhotoLightbox, { type LightboxItem } from "@/components/ui/photo-lightbox";

const caveat = Caveat({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

/** Titles and the words behind them; both are placeholders worth replacing. */
const CARDS: LightboxItem[] = [
  {
    src: "/ref/girl.jpeg",
    title: "<3",
    description: "Love of my life",
  },
  {
    src: "/ref/girl2.jpeg",
    title: "<3",
    description: "Love of my life",
  },
  {
    src: "/ref/girl3.jpeg",
    title: "<3",
    description: "Love of my life",
  },
    {
    src: "/ref/heart.jpeg",
    title: "<3",
    description: "Love of my life",
  },
  {
    src: "/ref/girl4.jpeg",
    title: "<3",
    description: "Love of my life",
  },
  {
    src: "/ref/girl5.jpeg",
    title: "<3",
    description: "Love of my life",
  },
  {
    src: "/ref/girl6.jpeg",
    title: "<3",
    description: "Love of my life",
  },
  {
    src: "/ref/girl7.jpeg",
    title: "<3",
    description: "Love of my life",
  },
  {
    src: "/ref/girl8.jpeg",
    title: "<3",
    description: "Love of my life",
  },
  {
    src: "/ref/girl9.jpeg",
    title: "<3",
    description: "Love of my life",
  },
  {
    src: "/ref/girl10.jpeg",
    title: "<3",
    description: "Love of my life",
  },
  {
    src: "/ref/girl11.jpeg",
    title: "<3",
    description: "Love of my life",
  },
  {
    src: "/ref/girl12.jpeg",
    title: "<3",
    description: "Love of my life",
  },
  {
    src: "/ref/girl13.jpeg",
    title: "<3",
    description: "Love of my life",
  },
  {
    src: "/ref/girl14.jpeg",
    title: "<3",
    description: "Love of my life",
  },
];

/**
 * One per card, hand-placed. Cards are ~15.5% of the frame wide and ~31% tall,
 * so lefts stop near 80% and tops near 67% to keep each one inside the edges.
 * Three loose rows of five, staggered a few percent so they do not read as a
 * grid.
 */
const positions = [
  "top-[3%] left-[2%] rotate-[-7deg]",
  "top-[7%] left-[20%] rotate-[5deg]",
  "top-[1%] left-[38%] rotate-[-4deg]",
  "top-[6%] left-[56%] rotate-[6deg]",
  "top-[2%] left-[74%] rotate-[-5deg]",

  "top-[36%] left-[10%] rotate-[6deg]",
  "top-[33%] left-[28%] rotate-[-6deg]",
  "top-[38%] left-[46%] rotate-[4deg]",
  "top-[34%] left-[64%] rotate-[-7deg]",
  "top-[37%] left-[80%] rotate-[5deg]",

  "top-[66%] left-[2%] rotate-[5deg]",
  "top-[63%] left-[20%] rotate-[-5deg]",
  "top-[67%] left-[38%] rotate-[7deg]",
  "top-[64%] left-[56%] rotate-[-4deg]",
  "top-[66%] left-[74%] rotate-[6deg]",
];

const FOUR_POINT =
  "M50 0c0 27.6 22.4 50 50 50-27.6 0-50 22.4-50 50 0-27.6-22.4-50-50-50 27.6 0 50-22.4 50-50z";

/** Anything past this much pointer travel was a drag, not a tap. */
const DRAG_SLOP = 6;

export default function PhotoCards() {
  const [open, setOpen] = useState<LightboxItem | null>(null);
  const pressedAt = useRef<{ x: number; y: number } | null>(null);

  return (
    <DraggableCardContainer className={` relative min-h-screen overflow-visible bg-black  before:absolute before:inset-0 before:pointer-events-none before:bg-[linear-gradient(rgba(243,239,231,0.10)_1px,transparent_1px),linear-gradient(90deg,rgba(243,239,231,0.10)_1px,transparent_1px)] before:bg-[size:40px_40px]  after:absolute after:inset-0 after:pointer-events-none after:bg-[radial-gradient(circle,transparent_30%,rgba(0,0,0,0.08))] `}>
      {CARDS.map((card, i) => (
        <DraggableCardBody
          key={card.src}
          // Same polaroid as the `faces you make` wall: off-white stock, barely
          // rounded, even border on three sides and a deep margin under a
          // square photo for the title.
          className={`
            absolute
            ${positions[i]}
            w-56
            min-h-0
            bg-[#FAF8F4]
            rounded-[3px]
            shadow-[0_14px_30px_-12px_rgba(0,0,0,0.9)]
            p-2.5
            pb-9
            cursor-grab
            active:cursor-grabbing
            touch-none
            select-none
            z-10
            hover:scale-[1.03]
          `}
        >
          <div
            // These cards are draggable, so a tap only counts when the pointer
            // barely moved between press and release.
            onPointerDown={(e) => {
              pressedAt.current = { x: e.clientX, y: e.clientY };
            }}
            onClick={(e) => {
              const from = pressedAt.current;
              pressedAt.current = null;
              if (!from) return;
              if (Math.hypot(e.clientX - from.x, e.clientY - from.y) > DRAG_SLOP) return;
              setOpen(card);
            }}
          >
            <div className="relative aspect-square w-full overflow-hidden bg-[#141414]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={card.src}
                alt={card.title}
                draggable={false}
                className="h-full w-full select-none object-cover pointer-events-none"
              />
              <svg
                viewBox="0 0 100 100"
                aria-hidden="true"
                className="pointer-events-none absolute top-2 right-2 h-4 w-4 text-[#FFB7CE] drop-shadow-[0_0_6px_rgba(255,183,206,0.9)]"
              >
                <path d={FOUR_POINT} fill="currentColor" />
              </svg>
            </div>

            <p
              className={`${caveat.className} mt-2 block truncate text-center text-lg leading-tight text-neutral-700 pointer-events-none`}
            >
              {card.title}
            </p>
          </div>
        </DraggableCardBody>
      ))}

      <PhotoLightbox item={open} onClose={() => setOpen(null)} />
    </DraggableCardContainer>
  );
}
