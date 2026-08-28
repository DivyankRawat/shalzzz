"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Caveat } from "next/font/google";

const script = Caveat({ subsets: ["latin"], weight: ["500", "600"] });

export type LightboxItem = {
  src: string;
  title: string;
  description: string;
};

/**
 * The centred photo popup shared by the polaroid pile and the faces wall:
 * image on top, title and description in white beneath. Closes on the
 * backdrop, the button, or Esc.
 */
export default function PhotoLightbox({
  item,
  onClose,
}: {
  item: LightboxItem | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!item) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-5 py-8 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
        >
          <motion.figure
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0B0B0B] shadow-[0_40px_100px_-30px_rgba(0,0,0,1)]"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/55 text-lg leading-none text-white/80 backdrop-blur-sm transition hover:bg-black/80 hover:text-white"
            >
              &times;
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.src}
              alt={item.title}
              draggable={false}
              className="max-h-[62vh] w-full select-none object-contain"
            />

            <figcaption className="border-t border-white/10 px-6 py-5">
              <p className={`${script.className} text-2xl text-white`}>{item.title}</p>
              <p className="mt-1.5 text-sm leading-relaxed text-white">{item.description}</p>
            </figcaption>
          </motion.figure>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
