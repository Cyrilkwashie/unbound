"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CampaignStill } from "@/components/CampaignStill";
import { FEATURED_FRAMES } from "@/lib/frames";

const fade = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-12%" },
  transition: { duration: 1.05, ease: [0.22, 1, 0.36, 1] },
};

const DOORS = [
  { href: "/shop", kicker: "THE LINE", label: "SHOP", cursor: "SHOP" },
  { href: "/story", kicker: "THE HOUSE", label: "STORY", cursor: "VIEW" },
  { href: "/contact", kicker: "WRITE", label: "CONTACT", cursor: "VIEW" },
] as const;

export const HomeContinue = () => {
  return (
    <section className="relative bg-void-0">
      <div className="grid items-stretch lg:grid-cols-12">
        <motion.div className="relative min-h-[52vh] overflow-hidden lg:col-span-7 lg:min-h-[72vh]" {...fade}>
          <CampaignStill
            frame={FEATURED_FRAMES.editorial}
            alt="UNBOUND campaign still"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-void-0/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-void-0/70 max-lg:bg-gradient-to-t max-lg:from-void-0/80 max-lg:to-transparent" />
        </motion.div>

        <motion.div
          className="flex flex-col justify-center px-5 py-16 md:px-10 md:py-24 lg:col-span-5 lg:pl-16 lg:pr-12"
          {...fade}
        >
          <p className="text-[10px] tracking-[0.36em] text-mist">004 — THE HOUSE</p>
          <h2 className="mt-8 font-display text-[clamp(1.8rem,4vw,3rem)] font-light leading-[1.05] tracking-[0.1em] text-ivory">
            UNBOUND IS A STATE OF MIND
          </h2>
          <p className="mt-8 max-w-sm text-sm leading-8 text-mist">
            A shop for baggy clothes. Collection 001 waits on the rail —
            oversized, heavyweight, dark. Come take it.
          </p>
          <Link
            href="/story"
            className="mt-10 inline-flex items-center gap-3 text-[10px] tracking-[0.28em] text-ivory"
            data-cursor="VIEW"
          >
            READ THE STORY
            <span className="block h-px w-8 bg-ivory/70" />
          </Link>
        </motion.div>
      </div>

      <nav className="border-t border-ivory/10 px-5 md:px-10" aria-label="Continue through the house">
        {DOORS.map((door) => (
          <Link
            key={door.href}
            href={door.href}
            data-cursor={door.cursor}
            className="group flex flex-col gap-3 border-b border-ivory/10 py-8 md:flex-row md:items-baseline md:justify-between md:py-10"
          >
            <span className="text-[10px] tracking-[0.32em] text-mist">{door.kicker}</span>
            <span className="font-display text-[clamp(1.8rem,5vw,3.6rem)] tracking-[0.1em] text-ivory transition-colors duration-500 group-hover:text-mist">
              {door.label}
            </span>
          </Link>
        ))}
      </nav>
    </section>
  );
};
