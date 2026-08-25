"use client";

import { motion } from "framer-motion";
import { CampaignStill } from "@/components/CampaignStill";
import { FEATURED_FRAMES } from "@/lib/frames";

const fade = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-12%" },
  transition: { duration: 1.05, ease: [0.22, 1, 0.36, 1] },
};

const pieces = [
  {
    id: "01",
    title: "BAGGY TEES",
    copy: "Oversized proportions, heavyweight construction, designed for movement.",
    price: "FROM $145",
    frame: FEATURED_FRAMES.baggyTees,
    imageClass: "aspect-[4/5] lg:aspect-[5/6]",
  },
  {
    id: "02",
    title: "HOODIES",
    copy: "Sculpted volume. Brushed interior. A silhouette that holds its own in motion.",
    price: "FROM $220",
    frame: FEATURED_FRAMES.hoodies,
    imageClass: "aspect-[3/4]",
  },
  {
    id: "03",
    title: "CARGO PANTS",
    copy: "Architectural pockets. Relaxed fall. Cut to travel with the body, not against it.",
    price: "FROM $195",
    frame: FEATURED_FRAMES.cargo,
    imageClass: "aspect-[16/9] md:aspect-[21/9]",
  },
] as const;

export const CollectionSection = () => {
  return (
    <section id="collection" className="relative bg-void-1 px-5 py-28 md:px-10 md:py-40">
      <div className="mb-20 flex items-end justify-between gap-6 md:mb-28">
        <motion.div {...fade}>
          <p className="mb-4 text-[10px] tracking-[0.36em] text-mist">002 — THE COLLECTION</p>
          <h2 className="font-display text-[clamp(2rem,6vw,5.2rem)] font-light tracking-[0.12em] text-ivory">
            CUT FOR MOTION
          </h2>
        </motion.div>
        <motion.p
          className="hidden max-w-xs text-right text-sm leading-7 text-mist md:block"
          {...fade}
        >
          Three chapters. One attitude. Collection 001 is built around proportion, weight, and the refusal to sit still.
        </motion.p>
      </div>

      <article className="grid items-end gap-8 lg:grid-cols-12 lg:gap-12">
        <motion.a
          href="#shop"
          data-cursor="EXPLORE"
          data-cursor-grow="true"
          className="group relative block overflow-hidden bg-void-3 lg:col-span-8"
          {...fade}
        >
          <CampaignStill
            frame={pieces[0].frame}
            alt="Baggy tees campaign still"
            className={`w-full object-cover object-center transition-transform duration-700 ease-cinematic group-hover:scale-[1.03] ${pieces[0].imageClass}`}
          />
          <span className="absolute left-5 top-5 text-[10px] tracking-[0.28em] text-ivory/80">
            {pieces[0].id} / {pieces[0].title}
          </span>
        </motion.a>
        <motion.div className="lg:col-span-4 lg:pb-6" {...fade}>
          <h3 className="font-display text-3xl tracking-[0.14em] text-ivory md:text-4xl">
            {pieces[0].title}
          </h3>
          <p className="mt-6 max-w-sm text-sm leading-7 text-mist">{pieces[0].copy}</p>
          <p className="mt-8 text-[11px] tracking-[0.24em] text-ivory">{pieces[0].price}</p>
          <a
            href="#shop"
            className="mt-8 inline-flex items-center gap-3 text-[10px] tracking-[0.28em] text-ivory"
            data-cursor="SHOP"
          >
            SHOP CHAPTER
            <span className="block h-px w-8 bg-ivory/70" />
          </a>
        </motion.div>
      </article>

      <article className="mt-24 grid items-center gap-8 lg:mt-36 lg:grid-cols-12">
        <motion.div className="lg:col-span-5 lg:col-start-2 lg:pr-8" {...fade}>
          <p className="mb-5 text-[10px] tracking-[0.28em] text-mist">{pieces[1].id} / HOOD</p>
          <h3 className="font-display text-3xl tracking-[0.14em] text-ivory md:text-4xl">
            {pieces[1].title}
          </h3>
          <p className="mt-6 max-w-sm text-sm leading-7 text-mist">{pieces[1].copy}</p>
          <p className="mt-8 text-[11px] tracking-[0.24em] text-ivory">{pieces[1].price}</p>
          <a
            href="#shop"
            className="mt-8 inline-flex items-center gap-3 text-[10px] tracking-[0.28em] text-ivory"
            data-cursor="SHOP"
          >
            SHOP CHAPTER
            <span className="block h-px w-8 bg-ivory/70" />
          </a>
        </motion.div>
        <motion.a
          href="#shop"
          data-cursor="EXPLORE"
          data-cursor-grow="true"
          className="group relative block overflow-hidden bg-void-3 lg:col-span-6"
          {...fade}
        >
          <CampaignStill
            frame={pieces[1].frame}
            alt="Hoodies campaign still"
            className={`w-full object-cover object-center transition-transform duration-700 ease-cinematic group-hover:scale-[1.03] ${pieces[1].imageClass}`}
          />
        </motion.a>
      </article>

      <motion.article
        className="relative mt-24 overflow-hidden bg-void-3 lg:mt-40"
        {...fade}
      >
        <a href="#shop" data-cursor="EXPLORE" data-cursor-grow="true" className="group block">
          <CampaignStill
            frame={pieces[2].frame}
            alt="Cargo pants campaign still"
            className={`w-full object-cover object-center transition-transform duration-[900ms] ease-cinematic group-hover:scale-[1.02] ${pieces[2].imageClass}`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void-0/80 via-void-0/10 to-transparent" />
          <div className="absolute bottom-8 left-6 right-6 md:bottom-12 md:left-12">
            <p className="text-[10px] tracking-[0.28em] text-mist">{pieces[2].id} / TROUSER</p>
            <h3 className="mt-3 font-display text-[clamp(1.8rem,5vw,4rem)] tracking-[0.14em] text-ivory">
              {pieces[2].title}
            </h3>
            <p className="mt-4 max-w-md text-sm leading-7 text-ivory/75">{pieces[2].copy}</p>
            <p className="mt-6 text-[11px] tracking-[0.24em] text-ivory">{pieces[2].price}</p>
          </div>
        </a>
      </motion.article>
    </section>
  );
};
