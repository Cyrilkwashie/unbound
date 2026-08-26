import type { GetServerSideProps } from "next";
import { InnerPage } from "@/components/InnerPage";
import { ShopIndex } from "@/components/ShopIndex";
import { availableFrom, SEED_CATALOG, type CatalogProduct } from "@/lib/products";
import { readLine } from "@/lib/house-store";

type ShopPageProps = {
  products: CatalogProduct[];
};

export default function ShopPage({ products }: ShopPageProps) {
  return (
    <InnerPage
      title="SHOP"
      kicker="COLLECTION 001"
      description="The UNBOUND shop. Baggy tops, cargos, and the rest of the rail."
    >
      <ShopIndex products={products} />
    </InnerPage>
  );
}

export const getServerSideProps: GetServerSideProps<ShopPageProps> = async ({ res }) => {
  res.setHeader("Cache-Control", "no-store, max-age=0");
  try {
    return { props: { products: availableFrom(readLine().products) } };
  } catch {
    return { props: { products: availableFrom(SEED_CATALOG) } };
  }
};
