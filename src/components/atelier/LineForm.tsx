"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import type { CatalogProduct } from "@/lib/products";

const field =
  "mt-4 w-full border-b border-ivory/20 bg-transparent pb-3 text-sm tracking-[0.08em] text-ivory outline-none";
const label = "mt-10 block text-[10px] tracking-[0.32em] text-mist first:mt-0";

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
  const isEdit = Boolean(product);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      id: product?.id,
      name: String(form.get("name") ?? ""),
      look: String(form.get("look") ?? ""),
      kicker: String(form.get("kicker") ?? ""),
      category: String(form.get("category") ?? ""),
      price: String(form.get("price") ?? ""),
      color: String(form.get("color") ?? ""),
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

      <label className={label} htmlFor="piece-color">
        COLOR
      </label>
      <input id="piece-color" name="color" defaultValue={product?.color ?? "BLACK"} className={field} />

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
