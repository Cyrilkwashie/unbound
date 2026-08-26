import { productSrc } from "@/lib/products";

type ProductPhotoProps = {
  src: string;
  alt: string;
  className?: string;
};

export const ProductPhoto = ({ src, alt, className }: ProductPhotoProps) => {
  const href = productSrc(src);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={href}
      alt={alt}
      className={className}
      decoding="async"
      draggable={false}
    />
  );
};
