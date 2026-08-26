import Head from "next/head";
import type { GetServerSideProps } from "next";
import { AtelierShell } from "@/components/atelier/AtelierShell";
import { OrdersBoard } from "@/components/atelier/OrdersBoard";
import { type AtelierOrder, openOrders } from "@/lib/atelier-books";
import { isAtelierSession } from "@/lib/atelier";
import { ATELIER_LOGIN } from "@/lib/atelier-guard";
import { readBooks, readLine } from "@/lib/house-store";
import type { CatalogProduct } from "@/lib/products";

type OrdersPageProps = {
  orders: AtelierOrder[];
  products: CatalogProduct[];
};

export default function AtelierOrdersPage({ orders, products }: OrdersPageProps) {
  const open = openOrders(orders).length;

  return (
    <>
      <Head>
        <title>Orders — UNBOUND</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AtelierShell title="ORDERS" kicker="SALES — WRITE THE TICKET">
        <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <p className="max-w-md text-sm leading-7 text-mist">
            Record a sale and it lands in The Till. Packing means it is still here.
            Sent means it has left.
          </p>
          <p className="text-[10px] tracking-[0.28em] text-mist">
            {String(open).padStart(2, "0")} OPEN · {String(orders.length).padStart(2, "0")} TOTAL
          </p>
        </div>
        <OrdersBoard orders={orders} products={products} />
      </AtelierShell>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<OrdersPageProps> = async ({ req }) => {
  if (!isAtelierSession(req)) {
    return { redirect: { destination: ATELIER_LOGIN, permanent: false } };
  }
  return {
    props: {
      orders: readBooks().orders,
      products: readLine().products,
    },
  };
};
