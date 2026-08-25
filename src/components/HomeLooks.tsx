"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ProductPhoto } from "@/components/ProductPhoto";
import {
  SHOP_CATEGORIES,
  type CatalogProduct,
} from "@/lib/products";

const fade = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-12%" },
  transition: { duration: 1.05, ease: [0.22, 1, 0.36, 1] },
};

export const HomeLooks = ({
  looks,
  pieceCount,
}: {
  looks: CatalogProduct[];
  pieceCount: number;
}) => {
  const [top, cargo] = looks;
  const departments = SHOP_CATEGORIES.filter((item) => item.id !== "all");

  if (!top) return null;

  return (
    <section className="relative bg-void-1 px-5 pb-28 pt-4 md:px-10 md:pb-36">
      <div className="mb-16 flex items-end justify-between gap-6 md:mb-24">
        <motion.div {...fade}>
          <p className="mb-4 text-[10px] tracking-[0.36em] text-mist">003 — THE OPENING LOOKS</p>
          <h2 className="font-display text-[clamp(1.8rem,4.5vw,3.4rem)] font-light tracking-[0.12em] text-ivory">
            NOW AVAILABLE
          </h2>
        </motion.div>
        <motion.p className="hidden max-w-xs text-right text-sm leading-7 text-mist md:block" {...fade}>
          Not a catalog. The two garments the film was cut around.
        </motion.p>
      </div>

      <article className="grid items-end gap-8 lg:grid-cols-12 lg:gap-12">
        <motion.div className="lg:col-span-8" {...fade}>
          <Link
            href={`/shop/${top.id}`}
            data-cursor="VIEW"
            data-cursor-grow="true"
            className="group relative block overflow-hidden"
            style={{ backgroundColor: top.imageBg }}
          >
            <span className="absolute left-5 top-5 z-10 text-[10px] tracking-[0.28em] text-void-0/70">
              {top.look} / {top.kicker.split(" / ")[1] ?? "TOP"}
            </span>
            <ProductPhoto
              src={top.image}
              alt={top.name}
              className="aspect-[4/5] w-full object-contain object-center p-6 transition-transform duration-700 ease-cinematic group-hover:scale-[1.03] lg:aspect-[5/6] lg:p-10"
            />
          </Link>
        </motion.div>
        <motion.div className="lg:col-span-4 lg:pb-6" {...fade}>
          <p className="text-[10px] tracking-[0.28em] text-mist">{top.kicker}</p>
          <h3 className="mt-4 font-display text-3xl tracking-[0.14em] text-ivory md:text-4xl">
            {top.name}
          </h3>
          <p className="mt-6 max-w-sm text-sm leading-7 text-mist">{top.description}</p>
          <p className="mt-8 font-serif text-2xl italic text-ivory">${top.price}</p>
          <Link
            href={`/shop/${top.id}`}
            className="mt-8 inline-flex items-center gap-3 text-[10px] tracking-[0.28em] text-ivory"
            data-cursor="SHOP"
          >
            SHOP LOOK
            <span className="block h-px w-8 bg-ivory/70" />
          </Link>
        </motion.div>
      </article>

      {cargo ? (
      <motion.article className="relative mt-24 overflow-hidden lg:mt-36" {...fade}>
        <Link
          href={`/shop/${cargo.id}`}
          data-cursor="VIEW"
          data-cursor-grow="true"
          className="group relative block"
        >
          <ProductPhoto
            src={cargo.image}
            alt={cargo.name}
            className="aspect-[4/5] w-full object-cover object-center transition-transform duration-[900ms] ease-cinematic group-hover:scale-[1.02] md:aspect-[16/9]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void-0/90 via-void-0/20 to-transparent" />
          <div className="absolute bottom-8 left-6 right-6 md:bottom-12 md:left-12 md:right-12">
            <p className="text-[10px] tracking-[0.28em] text-mist">{cargo.kicker}</p>
            <h3 className="mt-3 font-display text-[clamp(1.8rem,5vw,4rem)] tracking-[0.14em] text-ivory">
              {cargo.name}
            </h3>
            <p className="mt-4 max-w-md text-sm leading-7 text-ivory/75">{cargo.description}</p>
            <p className="mt-6 font-serif text-2xl italic text-ivory">${cargo.price}</p>
          </div>
        </Link>
      </motion.article>
      ) : null}

      <motion.div
        className="mt-20 flex flex-col gap-8 border-t border-ivory/10 pt-10 md:mt-28 md:flex-row md:items-center md:justify-between"
        {...fade}
      >
        <div className="flex flex-wrap items-center gap-7">
          {departments.map((item) => (
            <Link
              key={item.id}
              href={`/shop?category=${item.id}`}
              className="text-[10px] tracking-[0.28em] text-mist transition-colors duration-500 hover:text-ivory"
              data-cursor="VIEW"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-3 text-[10px] tracking-[0.28em] text-ivory"
          data-cursor="SHOP"
        >
          {String(pieceCount).padStart(2, "0")} PIECES — VIEW THE SHOP
          <span className="block h-px w-8 bg-ivory/70" />
        </Link>
      </motion.div>
    </section>
  );
};
