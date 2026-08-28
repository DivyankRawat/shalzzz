"use client";

import MarqueeAlongSvgPath from "@/components/ui/marquee-along-svg-path";

const imgs = [
  { src: "/ref/heart.jpeg" },
  { src: "/ref/girl.jpeg" },
  { src: "/ref/girl2.jpeg" },
  { src: "/ref/girl3.jpeg" },
  { src: "/ref/girl4.jpeg" },
  { src: "/ref/girl5.jpeg" },
  { src: "/ref/girl6.jpeg" },
  { src: "/ref/girl7.jpeg" },
  { src: "/ref/girl8.jpeg" },
  { src: "/ref/girl9.jpeg" },
  { src: "/ref/girl10.jpeg" },
  { src: "/ref/girl11.jpeg" },
  { src: "/ref/girl12.jpeg" },
  { src: "/ref/girl13.jpeg" },
  { src: "/ref/girl14.jpeg" },
];

/** The looping ribbon the memory thumbnails ride along. */
const RIBBON_PATH =
  "M1 209.434C58.5872 255.935 387.926 325.938 482.583 209.434C600.905 63.8051 525.516 -43.2211 427.332 19.9613C329.149 83.1436 352.902 242.723 515.041 267.302C644.752 286.966 943.56 181.94 995 156.5";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden flex min-h-screen w-full flex-col overflow-x-hidden bg-black">
      <style>{HERO_CSS}</style>

      <div className="hero-mono flex items-center justify-between px-8 pt-8 text-[11px] uppercase tracking-[0.25em] text-white/55 sm:px-14">
        <span>Love You Baby</span>
      </div>

      <div className="px-8 pt-16 sm:px-14 sm:pt-20">
        <h1 className="hero-display text-[15vw] leading-[0.86] tracking-tight text-white sm:text-7xl lg:text-8xl">
          <span className="font-light">Happy</span>
          <br />
          <span className="font-bold">Birthday</span>
          <br />
          <span className="font-bold mt-1 text-[#FFB7CE]">Angry Bird</span>
        </h1>

        <div className="mt-6 h-px w-16 bg-white/40" />

        <p className="hero-body mt-6 max-w-sm text-base leading-relaxed text-white/70">
          wishing you a day filled with love, laughter, and all the happiness your heart
          can hold. May this year bring you endless joy and unforgettable memories. Happy
          Birthday!
        </p>
      </div>

      <div className=" absolute top-64 left-1/2 mt-0 w-screen -rotate-10 -translate-x-1/2 ">
        <MarqueeAlongSvgPath
          path={RIBBON_PATH}
          viewBox="0 0 996 330"
          width="100%"
          height="300"
          baseVelocity={5}
          slowdownOnHover
          draggable
          // 19 frames across the 1669-unit path -> ~16 units of gap between them
          repeat={19 / 12}
          dragSensitivity={0.08}
          dragVelocityDecay={0.98}
          slowDownFactor={0.05}
          slowDownSpringConfig={{ damping: 60, stiffness: 300 }}
          className="w-full h-full"
          responsive
          grabCursor
        >
          {imgs.map((img, i) => (
            <div
              key={i}
              className="h-18 w-18 overflow-hidden border border-white/20 bg-white/5 shadow-[0_0_14px_2px_rgba(255,255,255,0.14)] transition-[transform,box-shadow] duration-300 ease-out hover:scale-105 hover:shadow-[0_0_20px_4px_rgba(255,255,255,0.26)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.src}
                alt={`Memory ${i + 1}`}
                draggable={false}
                className="h-full w-full object-cover grayscale transition-[filter] duration-300 ease-out hover:grayscale-0"
              />
            </div>
          ))}
        </MarqueeAlongSvgPath>
      </div>

      <div className="mt-auto flex items-center justify-between px-8 pb-8 sm:px-14">
        <div className="h-px flex-1 bg-white/15" />
        <span className="hero-mono px-4 text-[10px] uppercase tracking-[0.25em] text-white/55">
          Made for you
        </span>
      </div>
    </section>
  );
}

const HERO_CSS = `@import "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300..800&family=Work+Sans:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap";
.hero-display{font-family:Bricolage Grotesque,sans-serif}
.hero-body{font-family:Work Sans,sans-serif}
.hero-mono{font-family:JetBrains Mono,monospace}`;

export default HeroSection;
