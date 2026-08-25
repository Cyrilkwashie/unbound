import Head from "next/head";
import { CollectionSection } from "@/components/CollectionSection";
import { EditorialSection } from "@/components/EditorialSection";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { PhilosophySection } from "@/components/PhilosophySection";
import { ProductShowcase } from "@/components/ProductShowcase";

export default function Home() {
  return (
    <>
      <Head>
        <title>UNBOUND — Collection 001</title>
        <meta
          name="description"
          content="UNBOUND is premium contemporary streetwear. Collection 001 — not made to follow."
        />
        <meta property="og:title" content="UNBOUND — Collection 001" />
        <meta
          property="og:description"
          content="A cinematic fashion house for movement, individuality, and dark luxury."
        />
        <meta property="og:type" content="website" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <Hero />
        <CollectionSection />
        <ProductShowcase />
        <EditorialSection />
        <PhilosophySection />
      </main>
      <Footer />
    </>
  );
}
