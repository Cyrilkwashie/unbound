"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useBag } from "@/context/BagContext";
import { ProductPhoto } from "@/components/ProductPhoto";
import { GARMENT_SIZES, type CatalogProduct, type GarmentSize } from "@/lib/products";

type ProductCardProps = {
  product: CatalogProduct;
  reverse?: boolean;
};

export const ProductCard = ({ product, reverse = false }: ProductCardProps) => {
  const { addItem } = useBag();
  const sizes = product.sizes?.length ? product.sizes : [...GARMENT_SIZES];
  const [size, setSize] = useState<GarmentSize>(sizes.includes("M") ? "M" : sizes[0]);
  const [color, setColor] = useState(product.colors[0]?.label ?? product.color);
  const [added, setAdded] = useState(false);

  const add = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      size,
      color,
    });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article
      id={product.id}
      className="grid items-center gap-12 px-5 py-20 md:px-10 lg:grid-cols-12 lg:gap-16 lg:py-28"
    >
      <motion.div
        className={`relative overflow-hidden lg:col-span-7 ${reverse ? "lg:order-2" : ""}`}
        style={{ backgroundColor: product.imageBg }}
        data-cursor-grow="true"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <ProductPhoto
          src={product.image}
          alt={product.name}
          className={`aspect-[4/5] w-full object-center md:aspect-[5/6] ${
            product.imageFit === "contain"
              ? "object-contain p-8 md:p-12"
              : "object-cover"
          }`}
        />
      </motion.div>

      <motion.div
        className={`lg:col-span-5 ${reverse ? "lg:order-1" : ""}`}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1.1, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-[10px] tracking-[0.32em] text-mist">{product.kicker}</p>
        <h2 className="mt-5 font-display text-[clamp(1.8rem,4vw,3.2rem)] tracking-[0.1em] text-ivory">
          {product.name}
        </h2>
        <p className="mt-6 max-w-md text-sm leading-7 text-mist">{product.description}</p>
        <p className="mt-10 font-serif text-3xl italic text-ivory">${product.price}</p>

        <div className="mt-10">
          <p className="text-[10px] tracking-[0.28em] text-mist">COLOR — {color}</p>
          <div className="mt-3 flex gap-2">
            {product.colors.map((swatch) => (
              <button
                key={swatch.label}
                type="button"
                onClick={() => setColor(swatch.label)}
                className={`h-5 w-5 border ${
                  color === swatch.label ? "border-ivory" : "border-ivory/40"
                }`}
                style={{ backgroundColor: swatch.hex }}
                title={swatch.label}
                aria-pressed={color === swatch.label}
                data-cursor="VIEW"
              />
            ))}
          </div>
        </div>

        <fieldset className="mt-10">
          <legend className="text-[10px] tracking-[0.28em] text-mist">SIZE</legend>
          <div className="mt-4 flex flex-wrap gap-2">
            {sizes.map((option) => (
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
    </article>
  );
};
