/**
 * UNBOUND shop types and helpers.
 * The live line lives in data/line.json and is written from the atelier.
 */

export const PRODUCT_IMAGES = {
  baggyTop: "/baggy top.jpg",
  cargo: "/baggy cargo.jpg",
} as const;

export const productSrc = (path: string) => encodeURI(path);

export const SHOP_CATEGORIES = [
  { id: "all", label: "ALL" },
  { id: "tops", label: "TOPS" },
  { id: "bottoms", label: "BOTTOMS" },
  { id: "outer", label: "OUTER" },
] as const;

export type ShopCategory = (typeof SHOP_CATEGORIES)[number]["id"];
export type ProductCategory = Exclude<ShopCategory, "all">;

export const GARMENT_SIZES = ["XS", "S", "M", "L", "XL"] as const;
export type GarmentSize = (typeof GARMENT_SIZES)[number];

export type StockCell = {
  color: string;
  size: GarmentSize;
  count: number;
};

export type CatalogProduct = {
  id: string;
  look: string;
  name: string;
  kicker: string;
  category: ProductCategory;
  price: number;
  color: string;
  colors: { label: string; hex: string }[];
  sizes?: GarmentSize[];
  stock?: StockCell[];
  description: string;
  image: string;
  imageFit: "contain" | "cover";
  imageBg: string;
  status: "available" | "forthcoming";
};

export const isGarmentSize = (value: string): value is GarmentSize =>
  (GARMENT_SIZES as readonly string[]).includes(value);

export const stockCellKey = (color: string, size: GarmentSize) =>
  `${color.trim().toUpperCase()}::${size}`;

export const DEFAULT_ON_HAND = 5;

export const tracksStock = (product: Pick<CatalogProduct, "stock">) => Array.isArray(product.stock);

export const stockCount = (
  product: Pick<CatalogProduct, "stock">,
  color: string,
  size: GarmentSize
): number | null => {
  if (!product.stock) return null;
  const mark = color.trim().toUpperCase();
  const cell = product.stock.find((item) => item.color.toUpperCase() === mark && item.size === size);
  return cell?.count ?? 0;
};

export const stockTotal = (product: Pick<CatalogProduct, "stock">): number | null => {
  if (!product.stock) return null;
  return product.stock.reduce((sum, cell) => sum + Math.max(0, cell.count), 0);
};

export const isSoldOut = (product: Pick<CatalogProduct, "stock">) =>
  stockTotal(product) === 0;

export const ensureStock = (
  colors: { label: string }[],
  sizes: GarmentSize[],
  stock?: StockCell[]
): StockCell[] => {
  const map = new Map<string, number>();
  for (const cell of stock ?? []) {
    if (!isGarmentSize(cell.size)) continue;
    map.set(
      stockCellKey(cell.color, cell.size),
      Math.max(0, Math.floor(Number(cell.count) || 0))
    );
  }
  const fallback = stock && stock.length > 0 ? 0 : DEFAULT_ON_HAND;
  const cells: StockCell[] = [];
  for (const swatch of colors) {
    const color = swatch.label.trim().toUpperCase();
    if (!color) continue;
    for (const size of sizes) {
      const key = stockCellKey(color, size);
      cells.push({ color, size, count: map.has(key) ? (map.get(key) as number) : fallback });
    }
  }
  return cells;
};

export const inStockSizes = (
  product: Pick<CatalogProduct, "sizes" | "stock">,
  color: string
): GarmentSize[] => {
  const sizes = product.sizes?.length ? product.sizes : [...GARMENT_SIZES];
  if (!product.stock) return sizes;
  return sizes.filter((size) => (stockCount(product, color, size) ?? 0) > 0);
};

export const inStockColors = (product: Pick<CatalogProduct, "colors" | "sizes" | "stock">) => {
  if (!product.stock) return product.colors;
  return product.colors.filter((swatch) => inStockSizes(product, swatch.label).length > 0);
};

export const takeStock = (
  product: CatalogProduct,
  color: string,
  size: GarmentSize,
  qty = 1
): CatalogProduct | { error: string } => {
  if (!product.stock) return product;
  const mark = color.trim().toUpperCase();
  const next = product.stock.map((cell) => ({ ...cell }));
  const index = next.findIndex((cell) => cell.color.toUpperCase() === mark && cell.size === size);
  if (index < 0 || next[index].count < qty) return { error: "None left in that mark." };
  next[index] = { ...next[index], count: next[index].count - qty };
  return { ...product, stock: next };
};

