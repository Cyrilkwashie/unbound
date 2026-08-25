import Head from "next/head";
import type { GetServerSideProps } from "next";
import { AtelierShell } from "@/components/atelier/AtelierShell";
import { LineForm } from "@/components/atelier/LineForm";
import { isAtelierSession } from "@/lib/atelier";
import { ATELIER_LOGIN } from "@/lib/atelier-guard";
import { readLine } from "@/lib/house-store";
import type { CatalogProduct } from "@/lib/products";

type EditPieceProps = {
  product: CatalogProduct;
  featured: boolean;
};

export default function EditPiecePage({ product, featured }: EditPieceProps) {
  return (
    <>
      <Head>
        <title>{`${product.name} — The Line`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AtelierShell title={product.name} kicker={`THE LINE — LOOK ${product.look}`}>
        <LineForm product={product} featured={featured} />
      </AtelierShell>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<EditPieceProps> = async ({ req, params }) => {
  if (!isAtelierSession(req)) {
    return { redirect: { destination: ATELIER_LOGIN, permanent: false } };
  }
  const id = typeof params?.id === "string" ? params.id : "";
  const line = readLine();
  const product = line.products.find((item) => item.id === id);
  if (!product) return { notFound: true };
  return { props: { product, featured: line.featuredIds.includes(product.id) } };
};
