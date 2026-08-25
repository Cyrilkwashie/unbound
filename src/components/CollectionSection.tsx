"use client";

import { motion } from "framer-motion";
import { ProductPhoto } from "@/components/ProductPhoto";
import { PRODUCT_IMAGES } from "@/lib/products";

const fade = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-12%" },
  transition: { duration: 1.05, ease: [0.22, 1, 0.36, 1] },
};

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
          Two opening garments. Oversized proportion, heavyweight construction, designed to move.
        </motion.p>
      </div>

      <article className="grid items-end gap-8 lg:grid-cols-12 lg:gap-12">
        <motion.a
          href="#shop"
          data-cursor="EXPLORE"
          data-cursor-grow="true"
          className="group relative block overflow-hidden bg-[#cfc9c0] lg:col-span-8"
          {...fade}
        >
          <ProductPhoto
            src={PRODUCT_IMAGES.baggyTop}
            alt="UNBOUND Darkness baggy layered top"
            className="aspect-[4/5] w-full object-contain object-center p-6 transition-transform duration-700 ease-cinematic group-hover:scale-[1.03] lg:aspect-[5/6] lg:p-10"
          />
          <span className="absolute left-5 top-5 text-[10px] tracking-[0.28em] text-void-0/70">
            01 / BAGGY TOP
          </span>
        </motion.a>
        <motion.div className="lg:col-span-4 lg:pb-6" {...fade}>
          <h3 className="font-display text-3xl tracking-[0.14em] text-ivory md:text-4xl">
            BAGGY TOP
          </h3>
          <p className="mt-6 max-w-sm text-sm leading-7 text-mist">
            Oversized layered tee. Black over white. Thorn graphic, built for movement.
          </p>
          <p className="mt-8 text-[11px] tracking-[0.24em] text-ivory">$165</p>
          <a
            href="#shop"
            className="mt-8 inline-flex items-center gap-3 text-[10px] tracking-[0.28em] text-ivory"
            data-cursor="SHOP"
          >
            SHOP GARMENT
            <span className="block h-px w-8 bg-ivory/70" />
          </a>
        </motion.div>
      </article>

      <article className="mt-24 grid items-center gap-8 lg:mt-36 lg:grid-cols-12">
        <motion.div className="lg:col-span-5 lg:col-start-2 lg:pr-8" {...fade}>
          <p className="mb-5 text-[10px] tracking-[0.28em] text-mist">02 / HOOD</p>
          <h3 className="font-display text-3xl tracking-[0.14em] text-ivory md:text-4xl">
            HOODIES
          </h3>
          <p className="mt-6 max-w-sm text-sm leading-7 text-mist">
            Sculpted volume. Brushed interior. A silhouette that holds its own in motion.
          </p>
          <p className="mt-8 text-[11px] tracking-[0.24em] text-mist">LOOK 02 — FORTHCOMING</p>
        </motion.div>
        <motion.div
          className="flex min-h-[280px] items-end border border-ivory/10 bg-void-3 p-8 lg:col-span-6 lg:min-h-[420px]"
          {...fade}
        >
          <p className="font-serif text-2xl italic text-ivory/40 md:text-4xl">Soon.</p>
        </motion.div>
      </article>

      <motion.article
        className="relative mt-24 overflow-hidden bg-[#eceae4] lg:mt-40"
        {...fade}
      >
        <a href="#shop" data-cursor="EXPLORE" data-cursor-grow="true" className="group block">
          <ProductPhoto
            src={PRODUCT_IMAGES.cargo}
            alt="UNBOUND baggy cargo pants"
            className="aspect-[4/5] w-full object-cover object-center transition-transform duration-[900ms] ease-cinematic group-hover:scale-[1.02] md:aspect-[16/9]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void-0/85 via-void-0/10 to-transparent" />
          <div className="absolute bottom-8 left-6 right-6 md:bottom-12 md:left-12">
            <p className="text-[10px] tracking-[0.28em] text-mist">03 / TROUSER</p>
            <h3 className="mt-3 font-display text-[clamp(1.8rem,5vw,4rem)] tracking-[0.14em] text-ivory">
              CARGO PANTS
            </h3>
            <p className="mt-4 max-w-md text-sm leading-7 text-ivory/75">
              Architectural pockets. Relaxed fall. Cut to travel with the body, not against it.
            </p>
            <p className="mt-6 text-[11px] tracking-[0.24em] text-ivory">$195</p>
          </div>
        </a>
      </motion.article>
    </section>
  );
};
