"use client";

import Link from "next/link";
import { ProductPhoto } from "@/components/ProductPhoto";
import type { CatalogProduct } from "@/lib/products";

type ShopTileProps = {
  product: CatalogProduct;
  index: number;
};

export const ShopTile = ({ product, index }: ShopTileProps) => {
  const odd = index % 2 === 1;

  return (
    <Link
      href={`/shop/${product.id}`}
      data-cursor="VIEW"
      data-cursor-grow="true"
      className={`group block ${odd ? "md:mt-16" : ""}`}
    >
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: product.imageBg }}
      >
        <span
          className={`absolute left-4 top-4 z-10 text-[10px] tracking-[0.32em] ${
            product.imageFit === "cover" ? "text-ivory/80" : "text-void-0/55"
          }`}
        >
          {product.look}
        </span>
        <ProductPhoto
          src={product.image}
          alt={product.name}
          className={`aspect-[4/5] w-full object-center transition-transform duration-700 ease-cinematic group-hover:scale-[1.04] ${
            product.imageFit === "contain" ? "object-contain p-8 md:p-12" : "object-cover"
          }`}
        />
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-[13px] tracking-[0.16em] text-ivory">
          {product.name}
        </h2>
        <p className="shrink-0 font-serif text-lg italic text-ivory">${product.price}</p>
      </div>
      <p className="mt-2 text-[10px] tracking-[0.22em] text-mist">{product.color}</p>
    </Link>
  );
};
