"use client";

import { motion } from "framer-motion";

export const PhilosophySection = () => {
  return (
    <section
      id="story"
      className="relative bg-void-0 px-6 py-40 md:py-56"
    >
      <div className="mx-auto max-w-3xl text-center">
        <motion.p
          className="text-[10px] tracking-[0.4em] text-mist"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          005 — PHILOSOPHY
        </motion.p>
        <motion.h2
          className="mt-10 font-display text-[clamp(2rem,7vw,4.8rem)] font-light leading-[1.05] tracking-[0.08em] text-ivory"
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          UNBOUND IS A STATE OF MIND
        </motion.h2>
        <div className="editorial-line mx-auto mt-12 w-16" />
        <motion.p
          className="mx-auto mt-12 max-w-xl text-base leading-8 text-mist md:text-lg md:leading-9"
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          UNBOUND is a shop of baggy clothes. Oversized tops, cargos, outer —
          heavyweight, waiting on the rail. The line is here. Take it.
        </motion.p>
      </div>
    </section>
  );
};
