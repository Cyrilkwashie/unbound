import Head from "next/head";
import Link from "next/link";
import type { GetServerSideProps } from "next";
import { AtelierShell } from "@/components/atelier/AtelierShell";
import {
  CHANNEL_LABEL,
  money,
  openOrders,
  orderLines,
  tillToday,
  tillTotal,
  ticketSummary,
  type AtelierOrder,
  type SaleChannel,
} from "@/lib/atelier-books";
import { isAtelierSession } from "@/lib/atelier";
import { ATELIER_LOGIN } from "@/lib/atelier-guard";
import { readBooks, readLine } from "@/lib/house-store";
import { railAlerts, type RailAlert } from "@/lib/products";

type DeskPageProps = {
  pieceCount: number;
  listCount: number;
  unreadLetters: number;
  today: number;
  revenue: number;
  packing: AtelierOrder[];
  alerts: RailAlert[];
};

export default function AtelierDeskPage({
  pieceCount,
  listCount,
  unreadLetters,
  today,
  revenue,
  packing,
  alerts,
}: DeskPageProps) {
  const stats = [
    { label: "TODAY", value: money(today), hint: "Takings since midnight" },
    { label: "TO PACK", value: String(packing.length).padStart(2, "0"), hint: "Paid or packing" },
    { label: "THE RAIL", value: String(alerts.length).padStart(2, "0"), hint: "Low or sold out" },
    { label: "THE POST", value: String(unreadLetters).padStart(2, "0"), hint: "Unread letters" },
  ];

  return (
    <>
      <Head>
        <title>Desk — UNBOUND</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AtelierShell title="DESK" kicker="THE ATELIER — THIS MORNING">
        <p className="max-w-lg font-serif text-2xl italic text-ivory md:text-3xl">
          What needs doing.
        </p>
        <p className="mt-4 max-w-md text-sm leading-7 text-mist">
          {money(revenue)} in the book. {String(pieceCount).padStart(2, "0")} on the line.{" "}
          {String(listCount).padStart(2, "0")} on the list.
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
            <h2 className="text-[10px] tracking-[0.32em] text-mist">TO PACK</h2>
            <Link href="/atelier/orders" className="text-[10px] tracking-[0.28em] text-ivory" data-cursor="VIEW">
              ORDERS
            </Link>
          </div>
          <ul className="mt-6">
            {packing.length === 0 ? (
              <li className="border-t border-ivory/10 py-8 font-serif text-xl italic text-ivory/50">
                Nothing waiting. The floor is clear.
              </li>
            ) : (
              packing.map((order) => (
                <li
                  key={order.id}
                  className="flex flex-col gap-2 border-t border-ivory/10 py-5 last:border-b md:flex-row md:items-baseline md:justify-between"
                >
                  <p className="text-[11px] tracking-[0.22em] text-mist">{order.id}</p>
                  <p className="font-display text-sm tracking-[0.12em] text-ivory">
                    {ticketSummary(order)}
                    <span className="ml-3 text-[10px] tracking-[0.2em] text-stone">
                      {orderLines(order)
                        .map((line) => `${line.size} ×${line.qty}`)
                        .join(" · ")}
                    </span>
                  </p>
                  <p className="text-[11px] tracking-[0.2em] text-mist">{order.client}</p>
                  <p className="text-[10px] tracking-[0.2em] text-stone">
                    {CHANNEL_LABEL[(order.channel as SaleChannel) ?? "till"]}
                  </p>
                  <p className="font-serif text-xl italic text-ivory">{money(order.total)}</p>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="mt-20">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-[10px] tracking-[0.32em] text-mist">THE RAIL</h2>
            <Link href="/atelier/line/in" className="text-[10px] tracking-[0.28em] text-ivory" data-cursor="VIEW">
              GOODS IN
            </Link>
          </div>
          <ul className="mt-6">
            {alerts.length === 0 ? (
              <li className="border-t border-ivory/10 py-8 font-serif text-xl italic text-ivory/50">
                Counts are healthy.
              </li>
            ) : (
              alerts.slice(0, 8).map((alert, index) => (
                <li
                  key={`${alert.id}-${alert.detail}-${index}`}
                  className="flex flex-col gap-2 border-t border-ivory/10 py-5 last:border-b md:flex-row md:items-baseline md:justify-between"
                >
                  <p className="text-[11px] tracking-[0.22em] text-mist">{alert.look}</p>
                  <Link
                    href={`/atelier/line/${alert.id}`}
                    className="font-display text-sm tracking-[0.12em] text-ivory"
                    data-cursor="VIEW"
                  >
                    {alert.name}
                  </Link>
                  <p className="text-[11px] tracking-[0.2em] text-mist">{alert.detail}</p>
                  <p className="text-[10px] tracking-[0.24em] text-stone">
                    {alert.kind === "sold" ? "SOLD OUT" : "LOW"}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>

        <section className="mt-16 flex flex-wrap gap-10 text-[11px] tracking-[0.28em] text-ivory">
          <Link href="/atelier/orders" data-cursor="VIEW">
            WRITE A TICKET
          </Link>
          <Link href="/atelier/line/in" data-cursor="VIEW">
            GOODS IN
          </Link>
          <Link href="/atelier/letters" data-cursor="VIEW">
            {unreadLetters > 0 ? `${String(unreadLetters).padStart(2, "0")} LETTERS` : "LETTERS"}
          </Link>
          <Link href="/atelier/list" data-cursor="VIEW">
            THE LIST
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
  const line = readLine();
  return {
    props: {
      pieceCount: line.products.length,
      listCount: books.list.length,
      unreadLetters: books.letters.filter((letter) => letter.unread).length,
      today: tillToday(books.orders),
      revenue: tillTotal(books.orders),
      packing: openOrders(books.orders),
      alerts: railAlerts(line.products),
    },
  };
};
