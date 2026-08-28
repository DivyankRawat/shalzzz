"use client";

import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Caveat } from "next/font/google";

import PhotoLightbox, { type LightboxItem } from "@/components/ui/photo-lightbox";

const script = Caveat({ subsets: ["latin"], weight: ["500", "600"] });

type Face = LightboxItem & { rotate: number };

/**
 * These live in their own folder, `public/faces/`, so they are independent of
 * the photos the other screens share. They are placeholders for now: drop the
 * real shots in over `face-1.jpg` … `face-6.jpg` and edit the words here.
 * Rotations are authored rather than random so the wall looks the same on
 * every render and each frame leans away from its neighbour.
 */
const FACES: Face[] = [
  {
    src: "/faces/face-1.jpeg",
    title: "Nini Time",
    description: "The face I love to see when I wake up in the morning. Cute, innocent, sleepy and happy.",
    rotate: -3.5,
  },
  {
    src: "/faces/face-8.jpeg",
    title: "Annoyed As Hell",
    description: "The face she makes when I annoy her too much. I love it anyway and I would do it again.",
    rotate: 2.5,
  },
  {
    src: "/faces/face-3.jpeg",
    title: "Random Click",
    description: "Once in a blue moon click. The face she made randomly when I asked her to smile.",
    rotate: -1.8,
  },
  {
    src: "/faces/face-4.jpeg",
    title: "Mischief",
    description: "If she's smiling like this, you know she's up to something. Run away !!",
    rotate: 3,
  },
  {
    src: "/faces/face-9.jpeg",
    title: "Piti Piti",
    description: "Sorry my friend after seeing her in this mood, nobody can save you.",
    rotate: -2.6,
  },
  {
    src: "/faces/face-6.jpeg",
    title: "Mid Meal",
    description: "Mouth full, eyes half closed, and a smile on her face. The face I love to see when she is enjoying her food.",
    rotate: 1.9,
  },
  {
    src: "/faces/face-7.jpeg",
    title: "Up to Something",
    description: "She's either gonna scold you, prank you or kill you. Nobody can tell what she's thinking.",
    rotate: -2.6,
  },
  {
    src: "/faces/face-5.jpeg",
    title: "Waking Up Mid Sleep",
    description: "The face she makes when she wakes up mid sleep and ask 'Kaha jaa rahe ho?'. I was just going to the washroom.",
    rotate: 1.9,
  },
];

export default function Faces() {
  const [open, setOpen] = useState<Face | null>(null);
  const close = useCallback(() => setOpen(null), []);


  return (
    <section className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden bg-black px-5 py-6 sm:px-8 sm:py-14">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <p className="text-[10px] uppercase tracking-[0.32em] text-[#F3EFE7]/45">My CUTIE's</p>
        <h2 className={`${script.className} mt-1 text-[1.7rem] text-[#FFB7CE] sm:mt-3 sm:text-5xl`}>
          The Hall of Faces
        </h2>
      </motion.div>

      <div className="mt-4 grid w-full max-w-[18rem] grid-cols-2 gap-2.5 sm:mt-10 sm:max-w-5xl sm:grid-cols-4 sm:gap-5">
        {FACES.map((face, i) => (
          <motion.button
            key={face.src}
            type="button"
            onClick={() => setOpen(face)}
            aria-label={`Open ${face.title}`}
            initial={{ opacity: 0, y: 24, rotate: face.rotate }}
            whileInView={{ opacity: 1, y: 0, rotate: face.rotate }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
            // The polaroid: even border on three sides, deep margin under the
            // photo for the title.
            className="group cursor-pointer rounded-[3px] bg-[#FAF8F4] p-1.5 pb-4 text-left shadow-[0_14px_30px_-12px_rgba(0,0,0,0.9)] transition-transform duration-300 ease-out hover:z-10 hover:rotate-0! hover:scale-[1.05] sm:p-2.5 sm:pb-9"
          >
            <div className="relative aspect-square w-full overflow-hidden bg-[#141414]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={face.src}
                alt={face.title}
                draggable={false}
                loading="lazy"
                className="h-full w-full select-none object-cover grayscale transition-[filter] duration-500 ease-out group-hover:grayscale-0"
              />
            </div>
            <span
              className={`${script.className} mt-0.5 block truncate text-center text-[12px] leading-tight text-neutral-700 sm:mt-2 sm:text-lg`}
            >
              {face.title}
            </span>
          </motion.button>
        ))}
      </div>

      <PhotoLightbox item={open} onClose={close} />
    </section>
  );
}
