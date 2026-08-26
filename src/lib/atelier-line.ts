import {
  slugify,
  swatchesFromColor,
  ensureStock,
  isGarmentSize,
  type CatalogProduct,
  type GarmentSize,
  type ProductCategory,
} from "@/lib/products";

const CATEGORIES: ProductCategory[] = ["tops", "bottoms", "outer"];

export type LinePayload = {
  id?: string;
  name?: string;
  look?: string;
  kicker?: string;
  category?: string;
  price?: number | string;
  color?: string;
  description?: string;
  image?: string;
  imageFit?: string;
  imageBg?: string;
  status?: string;
  featured?: boolean;
  colors?: { label?: string; hex?: string }[];
  sizes?: string[];
  stock?: { color?: string; size?: string; count?: number | string }[] | null;
};

export const productFromPayload = (
  body: LinePayload,
  options: { id?: string; look?: string }
): CatalogProduct | { error: string } => {
  const name = body.name?.trim().toUpperCase() ?? "";
  if (!name) return { error: "A piece needs a name." };

  const category = CATEGORIES.includes(body.category as ProductCategory)
    ? (body.category as ProductCategory)
    : null;
  if (!category) return { error: "Choose tops, bottoms, or outer." };

  const price = Number(body.price);
  if (!Number.isFinite(price) || price < 0) return { error: "Price must be a number." };

  const look = (body.look?.trim() || options.look || "01").padStart(2, "0").slice(-2);
  const colors = (body.colors ?? [])
    .map((swatch) => ({
      label: (swatch.label ?? "").trim() || "BLACK",
      hex: /^#?[0-9a-fA-F]{6}$/.test((swatch.hex ?? "").trim())
        ? (swatch.hex ?? "").trim().startsWith("#")
          ? (swatch.hex ?? "").trim()
          : `#${(swatch.hex ?? "").trim()}`
        : "#111111",
    }))
    .filter((swatch) => swatch.label);
  const palette = colors.length > 0 ? colors : swatchesFromColor(body.color ?? "BLACK");
  const color =
    body.color?.trim().toUpperCase() || palette.map((swatch) => swatch.label).join(" / ").toUpperCase();
  const sizes = (body.sizes ?? []).filter(isGarmentSize);
  const kicker =
    body.kicker?.trim().toUpperCase() || `GARMENT ${look} / ${category.toUpperCase()}`;
  const image = body.image?.trim() || "/shop/split-crew.png";
  const imageFit = body.imageFit === "cover" ? "cover" : "contain";
  const imageBg = body.imageBg?.trim() || (category === "bottoms" ? "#eceae4" : "#cfc9c0");
  const status = body.status === "forthcoming" ? "forthcoming" : "available";

  if (sizes.length === 0) return { error: "Choose at least one size." };

  const names = new Set(palette.map((swatch) => swatch.label.trim().toUpperCase()));
  const incoming =
    body.stock == null
      ? undefined
      : body.stock
          .map((cell) => {
            const color = (cell.color ?? "").trim().toUpperCase();
            const size = (cell.size ?? "").trim().toUpperCase();
            const count = Math.max(0, Math.floor(Number(cell.count) || 0));
            if (!names.has(color) || !isGarmentSize(size) || !sizes.includes(size)) return null;
            return { color, size, count };
          })
          .filter((cell): cell is { color: string; size: GarmentSize; count: number } => Boolean(cell));
  const stock = ensureStock(palette, sizes as GarmentSize[], incoming);

  return {
    id: options.id || slugify(name),
    look,
    name,
    kicker,
    category,
    price,
    color,
    colors: palette,
    sizes: sizes as GarmentSize[],
    stock,
    description: body.description?.trim() || "",
    image,
    imageFit,
    imageBg,
    status,
  };
};
