"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { FEATURED_FRAMES } from "@/lib/frames";
import { CampaignStill } from "@/components/CampaignStill";

export const EditorialSection = () => {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const opacity = useTransform(scrollYProgress, [0.1, 0.35, 0.7, 0.95], [0, 1, 1, 0.4]);

  return (
    <section
      ref={ref}
      className="relative min-h-[120vh] overflow-hidden bg-void-2"
    >
      <motion.div style={{ y }} className="absolute inset-0" data-cursor-grow="true">
        <CampaignStill
          frame={FEATURED_FRAMES.editorial}
          alt="Editorial campaign still"
          className="h-[120%] w-full object-cover object-center opacity-80"
        />
      </motion.div>
      <div className="absolute inset-0 bg-void-0/45" />
      <div className="absolute inset-0 bg-gradient-to-b from-void-0 via-transparent to-void-0" />

      <motion.div
        style={{ opacity }}
        className="relative z-10 flex min-h-[120vh] flex-col items-center justify-center px-6 text-center"
      >
        <p className="mb-8 text-[10px] tracking-[0.4em] text-mist">004 — THE FILM</p>
        <h2 className="max-w-5xl font-serif text-[clamp(3rem,10vw,8.5rem)] font-light italic leading-[0.9] text-ivory text-balance">
          Beyond the expected.
        </h2>
        <p className="mt-10 max-w-md text-sm leading-7 text-ivory/75">
          Not louder. Clearer. A study in proportion, shadow, and the space around the body.
        </p>
      </motion.div>
    </section>
  );
};
