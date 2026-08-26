"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { ProductCard } from "@/components/ProductCard";
import { ColorChip } from "@/components/ColorChip";
import { HouseSelect } from "@/components/HouseSelect";
import { useLenis } from "@/context/LenisContext";
import {
  DEFAULT_ON_HAND,
  GARMENT_SIZES,
  HOUSE_COLORS,
  hexesMatch,
  normalizeHex,
  stockCellKey,
  type CatalogProduct,
  type GarmentSize,
  type ProductCategory,
  type StockCell,
} from "@/lib/products";

const field =
  "mt-4 w-full border-b border-ivory/20 bg-transparent pb-3 text-sm tracking-[0.08em] text-ivory outline-none";
const label = "mt-10 block text-[10px] tracking-[0.32em] text-mist first:mt-0";

type Swatch = { key: string; label: string; hex: string };

const swatchKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const defaultSwatches = (product?: CatalogProduct): Swatch[] => {
  if (product?.colors?.length) {
    return product.colors.map((swatch) => ({ key: swatchKey(), ...swatch }));
  }
  return [{ key: swatchKey(), label: product?.color ?? "BLACK", hex: "#111111" }];
};

const defaultSizes = (product?: CatalogProduct): GarmentSize[] =>
  product?.sizes?.length ? [...product.sizes] : [...GARMENT_SIZES];

const tight =
  "mt-2 w-full border-b border-ivory/20 bg-transparent pb-2 text-sm tracking-[0.08em] text-ivory outline-none";

const defaultStockMap = (product?: CatalogProduct): Record<string, number> => {
  const map: Record<string, number> = {};
  for (const cell of product?.stock ?? []) {
    map[stockCellKey(cell.color, cell.size)] = cell.count;
  }
  return map;
};

type LineFormProps = {
  product?: CatalogProduct;
  featured: boolean;
};

