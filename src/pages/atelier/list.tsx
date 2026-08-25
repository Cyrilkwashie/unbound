import Head from "next/head";
import type { GetServerSideProps } from "next";
import { AtelierShell } from "@/components/atelier/AtelierShell";
import type { ListName } from "@/lib/atelier-books";
import { isAtelierSession } from "@/lib/atelier";
import { ATELIER_LOGIN } from "@/lib/atelier-guard";
import { readBooks } from "@/lib/house-store";

type ListPageProps = {
  names: ListName[];
};

export default function AtelierListPage({ names }: ListPageProps) {
  return (
    <>
      <Head>
        <title>The List — UNBOUND</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AtelierShell title="THE LIST" kicker="CLIENTS — WHO STAYS CLOSE TO THE LINE">
        <p className="max-w-md text-sm leading-7 text-mist">
          Names written with a ticket land here. The public ENTER THE LIST wire will join
          this book when it is cut.
        </p>

        <p className="mt-10 text-[10px] tracking-[0.28em] text-mist">
          {String(names.length).padStart(2, "0")} NAMES
        </p>

        {names.length === 0 ? (
          <p className="mt-20 font-serif text-2xl italic text-ivory/50">The list is empty.</p>
        ) : (
          <ul className="mt-10">
            {names.map((entry) => (
              <li
                key={entry.mark}
                className="grid grid-cols-2 gap-3 border-t border-ivory/10 py-6 last:border-b md:grid-cols-3"
              >
                <p className="font-display text-sm tracking-[0.14em] text-ivory">{entry.mark}</p>
                <p className="text-[11px] tracking-[0.2em] text-mist">{entry.joined}</p>
                <p className="col-span-2 text-[10px] tracking-[0.24em] text-stone md:col-span-1 md:text-right">
                  {entry.source}
                </p>
              </li>
            ))}
          </ul>
        )}
      </AtelierShell>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<ListPageProps> = async ({ req }) => {
  if (!isAtelierSession(req)) {
    return { redirect: { destination: ATELIER_LOGIN, permanent: false } };
  }
  return { props: { names: readBooks().list } };
};
