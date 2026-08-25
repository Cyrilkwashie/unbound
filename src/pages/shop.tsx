import type { GetServerSideProps } from "next";
import { InnerPage } from "@/components/InnerPage";
import { ShopIndex } from "@/components/ShopIndex";
import { availableFrom, type CatalogProduct } from "@/lib/products";
import { readLine } from "@/lib/house-store";

type ShopPageProps = {
  products: CatalogProduct[];
};

export default function ShopPage({ products }: ShopPageProps) {
  return (
    <InnerPage
      title="SHOP"
      kicker="COLLECTION 001"
      description="Shop UNBOUND. Oversized tops, cargos, and the garments that follow."
    >
      <ShopIndex products={products} />
    </InnerPage>
  );
}

export const getServerSideProps: GetServerSideProps<ShopPageProps> = async () => ({
  props: { products: availableFrom(readLine().products) },
});
