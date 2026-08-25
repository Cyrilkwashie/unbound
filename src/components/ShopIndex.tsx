"use client";

import { useMemo, useState } from "react";
import {
  SHOP_CATEGORIES,
  productsInCategory,
  type ShopCategory,
} from "@/lib/products";
import { ShopTile } from "@/components/ShopTile";
import { useLenis } from "@/context/LenisContext";

export const ShopIndex = () => {
  const lenis = useLenis();
  const [category, setCategory] = useState<ShopCategory>("all");
  const pieces = useMemo(() => productsInCategory(category), [category]);

  const selectCategory = (next: ShopCategory) => {
    if (next === category) return;
    setCategory(next);
    if (lenis) lenis.scrollTo(0, { duration: 12 / 10 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <div className="sticky top-[4.25rem] z-30 border-y border-ivory/10 bg-void-0/85 px-5 py-4 backdrop-blur-md md:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-6 md:gap-8">
            {SHOP_CATEGORIES.map((item) => {
              const active = category === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectCategory(item.id)}
                  className={`text-[10px] tracking-[0.28em] transition-colors duration-500 ${
                    active ? "text-ivory" : "text-mist hover:text-ivory"
                  }`}
                  data-cursor="VIEW"
                  aria-pressed={active}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
          <p className="text-[10px] tracking-[0.28em] text-mist">
            {String(pieces.length).padStart(2, "0")} PIECES
          </p>
        </div>
      </div>

      {pieces.length === 0 ? (
        <p className="px-5 py-32 text-center font-serif text-2xl italic text-mist md:px-10">
          This chapter is still being cut.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-x-5 gap-y-16 px-5 py-14 md:grid-cols-2 md:gap-x-8 md:gap-y-24 md:px-10 md:py-20 lg:grid-cols-2 xl:gap-x-12">
          {pieces.map((product, index) => (
            <ShopTile key={product.id} product={product} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};
