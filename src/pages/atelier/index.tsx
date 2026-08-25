import Head from "next/head";
import type { GetServerSideProps } from "next";
import { AtelierLogin } from "@/components/AtelierLogin";
import { isAtelierSession } from "@/lib/atelier";
import { ATELIER_DESK } from "@/lib/atelier-guard";

export default function AtelierDoor() {
  return (
    <>
      <Head>
        <title>UNBOUND</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <main className="flex min-h-[100svh] flex-col justify-end bg-void-0 px-5 py-16 md:justify-center md:px-10 md:py-24">
        <p className="text-[10px] tracking-[0.4em] text-mist">THE ATELIER</p>
        <h1 className="mt-8 font-display text-[clamp(2.8rem,10vw,8rem)] font-light leading-[0.86] tracking-[0.16em] text-ivory">
          UNBOUND
        </h1>
        <div className="editorial-line mt-10 w-16" />
        <div className="mt-16 md:mt-20">
          <AtelierLogin />
        </div>
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  if (isAtelierSession(req)) {
    return { redirect: { destination: ATELIER_DESK, permanent: false } };
  }
  return { props: {} };
};
