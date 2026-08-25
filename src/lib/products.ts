/**
 * UNBOUND shop catalog.
 *
 * To add a garment:
 * 1. Drop the photo in /public (or /public/shop)
 * 2. Append an object to CATALOG
 * 3. Rebuild
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

export type CatalogProduct = {
  id: string;
  look: string;
  name: string;
  kicker: string;
  category: Exclude<ShopCategory, "all">;
  price: number;
  color: string;
  colors: { label: string; hex: string }[];
  description: string;
  image: string;
  imageFit: "contain" | "cover";
  imageBg: string;
  status: "available" | "forthcoming";
};

const SWATCH_BLACK = [{ label: "Black", hex: "#111111" }];
const SWATCH_LAYERED = [
  { label: "Black", hex: "#111111" },
  { label: "White", hex: "#F4F1EA" },
];

export const CATALOG: CatalogProduct[] = [
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

export const availableProducts = () =>
  CATALOG.filter((product) => product.status === "available");

export const getProduct = (id: string) =>
  CATALOG.find((product) => product.id === id);

/** Opening looks featured on the homepage — not the full shop. */
export const FEATURED_LOOK_IDS = ["darkness-baggy-top", "baggy-cargo"] as const;

export const featuredLooks = () =>
  FEATURED_LOOK_IDS.map((id) => getProduct(id)).filter(
    (product): product is CatalogProduct => Boolean(product)
  );

export const productsInCategory = (category: ShopCategory) => {
  const pieces = availableProducts();
  if (category === "all") return pieces;
  return pieces.filter((product) => product.category === category);
};
