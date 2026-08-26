import Head from "next/head";
import type { GetServerSideProps } from "next";
import { AtelierShell } from "@/components/atelier/AtelierShell";
import { ListBoard } from "@/components/atelier/ListBoard";
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
        <ListBoard names={names} />
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
