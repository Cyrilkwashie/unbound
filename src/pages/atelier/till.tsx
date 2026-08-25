import Head from "next/head";
import type { GetServerSideProps } from "next";
import { AtelierShell } from "@/components/atelier/AtelierShell";
import {
  categoryTakings,
  money,
  tillMonths,
  tillTotal,
  type AtelierOrder,
} from "@/lib/atelier-books";
import { isAtelierSession } from "@/lib/atelier";
import { ATELIER_LOGIN } from "@/lib/atelier-guard";
import { readBooks } from "@/lib/house-store";

type TillPageProps = {
  orders: AtelierOrder[];
};

export default function AtelierTillPage({ orders }: TillPageProps) {
  const total = tillTotal(orders);
  const months = tillMonths(orders);
  const peak = Math.max(1, ...months.map((month) => month.value));
  const categories = categoryTakings(orders);
  const categorySum = Math.max(
    categories.reduce((sum, item) => sum + item.value, 0),
    1
  );

  return (
    <>
      <Head>
        <title>The Till — UNBOUND</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AtelierShell title="THE TILL" kicker="SALES & REVENUE — FROM THE BOOK">
        <p className="max-w-md text-sm leading-7 text-mist">
          Every ticket you write in Orders counts here. The bag will join this till when
          checkout is live.
        </p>

        <p className="mt-14 font-display text-[clamp(2.4rem,8vw,6rem)] font-light tracking-[0.08em] text-ivory">
          {money(total)}
        </p>
        <p className="mt-3 text-[10px] tracking-[0.28em] text-mist">TOTAL TAKINGS</p>

        <section className="mt-20">
          <h2 className="text-[10px] tracking-[0.32em] text-mist">BY MONTH</h2>
          {months.length === 0 ? (
            <p className="mt-8 font-serif text-2xl italic text-ivory/50">The till is quiet.</p>
          ) : (
            <ul className="mt-8 space-y-5">
              {months.map((month) => (
                <li key={month.label}>
                  <div className="mb-2 flex items-baseline justify-between gap-4">
                    <span className="text-[11px] tracking-[0.24em] text-mist">{month.label}</span>
                    <span className="font-serif text-xl italic text-ivory">{money(month.value)}</span>
                  </div>
                  <div className="h-px bg-ivory/10">
                    <div
                      className="h-px bg-ivory/70"
                      style={{ width: `${(month.value / peak) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-20">
          <h2 className="text-[10px] tracking-[0.32em] text-mist">BY DEPARTMENT</h2>
          <ul className="mt-8">
            {categories.map((item) => (
              <li
                key={item.label}
                className="flex items-baseline justify-between gap-4 border-t border-ivory/10 py-6 last:border-b"
              >
                <span className="text-[11px] tracking-[0.24em] text-ivory">{item.label}</span>
                <span className="font-serif text-2xl italic text-ivory">{money(item.value)}</span>
                <span className="hidden text-[10px] tracking-[0.2em] text-stone md:inline">
                  {Math.round((item.value / categorySum) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </section>
      </AtelierShell>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<TillPageProps> = async ({ req }) => {
  if (!isAtelierSession(req)) {
    return { redirect: { destination: ATELIER_LOGIN, permanent: false } };
  }
  return { props: { orders: readBooks().orders } };
};
