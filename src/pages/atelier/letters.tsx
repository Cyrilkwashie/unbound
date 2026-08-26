import Head from "next/head";
import type { GetServerSideProps } from "next";
import { AtelierShell } from "@/components/atelier/AtelierShell";
import { LettersBoard } from "@/components/atelier/LettersBoard";
import type { Letter } from "@/lib/atelier-books";
import { isAtelierSession } from "@/lib/atelier";
import { ATELIER_LOGIN } from "@/lib/atelier-guard";
import { readBooks } from "@/lib/house-store";

type LettersPageProps = {
  letters: Letter[];
};

export default function AtelierLettersPage({ letters }: LettersPageProps) {
  return (
    <>
      <Head>
        <title>Letters — UNBOUND</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AtelierShell title="LETTERS" kicker="THE POST — WHAT WAS WRITTEN IN">
        <p className="mb-12 max-w-md text-sm leading-7 text-mist">
          Inquiries, stockists, press. The contact page writes here. Mark it read when you have
          answered.
        </p>
        <LettersBoard letters={letters} />
      </AtelierShell>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<LettersPageProps> = async ({ req }) => {
  if (!isAtelierSession(req)) {
    return { redirect: { destination: ATELIER_LOGIN, permanent: false } };
  }
  return { props: { letters: readBooks().letters } };
};
