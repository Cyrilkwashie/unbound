import { productSrc } from "@/lib/products";

type ProductPhotoProps = {
  src: string;
  alt: string;
  className?: string;
};

export const ProductPhoto = ({ src, alt, className }: ProductPhotoProps) => {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={productSrc(src)} alt={alt} className={className} />
  );
};
