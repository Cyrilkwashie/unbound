import type { GetStaticPaths, GetStaticProps } from "next";
import Link from "next/link";
import Head from "next/head";
import { Footer } from "@/components/Footer";
import { ProductCard } from "@/components/ProductCard";
import { ShopTile } from "@/components/ShopTile";
import {
  CATALOG,
  availableProducts,
  getProduct,
  type CatalogProduct,
} from "@/lib/products";

type ShopProductPageProps = {
  product: CatalogProduct;
  related: CatalogProduct[];
};

export default function ShopProductPage({ product, related }: ShopProductPageProps) {
  return (
    <>
      <Head>
        <title>{`${product.name} — UNBOUND`}</title>
        <meta name="description" content={product.description} />
      </Head>
      <main className="min-h-screen bg-void-0 pt-24 md:pt-28">
        <div className="px-5 md:px-10">
          <p className="text-[10px] tracking-[0.28em] text-mist">
            <Link href="/shop" className="transition-colors duration-500 hover:text-ivory" data-cursor="VIEW">
              SHOP
            </Link>
            <span className="mx-3 text-ivory/20">/</span>
            <span className="text-ivory">{product.name}</span>
          </p>
        </div>

        <ProductCard product={product} />

        {related.length > 0 ? (
          <section className="border-t border-ivory/10 px-5 py-20 md:px-10 md:py-28">
            <p className="text-[10px] tracking-[0.32em] text-mist">ALSO IN THE HOUSE</p>
            <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-8">
              {related.map((item, index) => (
                <ShopTile key={item.id} product={item} index={index} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: availableProducts().map((product) => ({ params: { slug: product.id } })),
  fallback: false,
});

export const getStaticProps: GetStaticProps<ShopProductPageProps> = async (context) => {
  const slug = context.params?.slug;
  const id = Array.isArray(slug) ? slug[0] : slug;
  const product = id ? getProduct(id) : undefined;

  if (!product || product.status !== "available") {
    return { notFound: true };
  }

  const related = CATALOG.filter(
    (item) => item.id !== product.id && item.status === "available"
  ).slice(0, 4);

  return { props: { product, related } };
};
