/**
 * UNBOUND shop types and helpers.
 * The live line lives in data/line.json and is written from the atelier.
 */

export const PRODUCT_IMAGES = {
  splitCrew: "/shop/split-crew.png",
  letterCrew: "/shop/letter-crew.png",
  angelPant: "/shop/angel-pant.png",
  gratefulPant: "/shop/grateful-pant.png",
  layerLongsleeve: "/shop/layer-longsleeve.png",
  cityCrew: "/shop/city-crew.png",
  neverAlonePant: "/shop/never-alone-pant.png",
  flameCrew: "/shop/flame-crew.png",
  spiderPant: "/shop/spider-pant.png",
  webPant: "/shop/web-pant.png",
  house: "/shop/house.png",
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

const SWATCH_BLACK = [{ label: "BLACK", hex: "#111111" }];
const SWATCH_WHITE = [{ label: "WHITE", hex: "#F4F1EA" }];
const SWATCH_GREY = [{ label: "GREY", hex: "#6E6E6E" }];
const SWATCH_LAYERED = [
  { label: "BLACK", hex: "#111111" },
  { label: "WHITE", hex: "#F4F1EA" },
];
const SWATCH_LETTER = [
  { label: "OLIVE", hex: "#3A4332" },
  { label: "SAND", hex: "#C9B89A" },
];

const onHand = (swatches: { label: string }[], count = 5): StockCell[] =>
  swatches.flatMap((swatch) =>
    GARMENT_SIZES.map((size) => ({
      color: swatch.label.toUpperCase(),
      size,
      count,
    }))
  );

export const SEED_CATALOG: CatalogProduct[] = [
  {
    id: "split-crew",
    look: "01",
    name: "SPLIT CREW",
    kicker: "GARMENT 01 / CREW",
    category: "tops",
    price: 165,
    color: "BLACK / WHITE",
    colors: SWATCH_LAYERED,
    sizes: [...GARMENT_SIZES],
    stock: onHand(SWATCH_LAYERED),
    description:
      "A crew that splits the body — black into white, diagonal, oversized. Hangs off the shoulder rather than sitting on it.",
    image: PRODUCT_IMAGES.splitCrew,
    imageFit: "contain",
    imageBg: "#eceae4",
    status: "available",
  },
  {
    id: "letter-crew",
    look: "02",
    name: "LETTER CREW",
    kicker: "GARMENT 02 / CREW",
    category: "tops",
    price: 175,
    color: "OLIVE / SAND",
    colors: SWATCH_LETTER,
    sizes: [...GARMENT_SIZES],
    stock: onHand(SWATCH_LETTER),
    description:
      "Layered crew, short sleeve over long. Heavy, baggy, the mark held on the chest.",
    image: PRODUCT_IMAGES.letterCrew,
    imageFit: "contain",
    imageBg: "#e8e4dc",
    status: "available",
  },
  {
    id: "angel-pant",
    look: "03",
    name: "ANGEL PANT",
    kicker: "GARMENT 03 / PANT",
    category: "bottoms",
    price: 195,
    color: "BLACK",
    colors: SWATCH_BLACK,
    sizes: [...GARMENT_SIZES],
    stock: onHand(SWATCH_BLACK),
    description:
      "Baggy black sweatpant. Wings across the hip, crosses down the leg. Pools at the shoe.",
    image: PRODUCT_IMAGES.angelPant,
    imageFit: "cover",
    imageBg: "#111111",
    status: "available",
  },
  {
    id: "grateful-pant",
    look: "04",
    name: "GRATEFUL PANT",
    kicker: "GARMENT 04 / PANT",
    category: "bottoms",
    price: 185,
    color: "GREY",
    colors: SWATCH_GREY,
    sizes: [...GARMENT_SIZES],
    stock: onHand(SWATCH_GREY),
    description:
      "Heather grey, wide through the leg. Script down the side. Worn loose, stacked at the ankle.",
    image: PRODUCT_IMAGES.gratefulPant,
    imageFit: "cover",
    imageBg: "#cfc9c0",
    status: "available",
  },
  {
    id: "layer-longsleeve",
    look: "05",
    name: "LAYER LONGSLEEVE",
    kicker: "GARMENT 05 / LONGSLEEVE",
    category: "tops",
    price: 145,
    color: "BLACK / WHITE",
    colors: SWATCH_LAYERED,
    sizes: [...GARMENT_SIZES],
    stock: onHand(SWATCH_LAYERED),
    description:
      "Black short over white long. Marks on the chest and down the arms. Baggy through the body.",
    image: PRODUCT_IMAGES.layerLongsleeve,
    imageFit: "contain",
    imageBg: "#c8c4bc",
    status: "available",
  },
  {
    id: "city-crew",
    look: "06",
    name: "CITY CREW",
    kicker: "GARMENT 06 / CREW",
    category: "tops",
    price: 155,
    color: "WHITE",
    colors: SWATCH_WHITE,
    sizes: [...GARMENT_SIZES],
    stock: onHand(SWATCH_WHITE),
    description:
      "White crew, heavyweight, dropped shoulder. A small mark on the chest. Clean hang.",
    image: PRODUCT_IMAGES.cityCrew,
    imageFit: "contain",
    imageBg: "#d8d6d0",
    status: "available",
  },
  {
    id: "never-alone-pant",
    look: "07",
    name: "NEVER ALONE PANT",
    kicker: "GARMENT 07 / PANT",
    category: "bottoms",
    price: 185,
    color: "BLACK",
    colors: SWATCH_BLACK,
    sizes: [...GARMENT_SIZES],
    stock: onHand(SWATCH_BLACK),
    description:
      "Black baggy sweatpant. Type on the thigh, type down the leg. Hands in the pocket, stacked on the shoe.",
    image: PRODUCT_IMAGES.neverAlonePant,
    imageFit: "cover",
    imageBg: "#1a1a1a",
    status: "available",
  },
  {
    id: "flame-crew",
    look: "08",
    name: "FLAME CREW",
    kicker: "GARMENT 08 / CREW",
    category: "tops",
    price: 175,
    color: "BLACK",
    colors: SWATCH_BLACK,
    sizes: [...GARMENT_SIZES],
    stock: onHand(SWATCH_BLACK),
    description:
      "Black crew with a faded hem. Type on the chest. Oversized, ribbed at collar, cuff, and waist.",
    image: PRODUCT_IMAGES.flameCrew,
    imageFit: "contain",
    imageBg: "#6a6864",
    status: "available",
  },
  {
    id: "spider-pant",
    look: "09",
    name: "SPIDER PANT",
    kicker: "GARMENT 09 / PANT",
    category: "bottoms",
    price: 195,
    color: "GREY",
    colors: SWATCH_GREY,
    sizes: [...GARMENT_SIZES],
    stock: onHand(SWATCH_GREY),
    description:
      "Wide grey sweatpant. Web and spider down the legs. Drawstring, pocket, pools at the ankle.",
    image: PRODUCT_IMAGES.spiderPant,
    imageFit: "cover",
    imageBg: "#d0cdc6",
    status: "available",
  },
  {
    id: "web-pant",
    look: "10",
    name: "WEB PANT",
    kicker: "GARMENT 10 / PANT",
    category: "bottoms",
    price: 195,
    color: "BLACK",
    colors: SWATCH_BLACK,
    sizes: [...GARMENT_SIZES],
    stock: onHand(SWATCH_BLACK),
    description:
      "Black baggy pant, cream waist. A web on the thigh, a spider hanging from it. Stacked at the shoe.",
    image: PRODUCT_IMAGES.webPant,
    imageFit: "cover",
    imageBg: "#111111",
    status: "available",
  },
];

export const SEED_FEATURED_IDS = ["split-crew", "angel-pant"];
