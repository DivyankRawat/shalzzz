import ShowtimeLock from "@/components/showtime-lock";
import { HeroSection } from "@/components/hero-section";
import FloatingHearts from "@/components/floating-hearts";
import PhotoCards from "@/components/photo-cards";
import Scrapbook from "@/components/scrapbook";
import LoveLetter from "@/components/love-letter";
import Faces from "@/components/faces";

const SECTION = "h-screen  w-full snap-start snap-always shrink-0 overflow-visible relative z-10";

export default function Home() {
  return (
    <ShowtimeLock showPreviewButton targetDate={new Date("2026-08-28T18:30:00.000Z")}>
      <div className=" h-full w-full overflow-x-hidden overflow-y-scroll snap-y snap-mandatory bg-zinc-50 dark:bg-black select-none scroll-smooth">
        {/* The burn-and-reveal opener and the closing chat both run their own
            GSAP timelines against a full page of their own, so they stay
            standalone documents rather than being folded into React. */}
        <section className={SECTION}>
          <iframe
            src="/birthday.html"
            title="Birthday Reveal"
            style={{ width: "100vw", height: "100vh", border: "none", display: "block" }}
            allow="autoplay"
          />
        </section>

        <section className={SECTION}>
          <HeroSection />
        </section>

        <section className={SECTION}>
          {/* <FloatingHearts /> */}
          <PhotoCards />
        </section>

        <section className={SECTION}>
          <Scrapbook />
        </section>

        <section className={SECTION}>
          <Faces />
        </section>
        
        <section className={SECTION}>
          <LoveLetter />
        </section>

        <section className={SECTION}>
          <iframe
            src="/last.html"
            title="Birthday Reveal"
            style={{ width: "100vw", height: "100vh", border: "none", display: "block" }}
            allow="autoplay"
          />
        </section>
      </div>
    </ShowtimeLock>
  );
}
