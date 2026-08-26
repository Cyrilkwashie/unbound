"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { ProductPhoto } from "@/components/ProductPhoto";

export type HouseOption = {
  value: string;
  label: string;
  hint?: string;
  image?: string;
  imageFit?: "contain" | "cover";
  imageBg?: string;
  swatch?: string;
};

type HouseSelectProps = {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  options: HouseOption[];
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  allowCreate?: boolean;
  createLabel?: (query: string) => string;
};

const Still = ({ option, large = false }: { option: HouseOption; large?: boolean }) => {
  if (!option.image) return null;
  const box = large ? "h-16 w-12" : "h-12 w-9";
  return (
    <span className={`block shrink-0 overflow-hidden ${box}`} style={{ backgroundColor: option.imageBg || "#111" }}>
      <ProductPhoto
        src={option.image}
        alt=""
        className={`h-full w-full object-center ${
          option.imageFit === "cover" ? "object-cover" : "object-contain p-0.5"
        }`}
      />
    </span>
  );
};

const Mark = ({ option }: { option: HouseOption }) => (
  <span className="flex min-w-0 items-center gap-3">
    {option.swatch ? (
      <span className="relative h-3.5 w-3.5 shrink-0 border border-ivory/40" style={{ backgroundColor: option.swatch }} />
    ) : null}
    <span className="min-w-0">
      {option.hint ? (
        <span className="mb-1 block text-[10px] tracking-[0.28em] text-mist">{option.hint}</span>
      ) : null}
      <span className="block truncate font-display text-sm tracking-[0.12em] text-ivory">{option.label}</span>
    </span>
  </span>
);

export const HouseSelect = ({
  id,
  name,
  value,
  onChange,
  options,
  placeholder = "—",
  disabled = false,
  searchable = false,
  allowCreate = false,
  createLabel = (query) => `WRITE ${query} ON THE LIST`,
}: HouseSelectProps) => {
  const listId = useId();
  const root = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const fromList = options.find((option) => option.value === value);
  const selected = fromList ?? (value ? { value, label: value } : undefined);
  const pictured = options.some((option) => option.image);
  const needle = query.trim().toLowerCase();
  const filtered = needle
    ? options.filter(
        (option) =>
          option.label.toLowerCase().includes(needle) ||
          option.hint?.toLowerCase().includes(needle) ||
          option.value.toLowerCase().includes(needle)
      )
    : options;
  const exact = options.some(
    (option) => option.label.toLowerCase() === needle || option.value.toLowerCase() === needle
  );
  const canCreate = allowCreate && Boolean(query.trim()) && !exact;

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
    if (!open) setQuery("");
  }, [open, searchable]);

  const pick = (next: string) => {
    onChange(next);
    setOpen(false);
    setQuery("");
  };

  const create = () => {
    if (!canCreate) return;
    pick(query.trim());
  };

  const onTriggerKey = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(true);
    }
  };

  return (
    <div ref={root} className="relative mt-4">
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        id={id}
        type="button"
        disabled={disabled || (options.length === 0 && !allowCreate)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onTriggerKey}
        className="flex w-full items-center gap-4 border-b border-ivory/20 pb-3 text-left outline-none disabled:text-mist"
        data-cursor="VIEW"
      >
        {selected?.image ? <Still option={selected} large /> : null}
        <span className="min-w-0 flex-1">
          {selected ? (
            <Mark option={selected} />
          ) : (
            <span className="font-display text-sm tracking-[0.12em] text-mist">{placeholder}</span>
          )}
        </span>
        <span className="shrink-0 text-[10px] tracking-[0.28em] text-mist">{open ? "CLOSE" : "CHOOSE"}</span>
      </button>

      {open ? (
        <div
          className={`absolute left-0 right-0 z-30 mt-px border border-ivory/10 bg-void-1 ${
            pictured ? "max-h-[28rem]" : "max-h-72"
          } overflow-y-auto`}
        >
          {searchable ? (
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  if (filtered[0]) pick(filtered[0].value);
                  else create();
                }
              }}
              placeholder="A NAME"
              className="w-full border-b border-ivory/10 bg-transparent px-3 py-3 text-sm tracking-[0.12em] text-ivory outline-none placeholder:text-stone"
            />
          ) : null}
          <ul id={listId} role="listbox">
            {filtered.map((option) => {
              const active = option.value === value;
              return (
                <li key={option.value} role="option" aria-selected={active}>
                  <button
                    type="button"
                    onClick={() => pick(option.value)}
                    className={`flex w-full items-center gap-4 border-b border-ivory/10 px-3 text-left last:border-b-0 hover:bg-ivory/[0.04] ${
                      pictured ? "py-3" : "py-3.5"
                    } ${active ? "bg-ivory/[0.06]" : ""}`}
                    data-cursor="VIEW"
                  >
                    {option.image ? <Still option={option} large /> : null}
                    <span className="min-w-0 flex-1">
                      <Mark option={option} />
                    </span>
                    {active ? (
                      <span className="shrink-0 text-[10px] tracking-[0.28em] text-ivory">ON</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
            {filtered.length === 0 && !canCreate ? (
              <li className="px-3 py-4 font-serif text-lg italic text-ivory/50">No name like that.</li>
            ) : null}
            {canCreate ? (
              <li>
                <button
                  type="button"
                  onClick={create}
                  className="flex w-full items-center justify-between gap-4 px-3 py-3.5 text-left hover:bg-ivory/[0.04]"
                  data-cursor="VIEW"
                >
                  <span className="font-display text-sm tracking-[0.12em] text-ivory">
                    {createLabel(query.trim())}
                  </span>
                  <span className="shrink-0 text-[10px] tracking-[0.28em] text-mist">NEW</span>
                </button>
              </li>
            ) : null}
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export const pieceOptions = (
  products: { id: string; look: string; name: string; image: string; imageFit: "contain" | "cover"; imageBg: string }[]
): HouseOption[] =>
  products.map((product) => ({
    value: product.id,
    label: product.name,
    hint: product.look,
    image: product.image,
    imageFit: product.imageFit,
    imageBg: product.imageBg,
  }));
