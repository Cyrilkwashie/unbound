"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import { GARMENT_SIZES, type CatalogProduct, type GarmentSize } from "@/lib/products";

const field =
  "mt-4 w-full border-b border-ivory/20 bg-transparent pb-3 text-sm tracking-[0.08em] text-ivory outline-none";
const label = "mt-10 block text-[10px] tracking-[0.32em] text-mist first:mt-0";

type Swatch = { label: string; hex: string };

const defaultSwatches = (product?: CatalogProduct): Swatch[] => {
  if (product?.colors?.length) return product.colors.map((swatch) => ({ ...swatch }));
  return [{ label: product?.color ?? "BLACK", hex: "#111111" }];
};

const defaultSizes = (product?: CatalogProduct): GarmentSize[] =>
  product?.sizes?.length ? [...product.sizes] : [...GARMENT_SIZES];

type LineFormProps = {
  product?: CatalogProduct;
  featured: boolean;
};

export const LineForm = ({ product, featured: startedFeatured }: LineFormProps) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [featured, setFeatured] = useState(startedFeatured);
  const [image, setImage] = useState(product?.image ?? "/baggy top.jpg");
  const [colors, setColors] = useState<Swatch[]>(() => defaultSwatches(product));
  const [sizes, setSizes] = useState<GarmentSize[]>(() => defaultSizes(product));
  const isEdit = Boolean(product);
  const colorLine = colors
    .map((swatch) => swatch.label.trim())
    .filter(Boolean)
    .join(" / ")
    .toUpperCase();

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
        label: swatch.label.trim(),
        hex: swatch.hex.trim() || "#111111",
      }))
      .filter((swatch) => swatch.label);
    if (palette.length === 0) {
      setError("Add at least one color.");
      return;
    }
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
      setError(body?.error ?? "The piece could not be cut.");
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

  return (
    <form className="max-w-xl" onSubmit={submit}>
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
          <select
            id="piece-category"
            name="category"
            defaultValue={product?.category ?? "tops"}
            className={`${field} appearance-none`}
          >
            <option value="tops">TOPS</option>
            <option value="bottoms">BOTTOMS</option>
            <option value="outer">OUTER</option>
          </select>
        </div>
        <div>
          <label className={label} htmlFor="piece-status">
            RAIL
          </label>
          <select
            id="piece-status"
            name="status"
            defaultValue={product?.status ?? "available"}
            className={`${field} appearance-none`}
          >
            <option value="available">ON THE RAIL</option>
            <option value="forthcoming">FORTHCOMING</option>
          </select>
        </div>
      </div>

      <div className="mt-10">
        <p className="text-[10px] tracking-[0.32em] text-mist">COLOR — {colorLine || "—"}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {colors.map((swatch, index) => (
            <div
              key={`${swatch.label}-${index}`}
              className="h-5 w-5 border border-ivory/40"
              style={{ backgroundColor: swatch.hex || "#111111" }}
              title={swatch.label}
            />
          ))}
        </div>
        <ul className="mt-8 space-y-6">
          {colors.map((swatch, index) => (
            <li key={index} className="grid items-end gap-4 md:grid-cols-[auto_1fr_1fr_auto]">
              <label className="relative block h-10 w-10 shrink-0 border border-ivory/30">
                <span
                  className="absolute inset-0"
                  style={{ backgroundColor: swatch.hex || "#111111" }}
                />
                <input
                  type="color"
                  value={/^#[0-9a-fA-F]{6}$/.test(swatch.hex) ? swatch.hex : "#111111"}
                  onChange={(event) =>
                    setColors((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, hex: event.target.value } : item
                      )
                    )
                  }
                  className="absolute inset-0 cursor-pointer opacity-0"
                  aria-label={`Swatch ${index + 1} hex`}
                />
              </label>
              <div>
                <label className="block text-[10px] tracking-[0.28em] text-mist" htmlFor={`swatch-label-${index}`}>
                  NAME
                </label>
                <input
                  id={`swatch-label-${index}`}
                  value={swatch.label}
                  onChange={(event) =>
                    setColors((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, label: event.target.value.toUpperCase() } : item
                      )
                    )
                  }
                  className={field}
                />
              </div>
              <div>
                <label className="block text-[10px] tracking-[0.28em] text-mist" htmlFor={`swatch-hex-${index}`}>
                  HEX
                </label>
                <input
                  id={`swatch-hex-${index}`}
                  value={swatch.hex}
                  onChange={(event) =>
                    setColors((current) =>
                      current.map((item, i) =>
                        i === index ? { ...item, hex: event.target.value } : item
                      )
                    )
                  }
                  className={field}
                />
              </div>
              {colors.length > 1 ? (
                <button
                  type="button"
                  onClick={() => setColors((current) => current.filter((_, i) => i !== index))}
                  className="pb-3 text-[10px] tracking-[0.28em] text-mist"
                >
                  DROP
                </button>
              ) : (
                <span />
              )}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setColors((current) => [...current, { label: "BLACK", hex: "#111111" }])}
          className="mt-8 text-[10px] tracking-[0.28em] text-ivory"
        >
          ADD COLOR
        </button>
      </div>

      <fieldset className="mt-10">
        <legend className="text-[10px] tracking-[0.32em] text-mist">SIZE</legend>
        <p className="mt-3 text-sm leading-7 text-mist">
          These are the sizes shown on the piece. Leave a size off to hide it from the shop.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {GARMENT_SIZES.map((option) => {
            const on = sizes.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() =>
                  setSizes((current) =>
                    current.includes(option)
                      ? current.filter((item) => item !== option)
                      : GARMENT_SIZES.filter((size) => current.includes(size) || size === option)
                  )
                }
                className={`min-w-12 border px-3 py-2 text-[11px] tracking-[0.18em] transition-colors duration-500 ${
                  on
                    ? "border-ivory bg-ivory text-void-0"
                    : "border-ivory/20 text-ivory hover:border-ivory/60"
                }`}
                data-cursor="VIEW"
                aria-pressed={on}
              >
                {option}
              </button>
            );
          })}
        </div>
      </fieldset>

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
          <select
            id="piece-fit"
            name="imageFit"
            defaultValue={product?.imageFit ?? "contain"}
            className={`${field} appearance-none`}
          >
            <option value="contain">CONTAIN</option>
            <option value="cover">COVER</option>
          </select>
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
          {busy ? "SAVING" : isEdit ? "SAVE PIECE" : "CUT PIECE"}
          <span className="block h-px w-8 bg-ivory/70" />
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
  );
};
