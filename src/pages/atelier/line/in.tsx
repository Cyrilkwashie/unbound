import Head from "next/head";
import type { GetServerSideProps } from "next";
import { AtelierShell } from "@/components/atelier/AtelierShell";
import { GoodsInBoard } from "@/components/atelier/GoodsInBoard";
import { isAtelierSession } from "@/lib/atelier";
import { ATELIER_LOGIN } from "@/lib/atelier-guard";
import { readLine } from "@/lib/house-store";
import type { CatalogProduct } from "@/lib/products";

type GoodsInPageProps = {
  products: CatalogProduct[];
};

export default function GoodsInPage({ products }: GoodsInPageProps) {
  return (
    <>
      <Head>
        <title>Goods in — UNBOUND</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AtelierShell title="GOODS IN" kicker="THE LINE — A DROP ARRIVED">
        <GoodsInBoard products={products} />
      </AtelierShell>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<GoodsInPageProps> = async ({ req }) => {
  if (!isAtelierSession(req)) {
    return { redirect: { destination: ATELIER_LOGIN, permanent: false } };
  }
  return { props: { products: readLine().products } };
};
