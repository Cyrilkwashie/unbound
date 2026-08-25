"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const fade = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-12%" },
  transition: { duration: 1.05, ease: [0.22, 1, 0.36, 1] },
};

export const HomeStatement = () => {
  return (
    <section id="house" className="relative bg-void-0 px-5 py-28 md:px-10 md:py-36">
      <motion.p className="text-[10px] tracking-[0.36em] text-mist" {...fade}>
        002 — COLLECTION 001
      </motion.p>
      <motion.h2
        className="mt-8 max-w-5xl font-display text-[clamp(2.4rem,8vw,6.2rem)] font-light leading-[0.92] tracking-[0.12em] text-ivory"
        {...fade}
      >
        CUT FOR MOTION
      </motion.h2>
      <div className="editorial-line mt-12 w-16" />
      <motion.div
        className="mt-12 flex flex-col gap-10 md:mt-16 md:flex-row md:items-end md:justify-between"
        {...fade}
      >
        <p className="max-w-md text-sm leading-8 text-mist">
          The film is the house. What follows is the line — oversized, heavyweight,
          cut to move. Two opening garments. The rest waits in the shop.
        </p>
        <Link
          href="/shop"
          className="inline-flex shrink-0 items-center gap-3 text-[10px] tracking-[0.28em] text-ivory"
          data-cursor="SHOP"
        >
          ENTER THE SHOP
          <span className="block h-px w-8 bg-ivory/70" />
        </Link>
      </motion.div>
    </section>
  );
};
