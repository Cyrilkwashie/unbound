"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useBag } from "@/context/BagContext";
import { ProductPhoto } from "@/components/ProductPhoto";
import { ColorChip } from "@/components/ColorChip";
import { QtyControl } from "@/components/QtyControl";
import {
  inStockColors,
  inStockSizes,
  isGarmentSize,
  isSoldOut,
  stockCellKey,
  stockCount,
  type CatalogProduct,
  type GarmentSize,
} from "@/lib/products";

type ProductCardProps = {
  product: CatalogProduct;
  reverse?: boolean;
  preview?: boolean;
};

export const ProductCard = ({ product, reverse = false, preview = false }: ProductCardProps) => {
  const { addItem } = useBag();
  const palette = inStockColors(product);
  const startColor = palette[0]?.label ?? product.colors[0]?.label ?? product.color;
  const [color, setColor] = useState(startColor);
  const [qtys, setQtys] = useState<Record<string, number>>({});
  const [added, setAdded] = useState(false);
  const sizes = inStockSizes(product, color);
  const soldOut = isSoldOut(product);
  const taking = Object.entries(qtys).filter(([, qty]) => qty > 0);
  const canTake = !soldOut && taking.length > 0;

  useEffect(() => {
    const next = inStockColors(product);
    if (next.some((swatch) => swatch.label === color)) return;
    setColor(next[0]?.label ?? product.colors[0]?.label ?? product.color);
  }, [product, color]);
  const reveal = preview
    ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-10%" },
      };

  const maxFor = (option: GarmentSize) => stockCount(product, color, option) ?? 0;

  const setQty = (option: GarmentSize, next: number) => {
    const max = maxFor(option);
    const key = stockCellKey(color, option);
    setQtys((current) => {
      const qty = Math.max(0, Math.min(max, next));
      const nextMap = { ...current };
      if (qty <= 0) {
        delete nextMap[key];
        return nextMap;
      }
      nextMap[key] = qty;
      return nextMap;
    });
  };

  const pickColor = (label: string) => {
    setColor(label);
  };

  const add = () => {
    if (!canTake) return;
    for (const [key, qty] of taking) {
      const sep = key.lastIndexOf("::");
      const mark = key.slice(0, sep);
      const size = key.slice(sep + 2);
      if (!isGarmentSize(size) || qty <= 0) continue;
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        size,
        color: mark,
        qty,
        image: product.image,
        imageFit: product.imageFit,
        imageBg: product.imageBg,
      });
    }
    setQtys({});
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
        {...reveal}
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
        {...reveal}
        transition={{ duration: 1.1, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="text-[10px] tracking-[0.32em] text-mist">{product.kicker}</p>
        <h2 className="mt-5 font-display text-[clamp(1.8rem,4vw,3.2rem)] tracking-[0.1em] text-ivory">
          {product.name}
        </h2>
        <p className="mt-6 max-w-md text-sm leading-7 text-mist">{product.description}</p>
        <p className="mt-10 font-serif text-3xl italic text-ivory">${product.price}</p>

        {palette.length > 0 ? (
          <div className="mt-10">
            <p className="text-[10px] tracking-[0.28em] text-mist">COLOR — {color}</p>
            <div className="mt-3 flex flex-wrap gap-3">
              {palette.map((swatch, index) => (
                <ColorChip
                  key={`${swatch.label}-${index}`}
                  hex={swatch.hex}
                  label={swatch.label}
                  selected={color === swatch.label}
                  onClick={() => pickColor(swatch.label)}
                />
              ))}
            </div>
          </div>
        ) : null}

        {sizes.length > 0 ? (
          <fieldset className="mt-10">
            <legend className="text-[10px] tracking-[0.28em] text-mist">SIZE</legend>
            <div className="mt-4 max-w-xs">
              {sizes.map((option) => {
                const qty = qtys[stockCellKey(color, option)] ?? 0;
                const max = maxFor(option);
                const atMax = max > 0 && qty >= max;
                return (
                  <div
                    key={option}
                    className={`border-b py-3 ${qty > 0 ? "border-ivory/40" : "border-ivory/10"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] tracking-[0.18em] text-ivory">{option}</span>
                      <QtyControl
                        value={qty}
                        max={max}
                        label={option}
                        onChange={(next) => setQty(option, next)}
                      />
                    </div>
                    {atMax ? (
                      <p className="mt-2 text-[10px] tracking-[0.22em] text-mist">
                        {`THAT'S ALL THERE IS IN ${option}`}
                      </p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </fieldset>
        ) : null}

        {preview ? null : (
          <button
            type="button"
            onClick={add}
            disabled={!canTake || soldOut}
            className="mt-12 inline-flex min-w-[220px] items-center justify-center border border-ivory/30 px-10 py-4 text-[11px] tracking-[0.32em] text-ivory transition-colors duration-500 enabled:hover:bg-ivory enabled:hover:text-void-0 disabled:opacity-30"
            data-cursor="SHOP"
          >
            {added ? "ADDED" : soldOut ? "SOLD OUT" : canTake ? "ADD TO BAG" : "CHOOSE A SIZE"}
          </button>
        )}
      </motion.div>
    </article>
  );
};
