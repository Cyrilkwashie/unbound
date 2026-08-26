"use client";

import { FormEvent, useEffect, useState } from "react";
import { HouseSelect, pieceOptions } from "@/components/HouseSelect";
import {
  GARMENT_SIZES,
  stockCount,
  type CatalogProduct,
  type GarmentSize,
} from "@/lib/products";

type GoodsInBoardProps = {
  products: CatalogProduct[];
};

export const GoodsInBoard = ({ products }: GoodsInBoardProps) => {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const selected = products.find((item) => item.id === productId);
  const colors = selected?.colors ?? [];
  const sizes = (selected?.sizes?.length ? selected.sizes : [...GARMENT_SIZES]) as GarmentSize[];
  const [color, setColor] = useState(colors[0]?.label ?? "");
  const [size, setSize] = useState<GarmentSize>(sizes.includes("M") ? "M" : sizes[0] ?? "M");
  const [qty, setQty] = useState(1);
  const onHand = selected ? stockCount(selected, color, size) : null;

  useEffect(() => {
    const piece = products.find((item) => item.id === productId);
    if (!piece) return;
    const nextColor = piece.colors[0]?.label ?? "";
    const nextSizes = (piece.sizes?.length ? piece.sizes : [...GARMENT_SIZES]) as GarmentSize[];
    setColor(nextColor);
    setSize(nextSizes.includes("M") ? "M" : nextSizes[0] ?? "M");
    setQty(1);
  }, [productId, products]);

  const record = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const response = await fetch("/api/atelier/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ productId, color, size, qty }),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "The count could not be written.");
      setBusy(false);
      return;
    }
    window.location.reload();
  };

  return (
    <form className="max-w-xl" onSubmit={record}>
      <p className="max-w-md text-sm leading-7 text-mist">
        A drop arrived. Add it to the mark it belongs to. The shop sees the new count at once.
      </p>

      <label className="mt-10 block text-[10px] tracking-[0.32em] text-mist" htmlFor="in-piece">
        PIECE
      </label>
      <HouseSelect
        id="in-piece"
        value={productId}
        onChange={setProductId}
        options={pieceOptions(products)}
      />

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <label className="mt-10 block text-[10px] tracking-[0.32em] text-mist" htmlFor="in-color">
            COLOR
          </label>
          <HouseSelect
            id="in-color"
            value={color}
            onChange={setColor}
            options={colors.map((swatch) => ({
              value: swatch.label,
              label: swatch.label,
              swatch: swatch.hex,
            }))}
          />
        </div>
        <div>
          <label className="mt-10 block text-[10px] tracking-[0.32em] text-mist" htmlFor="in-size">
            SIZE
          </label>
          <HouseSelect
            id="in-size"
            value={size}
            onChange={(next) => setSize(next as GarmentSize)}
            options={sizes.map((option) => ({ value: option, label: option }))}
          />
        </div>
      </div>

      <p className="mt-6 text-[10px] tracking-[0.28em] text-mist">
        {onHand === null ? "OPEN" : `${String(onHand).padStart(2, "0")} ON HAND NOW`}
      </p>

      <label className="mt-10 block text-[10px] tracking-[0.32em] text-mist" htmlFor="in-qty">
        ADD
      </label>
      <input
        id="in-qty"
        type="number"
        min={1}
        value={qty}
        onChange={(event) => setQty(Math.max(1, Number(event.target.value) || 1))}
        className="mt-4 w-full border-b border-ivory/20 bg-transparent pb-3 text-sm text-ivory outline-none"
      />

      {error ? <p className="mt-6 text-sm leading-7 text-mist">{error}</p> : null}

      <button
        type="submit"
        disabled={busy || products.length === 0}
        className="mt-12 inline-flex items-center gap-3 text-[10px] tracking-[0.28em] text-ivory disabled:text-mist"
        data-cursor="VIEW"
      >
        {busy ? "WRITING" : "PUT ON THE RAIL"}
        <span className="block h-px w-8 bg-ivory/70" />
      </button>
    </form>
  );
};