export const LineForm = ({ product, featured: startedFeatured }: LineFormProps) => {
  const router = useRouter();
  const lenis = useLenis();
  const formRef = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [featured, setFeatured] = useState(startedFeatured);
  const [image, setImage] = useState(product?.image ?? "/shop/split-crew.png");
  const [category, setCategory] = useState<ProductCategory>(product?.category ?? "tops");
  const [rail, setRail] = useState<CatalogProduct["status"]>(product?.status ?? "available");
  const [imageFit, setImageFit] = useState<"contain" | "cover">(product?.imageFit ?? "contain");
  const [colors, setColors] = useState<Swatch[]>(() => defaultSwatches(product));
  const [sizes, setSizes] = useState<GarmentSize[]>(() => defaultSizes(product));
  const [stock, setStock] = useState<Record<string, number>>(() => defaultStockMap(product));
  const [preview, setPreview] = useState<CatalogProduct | null>(null);
  const isEdit = Boolean(product);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setError("");
    const form = new FormData(event.currentTarget);
    if (sizes.length === 0) {
      setError("Choose at least one size.");
      return;
    }
    const palette = colors
      .map((swatch) => ({
        label: swatch.label.trim().toUpperCase(),
        hex: swatch.hex.trim() || "#111111",
      }))
      .filter((swatch) => swatch.label);
    if (palette.length === 0) {
      setError("Add at least one color.");
      return;
    }
    const cells = stockCellsFor(palette, sizes);
    setBusy(true);

    const payload = {
      id: product?.id,
      name: String(form.get("name") ?? ""),
      look: String(form.get("look") ?? ""),
      kicker: String(form.get("kicker") ?? ""),
      category: String(form.get("category") ?? ""),
      price: String(form.get("price") ?? ""),
      color: palette.map((swatch) => swatch.label).join(" / ").toUpperCase(),
      colors: palette,
      sizes,
      stock: cells,
      description: String(form.get("description") ?? ""),
      image,
      imageFit: String(form.get("imageFit") ?? "contain"),
      imageBg: String(form.get("imageBg") ?? ""),
      status: String(form.get("status") ?? "available"),
      featured,
    };

    const response = await fetch("/api/atelier/line", {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify(payload),
    });
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    if (!response.ok) {
      setError(body?.error ?? "The piece could not be saved.");
      setBusy(false);
      return;
    }
    window.location.assign("/atelier/line");
  };

  const pull = async () => {
    if (!product || busy) return;
    if (!window.confirm("Pull this piece from the line? The shop will lose it.")) return;
    setBusy(true);
    const response = await fetch("/api/atelier/line", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id: product.id }),
    });
    if (!response.ok) {
      setBusy(false);
      setError("Could not pull the piece.");
      return;
    }
    window.location.assign("/atelier/line");
  };

  const upload = async (file: File) => {
    const data = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("read"));
      reader.readAsDataURL(file);
    });
    const response = await fetch("/api/atelier/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ filename: file.name, data }),
    });
    const body = (await response.json().catch(() => null)) as { path?: string; error?: string } | null;
    if (!response.ok || !body?.path) {
      setError(body?.error ?? "The still could not be placed.");
      return;
    }
    setImage(body.path);
  };

  const addColor = () => {
    setColors((current) => [...current, { key: swatchKey(), label: "", hex: "" }]);
  };

  const dropColor = (key: string) => {
    setColors((current) => current.filter((item) => item.key !== key));
  };

  const patchColor = (key: string, patch: Partial<Omit<Swatch, "key">>) => {
    setColors((current) =>
      current.map((item) => (item.key === key ? { ...item, ...patch } : item))
    );
  };

  const pickHouseColor = (key: string, sample: (typeof HOUSE_COLORS)[number]) => {
    setColors((current) =>
      current.map((item) => {
        if (item.key !== key) return item;
        const named = item.label.trim().toUpperCase();
        const house = HOUSE_COLORS.some((color) => color.label === named);
        return {
          ...item,
          hex: sample.hex,
          label: !named || house ? sample.label : item.label,
        };
      })
    );
  };

  const toggleSize = (option: GarmentSize) => {
    setSizes((current) =>
      current.includes(option)
        ? current.filter((item) => item !== option)
        : GARMENT_SIZES.filter((size) => current.includes(size) || size === option)
    );
  };

  const stockCellsFor = (palette: { label: string }[], sizeList: GarmentSize[]): StockCell[] => {
    const cells: StockCell[] = [];
    for (const swatch of palette) {
      const color = swatch.label.trim().toUpperCase();
      for (const size of sizeList) {
        const count = Math.max(0, Math.floor(Number(stock[stockCellKey(color, size)]) || 0));
        cells.push({ color, size, count });
      }
    }
    return cells;
  };

  const patchStock = (color: string, size: GarmentSize, raw: string) => {
    const key = stockCellKey(color, size);
    setStock((current) => {
      const next = { ...current };
      if (raw.trim() === "") {
        delete next[key];
        return next;
      }
      next[key] = Math.max(0, Math.floor(Number(raw) || 0));
      return next;
    });
  };

  const namedCount = colors.filter((swatch) => swatch.label.trim()).length;
  const namedColors = colors.filter((swatch) => swatch.label.trim());
  const onHand = namedColors.reduce((total, swatch) => {
    const color = swatch.label.trim().toUpperCase();
    return (
      total +
      sizes.reduce((count, size) => count + (Number(stock[stockCellKey(color, size)]) || 0), 0)
    );
  }, 0);

  useEffect(() => {
    const names = namedColors.map((swatch) => swatch.label.trim().toUpperCase());
    if (names.length === 0 || sizes.length === 0) return;
    setStock((current) => {
      const next = { ...current };
      let changed = false;
      const donor = names[0];
      for (const name of names) {
        const hasAny = sizes.some((size) => current[stockCellKey(name, size)] !== undefined);
        if (hasAny) continue;
        for (const size of sizes) {
          const fromDonor = donor !== name ? current[stockCellKey(donor, size)] : undefined;
          next[stockCellKey(name, size)] =
            fromDonor !== undefined ? fromDonor : DEFAULT_ON_HAND;
          changed = true;
        }
      }
      return changed ? next : current;
    });
  }, [namedColors, sizes]);

  const pieceFromForm = (): CatalogProduct | null => {
    const form = formRef.current;
    if (!form) return null;
    const data = new FormData(form);
    const palette = colors
      .map((swatch) => ({
        label: swatch.label.trim().toUpperCase(),
        hex: swatch.hex.trim() || "#111111",
      }))
      .filter((swatch) => swatch.label);
    const look = (String(data.get("look") ?? product?.look ?? "01").trim() || "01")
      .padStart(2, "0")
      .slice(-2);
    const category = (["tops", "bottoms", "outer"].includes(String(data.get("category") ?? ""))
      ? String(data.get("category"))
      : "tops") as ProductCategory;
    const name = String(data.get("name") ?? "").trim().toUpperCase() || "UNTITLED";
    const kicker =
      String(data.get("kicker") ?? "").trim().toUpperCase() || `LOOK ${look} / ${category.toUpperCase()}`;
    const previewSizes = sizes.length > 0 ? sizes : [...GARMENT_SIZES];
    const previewPalette = palette.length > 0 ? palette : [{ label: "BLACK", hex: "#111111" }];
    const cells = stockCellsFor(previewPalette, previewSizes);
    return {
      id: product?.id ?? "preview",
      look,
      name,
      kicker,
      category,
      price: Number(data.get("price")) || 0,
      color: palette.map((swatch) => swatch.label).join(" / ") || "BLACK",
      colors: previewPalette,
      sizes: previewSizes,
      description: String(data.get("description") ?? "").trim(),
      image,
      imageFit: data.get("imageFit") === "cover" ? "cover" : "contain",
      imageBg: String(data.get("imageBg") ?? "").trim() || "#cfc9c0",
      status: data.get("status") === "forthcoming" ? "forthcoming" : "available",
      stock: cells,
    };
  };

  const showPreview = () => {
    const next = pieceFromForm();
    if (next) setPreview(next);
  };

  useEffect(() => {
    if (!preview) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPreview(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [preview]);

  useEffect(() => {
    if (!preview) return;
    lenis?.stop();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      lenis?.start();
      document.body.style.overflow = previous;
    };
  }, [preview, lenis]);

  const previewOpen = Boolean(preview);

  useEffect(() => {
    if (!previewOpen) return;
    const next = pieceFromForm();
    if (next) setPreview(next);
    const form = formRef.current;
    if (!form) return;
    const sync = () => {
      const piece = pieceFromForm();
      if (piece) setPreview(piece);
    };
    form.addEventListener("input", sync);
    form.addEventListener("change", sync);
    return () => {
      form.removeEventListener("input", sync);
      form.removeEventListener("change", sync);
    };
    // pieceFromForm reads the open form plus colors, sizes, stock, and image.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [colors, sizes, stock, image, previewOpen]);

  return (
    <>
    <form ref={formRef} className="max-w-3xl" onSubmit={submit}>
      <label className={label} htmlFor="piece-name">
        NAME
      </label>
      <input id="piece-name" name="name" required defaultValue={product?.name} className={field} />

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <label className={label} htmlFor="piece-look">
            LOOK
          </label>
          <input id="piece-look" name="look" defaultValue={product?.look} placeholder="01" className={field} />
        </div>
        <div>
          <label className={label} htmlFor="piece-price">
            PRICE
          </label>
          <input
            id="piece-price"
            name="price"
            type="number"
            min="0"
            step="1"
            required
            defaultValue={product?.price ?? 165}
            className={field}
          />
        </div>
      </div>

      <label className={label} htmlFor="piece-kicker">
        KICKER
      </label>
      <input
        id="piece-kicker"
        name="kicker"
        defaultValue={product?.kicker}
        placeholder="GARMENT 01 / BAGGY TOP"
        className={field}
      />

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <label className={label} htmlFor="piece-category">
            DEPARTMENT
          </label>
          <HouseSelect
            id="piece-category"
            name="category"
            value={category}
            onChange={(next) => setCategory(next as ProductCategory)}
            options={[
              { value: "tops", label: "TOPS" },
              { value: "bottoms", label: "BOTTOMS" },
              { value: "outer", label: "OUTER" },
            ]}
          />
        </div>
        <div>
          <label className={label} htmlFor="piece-status">
            RAIL
          </label>
          <HouseSelect
            id="piece-status"
            name="status"
            value={rail}
            onChange={(next) => setRail(next as CatalogProduct["status"])}
            options={[
              { value: "available", label: "ON THE RAIL" },
              { value: "forthcoming", label: "FORTHCOMING" },
            ]}
          />
        </div>
      </div>

      <div className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <p className="text-[10px] tracking-[0.32em] text-mist">
            COLOR{namedCount ? ` — ${String(namedCount).padStart(2, "0")}` : ""}
          </p>
          <button
            type="button"
            onClick={addColor}
            className="inline-flex items-center gap-3 text-[10px] tracking-[0.28em] text-ivory"
            data-cursor="VIEW"
          >
            ADD COLOR
            <span className="block h-px w-8 bg-ivory/70" />
          </button>
        </div>
        {colors.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-3">
            {colors.map((swatch) => (
              <ColorChip
                key={swatch.key}
                hex={swatch.hex || "#111111"}
                label={swatch.label || "Untitled"}
              />
            ))}
          </div>
        ) : null}
        {colors.length === 0 ? (
          <p className="mt-8 text-sm leading-7 text-mist">Add as many colors as the piece carries.</p>
        ) : (
          <ul className="mt-8 max-h-[36rem] space-y-8 overflow-y-auto border-y border-ivory/10 py-6 pr-1">
            {colors.map((swatch) => (
              <li key={swatch.key} className="border-b border-ivory/10 pb-8 last:border-b-0 last:pb-0">
                <div className="grid items-end gap-4 md:grid-cols-[1fr_auto]">
                  <div>
                    <label className="block text-[10px] tracking-[0.28em] text-mist" htmlFor={`swatch-label-${swatch.key}`}>
                      NAME
                    </label>
                    <input
                      id={`swatch-label-${swatch.key}`}
                      value={swatch.label}
                      placeholder="IVORY"
                      onChange={(event) =>
                        patchColor(swatch.key, { label: event.target.value.toUpperCase() })
                      }
                      className={tight}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => dropColor(swatch.key)}
                    className="pb-2 text-left text-[10px] tracking-[0.28em] text-mist"
                  >
                    DROP
                  </button>
                </div>
                <p className="mt-6 text-[10px] tracking-[0.28em] text-mist">SAMPLE</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  {HOUSE_COLORS.map((sample) => (
                    <ColorChip
                      key={sample.label}
                      hex={sample.hex}
                      label={sample.label}
                      size="md"
                      selected={hexesMatch(swatch.hex, sample.hex)}
                      onClick={() => pickHouseColor(swatch.key, sample)}
                    />
                  ))}
                </div>
                <div className="mt-6">
                  <label className="block text-[10px] tracking-[0.28em] text-mist" htmlFor={`swatch-hex-${swatch.key}`}>
                    HEX — if it is not in the samples
                  </label>
                  <input
                    id={`swatch-hex-${swatch.key}`}
                    value={swatch.hex}
                    placeholder="#C9B89A"
                    onChange={(event) => patchColor(swatch.key, { hex: event.target.value })}
                    onBlur={() => {
                      const next = normalizeHex(swatch.hex);
                      if (next) patchColor(swatch.key, { hex: next });
                    }}
                    className={tight}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={addColor}
          className="mt-8 inline-flex items-center gap-3 text-[10px] tracking-[0.28em] text-ivory"
          data-cursor="VIEW"
        >
          ADD COLOR
          <span className="block h-px w-8 bg-ivory/70" />
        </button>
      </div>

      <fieldset className="mt-10">
        <legend className="text-[10px] tracking-[0.32em] text-mist">SIZE</legend>
        <p className="mt-3 text-sm leading-7 text-mist">Tick every size the shop should offer.</p>
        <div className="mt-6 flex flex-wrap gap-x-8 gap-y-5">
          {GARMENT_SIZES.map((option) => {
            const on = sizes.includes(option);
            return (
              <label
                key={option}
                className="flex cursor-pointer items-center gap-3 text-[11px] tracking-[0.22em] text-ivory"
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => toggleSize(option)}
                  className="sr-only"
                />
                <span
                  className={`flex h-3.5 w-3.5 shrink-0 border ${
                    on ? "border-ivory bg-ivory" : "border-ivory/40"
                  }`}
                  aria-hidden
                />
                {option}
              </label>
            );
          })}
        </div>
        <div className="mt-8 flex gap-8">
          <button
            type="button"
            onClick={() => setSizes([...GARMENT_SIZES])}
            className="text-[10px] tracking-[0.28em] text-mist"
          >
            ALL
          </button>
          <button
            type="button"
            onClick={() => setSizes([])}
            className="text-[10px] tracking-[0.28em] text-mist"
          >
            NONE
          </button>
        </div>
      </fieldset>

      <div className="mt-10">
        <p className="text-[10px] tracking-[0.32em] text-mist">
          ON HAND{onHand ? ` — ${String(onHand).padStart(2, "0")}` : ""}
        </p>
        <p className="mt-3 max-w-lg text-sm leading-7 text-mist">
          Each box is that color in that size. Empty is zero. A size with nothing
          on hand does not show in the shop. The piece is sold out only when every
          box is zero.
        </p>
        {namedColors.length === 0 || sizes.length === 0 ? (
          <p className="mt-8 text-sm leading-7 text-mist">Add a color and a size first.</p>
        ) : (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left">
              <thead>
                <tr className="border-b border-ivory/10">
                  <th className="py-3 pr-6 text-[10px] font-normal tracking-[0.28em] text-mist">COLOR</th>
                  {sizes.map((size) => (
                    <th
                      key={size}
                      className="px-2 py-3 text-center text-[10px] font-normal tracking-[0.28em] text-mist"
                    >
                      {size}
                    </th>
                  ))}
                  <th className="py-3 pl-4 text-right text-[10px] font-normal tracking-[0.28em] text-mist">
                    ALL
                  </th>
                </tr>
              </thead>
              <tbody>
                {namedColors.map((swatch) => {
                  const color = swatch.label.trim().toUpperCase();
                  const rowTotal = sizes.reduce(
                    (count, size) => count + (Number(stock[stockCellKey(color, size)]) || 0),
                    0
                  );
                  return (
                    <tr key={swatch.key} className="border-b border-ivory/10">
                      <td className="py-4 pr-6">
                        <span className="inline-flex items-center gap-3">
                          <span
                            className="h-3.5 w-3.5 shrink-0 border border-ivory/40"
                            style={{ backgroundColor: swatch.hex || "#111111" }}
                          />
                          <span className="text-[11px] tracking-[0.2em] text-ivory">{color}</span>
                        </span>
                      </td>
                      {sizes.map((size) => {
                        const key = stockCellKey(color, size);
                        const value = stock[key];
                        return (
                          <td key={size} className="px-2 py-4">
                            <input
                              type="number"
                              min="0"
                              step="1"
                              inputMode="numeric"
                              value={value === undefined ? "" : String(value)}
                              placeholder="0"
                              onChange={(event) => patchStock(color, size, event.target.value)}
                              className="w-full border-b border-ivory/20 bg-transparent pb-1 text-center text-sm tracking-[0.08em] text-ivory outline-none placeholder:text-stone/40"
                              aria-label={`${color} ${size}`}
                            />
                          </td>
                        );
                      })}
                      <td className="py-4 pl-4 text-right font-serif text-xl italic text-ivory">
                        {rowTotal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <label className={label} htmlFor="piece-copy">
        COPY
      </label>
      <textarea
        id="piece-copy"
        name="description"
        rows={4}
        defaultValue={product?.description}
        className={`${field} resize-none leading-7`}
      />

      <label className={label}>STILL</label>
      <p className="mt-4 text-sm tracking-[0.08em] text-ivory">{image}</p>
      <input type="hidden" name="image" value={image} />
      <label className="mt-6 inline-flex cursor-pointer items-center gap-3 text-[10px] tracking-[0.28em] text-ivory">
        PLACE A STILL
        <span className="block h-px w-8 bg-ivory/70" />
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void upload(file);
          }}
        />
      </label>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <label className={label} htmlFor="piece-fit">
            FIT
          </label>
          <HouseSelect
            id="piece-fit"
            name="imageFit"
            value={imageFit}
            onChange={(next) => setImageFit(next as "contain" | "cover")}
            options={[
              { value: "contain", label: "CONTAIN" },
              { value: "cover", label: "COVER" },
            ]}
          />
        </div>
        <div>
          <label className={label} htmlFor="piece-ground">
            GROUND
          </label>
          <input id="piece-ground" name="imageBg" defaultValue={product?.imageBg ?? "#cfc9c0"} className={field} />
        </div>
      </div>

      <label className="mt-10 flex items-center gap-4 text-[10px] tracking-[0.28em] text-mist">
        <input
          type="checkbox"
          checked={featured}
          onChange={(event) => setFeatured(event.target.checked)}
          className="h-4 w-4 accent-ivory"
        />
        OPENING LOOK — homepage
      </label>

      {error ? <p className="mt-8 text-sm leading-7 text-mist">{error}</p> : null}

      <div className="mt-14 flex flex-wrap items-center gap-10">
        <button
          type="submit"
          disabled={busy}
          className="inline-flex items-center gap-3 text-[10px] tracking-[0.28em] text-ivory disabled:text-mist"
          data-cursor="VIEW"
        >
          {busy ? "SAVING" : isEdit ? "SAVE PIECE" : "PUT ON THE RAIL"}
          <span className="block h-px w-8 bg-ivory/70" />
        </button>
        <button
          type="button"
          onClick={showPreview}
          className="text-[10px] tracking-[0.28em] text-ivory"
          data-cursor="VIEW"
        >
          SEE THE PIECE
        </button>
        <button
          type="button"
          onClick={() => router.push("/atelier/line")}
          className="text-[10px] tracking-[0.28em] text-mist"
        >
          BACK
        </button>
        {isEdit ? (
          <button
            type="button"
            onClick={pull}
            disabled={busy}
            className="text-[10px] tracking-[0.28em] text-mist"
          >
            PULL FROM THE LINE
          </button>
        ) : null}
      </div>
    </form>
    {preview ? (
      <div className="fixed inset-0 z-[80] flex flex-col bg-void-0">
        <div className="flex shrink-0 items-center justify-between border-b border-ivory/10 bg-void-0 px-5 py-4 md:px-10">
          <p className="text-[10px] tracking-[0.32em] text-mist">HOW IT LOOKS IN THE SHOP</p>
          <button
            type="button"
            onClick={() => setPreview(null)}
            className="text-[10px] tracking-[0.28em] text-ivory"
            data-cursor="VIEW"
          >
            CLOSE
          </button>
        </div>
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          data-lenis-prevent
        >
          <ProductCard
            key={[
              preview.name,
              preview.image,
              preview.colors.map((swatch) => `${swatch.label}:${swatch.hex}`).join("|"),
              (preview.sizes ?? []).join("|"),
              (preview.stock ?? []).map((cell) => `${cell.color}:${cell.size}:${cell.count}`).join("|"),
            ].join("::")}
            product={preview}
            preview
          />
        </div>
      </div>
    ) : null}
    </>
  );
};
