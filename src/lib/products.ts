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

export type CatalogProduct = {
  id: string;
  look: string;
  name: string;
  kicker: string;
  category: ProductCategory;
  price: number;
  color: string;
  colors: { label: string; hex: string }[];
  description: string;
  image: string;
  imageFit: "contain" | "cover";
  imageBg: string;
  status: "available" | "forthcoming";
};

const SWATCH_HEX: Record<string, string> = {
  BLACK: "#111111",
  WHITE: "#F4F1EA",
  IVORY: "#F4F1EA",
};

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
      "Oversized layered tee — black over white. Thorn graphic across the chest, sleeve marks down the arms. Cut to drape, not to fit in.",
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
      "Architectural pockets. Relaxed fall. Gothic cross marks down the leg. Cut to travel with the body, not against it.",
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
      "The lighter cut of the layered system. Same thorn mark, shorter drape, built to sit under outer pieces.",
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
      "A shell for movement. Layered construction, open through the body, cut to ride over the baggy top.",
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
      "The cargo without the shout. Cleaner face, same relaxed fall, still cut to travel with the body.",
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
      "Utility without costume. Pocket stack, wide leg, a work pant cut for the street.",
    image: PRODUCT_IMAGES.cargo,
    imageFit: "cover",
    imageBg: "#eceae4",
    status: "available",
  },
];

export const SEED_FEATURED_IDS = ["darkness-baggy-top", "baggy-cargo"];
