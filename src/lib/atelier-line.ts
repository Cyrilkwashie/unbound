import {
  slugify,
  swatchesFromColor,
  type CatalogProduct,
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
  const color = body.color?.trim().toUpperCase() || "BLACK";
  const kicker =
    body.kicker?.trim().toUpperCase() || `GARMENT ${look} / ${category.toUpperCase()}`;
  const image = body.image?.trim() || "/baggy top.jpg";
  const imageFit = body.imageFit === "cover" ? "cover" : "contain";
  const imageBg = body.imageBg?.trim() || (category === "bottoms" ? "#eceae4" : "#cfc9c0");
  const status = body.status === "forthcoming" ? "forthcoming" : "available";

  return {
    id: options.id || slugify(name),
    look,
    name,
    kicker,
    category,
    price,
    color,
    colors: swatchesFromColor(color),
    description: body.description?.trim() || "",
    image,
    imageFit,
    imageBg,
    status,
  };
};
