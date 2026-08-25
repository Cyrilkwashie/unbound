import Head from "next/head";
import type { GetServerSideProps } from "next";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { HomeContinue } from "@/components/HomeContinue";
import { HomeLooks } from "@/components/HomeLooks";
import { HomeStatement } from "@/components/HomeStatement";
import { availableFrom, featuredFrom, SEED_CATALOG, SEED_FEATURED_IDS, type CatalogProduct } from "@/lib/products";
import { readLine } from "@/lib/house-store";

type HomeProps = {
  looks: CatalogProduct[];
  pieceCount: number;
};

export default function Home({ looks, pieceCount }: HomeProps) {
  return (
    <>
      <Head>
        <title>UNBOUND — Collection 001</title>
        <meta
          name="description"
          content="UNBOUND. Baggy clothes on the rail. Collection 001."
        />
        <meta property="og:title" content="UNBOUND — Collection 001" />
        <meta
          property="og:description"
          content="A shop of baggy clothes. Dark, oversized, waiting."
        />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <Hero />
        <HomeStatement />
        <HomeLooks looks={looks} pieceCount={pieceCount} />
        <HomeContinue />
      </main>
      <Footer />
    </>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  try {
    const line = readLine();
    return {
      props: {
        looks: featuredFrom(line.products, line.featuredIds),
        pieceCount: availableFrom(line.products).length,
      },
    };
  } catch {
    return {
      props: {
        looks: featuredFrom(SEED_CATALOG, [...SEED_FEATURED_IDS]),
        pieceCount: availableFrom(SEED_CATALOG).length,
      },
    };
  }
};
