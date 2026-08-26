import Head from "next/head";
import type { GetServerSideProps } from "next";
import { AtelierShell } from "@/components/atelier/AtelierShell";
import { LineForm } from "@/components/atelier/LineForm";
import { isAtelierSession } from "@/lib/atelier";
import { ATELIER_LOGIN } from "@/lib/atelier-guard";

export default function CutPiecePage() {
  return (
    <>
      <Head>
        <title>Put on the rail — UNBOUND</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AtelierShell title="PUT ON THE RAIL" kicker="THE LINE — NEW PIECE">
        <p className="mb-12 max-w-md text-sm leading-7 text-mist">
          Once saved, this piece is on the storefront. Forthcoming pieces stay off the shop
          until you put them on the rail. Use SEE THE PIECE if you want to check the look
          before you save.
        </p>
        <LineForm featured={false} />
      </AtelierShell>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (!isAtelierSession(req)) {
    return { redirect: { destination: ATELIER_LOGIN, permanent: false } };
  }
  return { props: {} };
};
