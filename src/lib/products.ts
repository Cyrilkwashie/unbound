export const PRODUCT_IMAGES = {
  baggyTop: "/baggy top.jpg",
  cargo: "/baggy cargo.jpg",
} as const;

export const productSrc = (path: string) => encodeURI(path);