const readStock = (
  stock: StockCell[] | undefined,
  colors: { label: string }[],
  sizes: GarmentSize[]
): StockCell[] => ensureStock(colors, sizes, stock);

export const HOUSE_COLORS = [
  { label: "BLACK", hex: "#111111" },
  { label: "WHITE", hex: "#F4F1EA" },
  { label: "IVORY", hex: "#EDE6D9" },
  { label: "GREY", hex: "#6E6E6E" },
  { label: "STONE", hex: "#9A9488" },
  { label: "NAVY", hex: "#1C2433" },
  { label: "OLIVE", hex: "#3A4332" },
  { label: "BROWN", hex: "#3B2D24" },
  { label: "BURGUNDY", hex: "#4A242C" },
  { label: "SAND", hex: "#C9B89A" },
] as const;

export const normalizeHex = (value: string) => {
  const raw = value.trim();
  if (!raw) return "";
  const withHash = raw.startsWith("#") ? raw : `#${raw}`;
  if (/^#[0-9a-fA-F]{6}$/.test(withHash)) return withHash.toUpperCase();
  if (/^#[0-9a-fA-F]{3}$/.test(withHash)) {
    const r = withHash[1];
    const g = withHash[2];
    const b = withHash[3];
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return withHash.toUpperCase();
};

export const hexesMatch = (a: string, b: string) => {
  const left = normalizeHex(a);
  const right = normalizeHex(b);
  return Boolean(left) && left === right;
};

const SWATCH_HEX: Record<string, string> = Object.fromEntries(
  HOUSE_COLORS.map((swatch) => [swatch.label, swatch.hex])
);

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || `piece-${Date.now()}`;

export const nextLook = (products: CatalogProduct[]) => {
  const highest = Math.max(0, ...products.map((item) => Number.parseInt(item.look, 10) || 0));
  return String(highest + 1).padStart(2, "0");
};

export const swatchesFromColor = (color: string) => {
  const parts = color
    .split("/")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return [{ label: "Black", hex: "#111111" }];
  return parts.map((label) => ({
    label,
    hex: SWATCH_HEX[label.toUpperCase()] ?? "#111111",
  }));
};

export const availableFrom = (products: CatalogProduct[]) =>
  products.filter((product) => product.status === "available");

export const getFrom = (products: CatalogProduct[], id: string) =>
  products.find((product) => product.id === id);

export const productsInCategoryFrom = (products: CatalogProduct[], category: ShopCategory) => {
  const pieces = availableFrom(products);
  if (category === "all") return pieces;
  return pieces.filter((product) => product.category === category);
};

export const featuredFrom = (products: CatalogProduct[], featuredIds: string[]) => {
  const picked = featuredIds
    .map((id) => getFrom(products, id))
    .filter((product): product is CatalogProduct =>
      Boolean(product) && product?.status === "available"
    );
  if (picked.length >= 1) return picked.slice(0, 2);
  return availableFrom(products).slice(0, 2);
};

export const normalizeProduct = (product: CatalogProduct): CatalogProduct => {
  const sizes = (product.sizes ?? []).filter(isGarmentSize);
  const colors = product.colors?.length ? product.colors : swatchesFromColor(product.color);
  const normalizedSizes = sizes.length > 0 ? sizes : [...GARMENT_SIZES];
  return {
    ...product,
    sizes: normalizedSizes,
    colors,
    color: product.color?.trim() || colors.map((swatch) => swatch.label).join(" / ").toUpperCase() || "BLACK",
    stock: readStock(product.stock, colors, normalizedSizes),
  };
};

const SWATCH_BLACK = [{ label: "Black", hex: "#111111" }];
const SWATCH_LAYERED = [
  { label: "Black", hex: "#111111" },
  { label: "White", hex: "#F4F1EA" },
];

export const SEED_CATALOG: CatalogProduct[] = [
  {
    id: "darkness-baggy-top",
    look: "01",
    name: "DARKNESS BAGGY TOP",
    kicker: "GARMENT 01 / BAGGY TOP",
    category: "tops",
    price: 165,
    color: "BLACK / WHITE",
    colors: SWATCH_LAYERED,
    description:
      "Oversized layered tee — black over white. Thorn graphic across the chest, sleeve marks down the arms. Drapes rather than fits in.",
    image: PRODUCT_IMAGES.baggyTop,
    imageFit: "contain",
    imageBg: "#cfc9c0",
    status: "available",
  },
  {
    id: "baggy-cargo",
    look: "02",
    name: "BAGGY CARGO",
    kicker: "GARMENT 02 / TROUSER",
    category: "bottoms",
    price: 195,
    color: "BLACK",
    colors: SWATCH_BLACK,
    description:
      "Architectural pockets. Relaxed fall. Gothic cross marks down the leg. Travels with the body, not against it.",
    image: PRODUCT_IMAGES.cargo,
    imageFit: "cover",
    imageBg: "#eceae4",
    status: "available",
  },
  {
    id: "thorn-layer-tee",
    look: "03",
    name: "THORN LAYER TEE",
    kicker: "GARMENT 03 / TEE",
    category: "tops",
    price: 145,
    color: "BLACK / WHITE",
    colors: SWATCH_LAYERED,
    description:
      "The lighter layer of the system. Same thorn mark, shorter drape, worn under outer pieces.",
    image: PRODUCT_IMAGES.baggyTop,
    imageFit: "contain",
    imageBg: "#cfc9c0",
    status: "available",
  },
  {
    id: "cross-cargo-wide",
    look: "04",
    name: "CROSS CARGO WIDE",
    kicker: "GARMENT 04 / TROUSER",
    category: "bottoms",
    price: 210,
    color: "BLACK",
    colors: SWATCH_BLACK,
    description:
      "A wider fall of the cargo. Extra volume through the thigh, same pocket architecture, same cross marks.",
    image: PRODUCT_IMAGES.cargo,
    imageFit: "cover",
    imageBg: "#eceae4",
    status: "available",
  },
  {
    id: "motion-shell",
    look: "05",
    name: "MOTION SHELL",
    kicker: "GARMENT 05 / OUTER",
    category: "outer",
    price: 245,
    color: "BLACK / WHITE",
    colors: SWATCH_LAYERED,
    description:
      "A shell for movement. Layered, open through the body, worn over the baggy top.",
    image: PRODUCT_IMAGES.baggyTop,
    imageFit: "contain",
    imageBg: "#cfc9c0",
    status: "available",
  },
  {
    id: "sigil-longsleeve",
    look: "06",
    name: "SIGIL LONGSLEEVE",
    kicker: "GARMENT 06 / LONGSLEEVE",
    category: "tops",
    price: 175,
    color: "BLACK / WHITE",
    colors: SWATCH_LAYERED,
    description:
      "Long sleeve with forearm marks. Heavyweight cotton, dropped shoulder, the graphic held close to the dark.",
    image: PRODUCT_IMAGES.baggyTop,
    imageFit: "contain",
    imageBg: "#cfc9c0",
    status: "available",
  },
  {
    id: "relaxed-trouser",
    look: "07",
    name: "RELAXED TROUSER",
    kicker: "GARMENT 07 / TROUSER",
    category: "bottoms",
    price: 185,
    color: "BLACK",
    colors: SWATCH_BLACK,
    description:
      "The cargo without the shout. Cleaner face, same relaxed fall, still travels with the body.",
    image: PRODUCT_IMAGES.cargo,
    imageFit: "cover",
    imageBg: "#eceae4",
    status: "available",
  },
  {
    id: "void-overshirt",
    look: "08",
    name: "VOID OVERSHIRT",
    kicker: "GARMENT 08 / OUTER",
    category: "outer",
    price: 220,
    color: "BLACK / WHITE",
    colors: SWATCH_LAYERED,
    description:
      "Shirt weight, jacket attitude. Worn open over the tee or closed as the outer layer.",
    image: PRODUCT_IMAGES.baggyTop,
    imageFit: "contain",
    imageBg: "#cfc9c0",
    status: "available",
  },
  {
    id: "graphic-tee-02",
    look: "09",
    name: "GRAPHIC TEE 02",
    kicker: "GARMENT 09 / TEE",
    category: "tops",
    price: 135,
    color: "BLACK / WHITE",
    colors: SWATCH_LAYERED,
    description:
      "Second graphic in the line. Oversized, heavyweight, printed to sit in the dark rather than shout from it.",
    image: PRODUCT_IMAGES.baggyTop,
    imageFit: "contain",
    imageBg: "#cfc9c0",
    status: "available",
  },
  {
    id: "utility-pant",
    look: "10",
    name: "UTILITY PANT",
    kicker: "GARMENT 10 / PANT",
    category: "bottoms",
    price: 205,
    color: "BLACK",
    colors: SWATCH_BLACK,
    description:
      "Utility without costume. Pocket stack, wide leg, a work pant for the street.",
    image: PRODUCT_IMAGES.cargo,
    imageFit: "cover",
    imageBg: "#eceae4",
    status: "available",
  },
];

export const SEED_FEATURED_IDS = ["darkness-baggy-top", "baggy-cargo"];
