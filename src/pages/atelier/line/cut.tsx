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
        <title>Cut a piece — UNBOUND</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AtelierShell title="CUT A PIECE" kicker="THE LINE — NEW GARMENT">
        <p className="mb-12 max-w-md text-sm leading-7 text-mist">
          Once saved, this piece is on the storefront. Forthcoming pieces stay off the shop
          until you put them on the rail.
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
