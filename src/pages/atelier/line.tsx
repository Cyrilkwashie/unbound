import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { AtelierShell } from "@/components/atelier/AtelierShell";
import { ProductPhoto } from "@/components/ProductPhoto";
import { isAtelierSession } from "@/lib/atelier";
import { ATELIER_LOGIN } from "@/lib/atelier-guard";
import { readLine } from "@/lib/house-store";
import { isSoldOut, stockTotal, type CatalogProduct } from "@/lib/products";

type LinePageProps = {
  products: CatalogProduct[];
  featuredIds: string[];
};

export default function AtelierLinePage({ products, featuredIds }: LinePageProps) {
  return (
    <>
      <Head>
        <title>The Line — UNBOUND</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AtelierShell title="THE LINE" kicker="PRODUCTS — WHAT THE SHOP SHOWS">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-sm leading-7 text-mist">
            Put a piece on the rail, edit it, pull it. The public shop reads this line — not a
            frozen file.
          </p>
          <Link
            href="/atelier/line/cut"
            className="inline-flex items-center gap-3 text-[10px] tracking-[0.28em] text-ivory"
            data-cursor="VIEW"
          >
            PUT ON THE RAIL
            <span className="block h-px w-8 bg-ivory/70" />
          </Link>
        </div>

        <p className="mt-10 text-[10px] tracking-[0.28em] text-mist">
          {String(products.length).padStart(2, "0")} PIECES
        </p>

        {products.length === 0 ? (
          <p className="mt-20 font-serif text-2xl italic text-ivory/50">The rail is empty.</p>
        ) : (
          <ul className="mt-10">
            {products.map((product) => (
              <li key={product.id} className="border-t border-ivory/10 last:border-b">
                <div className="grid items-center gap-6 py-6 md:grid-cols-12">
                  <div
                    className="overflow-hidden md:col-span-2"
                    style={{ backgroundColor: product.imageBg }}
                  >
                    <ProductPhoto
                      src={product.image}
                      alt={product.name}
                      className={`aspect-[4/5] w-full object-center ${
                        product.imageFit === "contain" ? "object-contain p-3" : "object-cover"
                      }`}
                    />
                  </div>
                  <p className="text-[10px] tracking-[0.28em] text-mist md:col-span-1">{product.look}</p>
                  <div className="md:col-span-4">
                    <p className="font-display text-sm tracking-[0.14em] text-ivory">{product.name}</p>
                    <p className="mt-2 text-[10px] tracking-[0.22em] text-mist">
                      {product.category.toUpperCase()}
                      {featuredIds.includes(product.id) ? " · OPENING" : ""}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {(product.colors ?? []).map((swatch, index) => (
                        <span
                          key={`${swatch.label}-${index}`}
                          className="h-3.5 w-3.5 border border-ivory/40"
                          style={{ backgroundColor: swatch.hex }}
                          title={swatch.label}
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-[10px] tracking-[0.2em] text-stone">
                      {(product.sizes ?? []).join("  ") || "—"}
                    </p>
                  </div>
                  <p className="font-serif text-2xl italic text-ivory md:col-span-2">${product.price}</p>
                  <div className="md:col-span-1">
                    <p className="text-[10px] tracking-[0.24em] text-mist">
                      {product.status === "available" ? "ON THE RAIL" : "HELD"}
                    </p>
                    <p className="mt-2 text-[10px] tracking-[0.2em] text-stone">
                      {isSoldOut(product)
                        ? "SOLD OUT"
                        : `${String(stockTotal(product) ?? 0).padStart(2, "0")} ON HAND`}
                    </p>
                  </div>
                  <div className="flex gap-6 md:col-span-2 md:justify-end">
                    <Link
                      href={`/atelier/line/${product.id}`}
                      className="text-[10px] tracking-[0.24em] text-ivory"
                      data-cursor="VIEW"
                    >
                      EDIT
                    </Link>
                    {product.status === "available" ? (
                      <Link
                        href={`/shop/${product.id}`}
                        className="text-[10px] tracking-[0.24em] text-mist"
                        data-cursor="VIEW"
                      >
                        SHOP
                      </Link>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AtelierShell>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<LinePageProps> = async ({ req }) => {
  if (!isAtelierSession(req)) {
    return { redirect: { destination: ATELIER_LOGIN, permanent: false } };
  }
  const line = readLine();
  return { props: { products: line.products, featuredIds: line.featuredIds } };
};
