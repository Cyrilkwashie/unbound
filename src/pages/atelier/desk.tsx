import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { AtelierShell } from "@/components/atelier/AtelierShell";
import {
  ORDER_STATUS,
  money,
  openOrders,
  tillTotal,
  type AtelierOrder,
} from "@/lib/atelier-books";
import { isAtelierSession } from "@/lib/atelier";
import { ATELIER_LOGIN } from "@/lib/atelier-guard";
import { readBooks, readLine } from "@/lib/house-store";

type DeskPageProps = {
  pieceCount: number;
  listCount: number;
  orders: AtelierOrder[];
};

export default function AtelierDeskPage({ pieceCount, listCount, orders }: DeskPageProps) {
  const open = openOrders(orders);
  const revenue = tillTotal(orders);
  const recent = orders.slice(0, 4);

  const stats = [
    { label: "ON THE LINE", value: String(pieceCount).padStart(2, "0"), hint: "Products" },
    { label: "THE TILL", value: money(revenue), hint: "Revenue" },
    { label: "OPEN ORDERS", value: String(open.length).padStart(2, "0"), hint: "To cut or send" },
    { label: "THE LIST", value: String(listCount).padStart(2, "0"), hint: "Clients" },
  ];

  return (
    <>
      <Head>
        <title>Desk — UNBOUND</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AtelierShell title="DESK" kicker="THE ATELIER — OVERVIEW">
        <p className="max-w-lg font-serif text-2xl italic text-ivory md:text-3xl">
          Collection 001 is on the table.
        </p>

        <ul className="mt-14 grid grid-cols-2 gap-px bg-ivory/10 lg:grid-cols-4">
          {stats.map((stat) => (
            <li key={stat.label} className="bg-void-0 px-5 py-8 md:px-7">
              <p className="text-[10px] tracking-[0.28em] text-mist">{stat.label}</p>
              <p className="mt-4 font-display text-[clamp(1.6rem,3vw,2.4rem)] tracking-[0.08em] text-ivory">
                {stat.value}
              </p>
              <p className="mt-3 text-[10px] tracking-[0.2em] text-stone">{stat.hint}</p>
            </li>
          ))}
        </ul>

        <section className="mt-20">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-[10px] tracking-[0.32em] text-mist">RECENT ORDERS</h2>
            <Link href="/atelier/orders" className="text-[10px] tracking-[0.28em] text-ivory" data-cursor="VIEW">
              ALL ORDERS
            </Link>
          </div>
          <ul className="mt-6">
            {recent.length === 0 ? (
              <li className="border-t border-ivory/10 py-8 font-serif text-xl italic text-ivory/50">
                No tickets yet. Record a sale.
              </li>
            ) : (
              recent.map((order) => (
                <li
                  key={order.id}
                  className="flex flex-col gap-2 border-t border-ivory/10 py-5 last:border-b md:flex-row md:items-baseline md:justify-between"
                >
                  <p className="text-[11px] tracking-[0.22em] text-mist">{order.id}</p>
                  <p className="font-display text-sm tracking-[0.12em] text-ivory">{order.piece}</p>
                  <p className="text-[11px] tracking-[0.2em] text-mist">{ORDER_STATUS[order.status]}</p>
                  <p className="font-serif text-xl italic text-ivory">{money(order.total)}</p>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="mt-16 flex flex-wrap gap-10 text-[11px] tracking-[0.28em] text-ivory">
          <Link href="/atelier/line" data-cursor="VIEW">
            THE LINE
          </Link>
          <Link href="/atelier/till" data-cursor="VIEW">
            THE TILL
          </Link>
          <Link href="/atelier/orders" data-cursor="VIEW">
            RECORD A SALE
          </Link>
        </section>
      </AtelierShell>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<DeskPageProps> = async ({ req }) => {
  if (!isAtelierSession(req)) {
    return { redirect: { destination: ATELIER_LOGIN, permanent: false } };
  }
  const books = readBooks();
  return {
    props: {
      pieceCount: readLine().products.length,
      listCount: books.list.length,
      orders: books.orders,
    },
  };
};
