import {
  slugify,
  swatchesFromColor,
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
  const image = body.image?.trim() || "/baggy top.jpg";
  const imageFit = body.imageFit === "cover" ? "cover" : "contain";
  const imageBg = body.imageBg?.trim() || (category === "bottoms" ? "#eceae4" : "#cfc9c0");
  const status = body.status === "forthcoming" ? "forthcoming" : "available";

  if (sizes.length === 0) return { error: "Choose at least one size." };

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
    description: body.description?.trim() || "",
    image,
    imageFit,
    imageBg,
    status,
  };
};
