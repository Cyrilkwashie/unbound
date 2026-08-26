import Head from "next/head";
import type { GetServerSideProps } from "next";
import { AtelierShell } from "@/components/atelier/AtelierShell";
import { OrdersBoard } from "@/components/atelier/OrdersBoard";
import { type AtelierOrder, openOrders, uniqueClients, type ListName } from "@/lib/atelier-books";
import { isAtelierSession } from "@/lib/atelier";
import { ATELIER_LOGIN } from "@/lib/atelier-guard";
import { readBooks, readLine } from "@/lib/house-store";
import type { CatalogProduct } from "@/lib/products";

type OrdersPageProps = {
  orders: AtelierOrder[];
  products: CatalogProduct[];
  clients: ListName[];
};

export default function AtelierOrdersPage({ orders, products, clients }: OrdersPageProps) {
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
            Record a sale and it lands in The Till. Add every piece they took — the total
            writes itself. Void puts the rail back.
          </p>
          <p className="text-[10px] tracking-[0.28em] text-mist">
            {String(open).padStart(2, "0")} OPEN · {String(orders.length).padStart(2, "0")} TOTAL
          </p>
        </div>
        <OrdersBoard orders={orders} products={products} clients={clients} />
      </AtelierShell>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<OrdersPageProps> = async ({ req }) => {
  if (!isAtelierSession(req)) {
    return { redirect: { destination: ATELIER_LOGIN, permanent: false } };
  }
  const books = readBooks();
  return {
    props: {
      orders: books.orders,
      products: readLine().products,
      clients: uniqueClients(books.list, books.orders),
    },
  };
};
