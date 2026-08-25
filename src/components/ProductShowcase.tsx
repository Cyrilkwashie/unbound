"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useBag } from "@/context/BagContext";
import { ProductPhoto } from "@/components/ProductPhoto";
import { PRODUCT_IMAGES } from "@/lib/products";

const SIZES = ["XS", "S", "M", "L", "XL"] as const;

export const ProductShowcase = () => {
  const { addItem } = useBag();
  const [size, setSize] = useState<(typeof SIZES)[number]>("M");
  const [added, setAdded] = useState(false);

  const add = () => {
    addItem({
      id: "darkness-baggy-top",
      name: "DARKNESS BAGGY TOP",
      price: 165,
      size,
      color: "BLACK / WHITE",
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <section id="shop" className="bg-void-0 px-5 py-28 md:px-10 md:py-40">
      <div className="mb-16 md:mb-24">
        <p className="mb-4 text-[10px] tracking-[0.36em] text-mist">003 — FEATURED GARMENT</p>
        <h2 className="font-display text-[clamp(2rem,6vw,4.6rem)] font-light tracking-[0.12em] text-ivory">
          THE HERO PIECE
        </h2>
      </div>

      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
        <motion.div
          className="relative overflow-hidden bg-void-3 lg:col-span-7"
          data-cursor-grow="true"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <ProductPhoto
            src={PRODUCT_IMAGES.baggyTop}
            alt="UNBOUND Darkness baggy layered top"
            className="aspect-[4/5] w-full bg-[#cfc9c0] object-contain object-center p-8 md:aspect-[5/6] md:p-12"
          />
        </motion.div>

        <motion.div
          className="lg:col-span-5"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.1, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-[10px] tracking-[0.32em] text-mist">GARMENT 01 / BAGGY TOP</p>
          <h3 className="mt-5 font-display text-[clamp(1.8rem,4vw,3.2rem)] tracking-[0.1em] text-ivory">
            DARKNESS BAGGY TOP
          </h3>
          <p className="mt-6 max-w-md text-sm leading-7 text-mist">
            Oversized layered tee — black over white. Thorn graphic across the chest, sleeve marks
            down the arms. Cut to drape, not to fit in.
          </p>

          <p className="mt-10 font-serif text-3xl italic text-ivory">$165</p>

          <div className="mt-10">
            <p className="text-[10px] tracking-[0.28em] text-mist">COLOR — BLACK / WHITE</p>
            <div className="mt-3 flex gap-2">
              <div className="h-5 w-5 border border-ivory/40 bg-[#111]" title="Black" />
              <div className="h-5 w-5 border border-ivory/40 bg-ivory" title="White" />
            </div>
          </div>

          <fieldset className="mt-10">
            <legend className="text-[10px] tracking-[0.28em] text-mist">SIZE</legend>
            <div className="mt-4 flex flex-wrap gap-2">
              {SIZES.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSize(option)}
                  className={`min-w-12 border px-3 py-2 text-[11px] tracking-[0.18em] transition-colors duration-500 ${
                    size === option
                      ? "border-ivory bg-ivory text-void-0"
                      : "border-ivory/20 text-ivory hover:border-ivory/60"
                  }`}
                  data-cursor="VIEW"
                  aria-pressed={size === option}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          <button
            type="button"
            onClick={add}
            className="mt-12 inline-flex min-w-[220px] items-center justify-center border border-ivory/30 px-10 py-4 text-[11px] tracking-[0.32em] text-ivory transition-colors duration-500 hover:bg-ivory hover:text-void-0"
            data-cursor="SHOP"
          >
            {added ? "ADDED" : "ADD TO BAG"}
          </button>
        </motion.div>
      </div>
    </section>
  );
};
