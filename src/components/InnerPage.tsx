import Head from "next/head";
import type { ReactNode } from "react";
import { Footer } from "@/components/Footer";

type InnerPageProps = {
  title: string;
  kicker: string;
  description: string;
  children: ReactNode;
};

export const InnerPage = ({ title, kicker, description, children }: InnerPageProps) => {
  return (
    <>
      <Head>
        <title>{`${title} — UNBOUND`}</title>
        <meta name="description" content={description} />
      </Head>
      <main className="min-h-screen bg-void-0 pt-24 md:pt-28">
        <header className="px-5 pb-10 md:px-10 md:pb-16">
          <p className="text-[10px] tracking-[0.36em] text-mist">{kicker}</p>
          <h1 className="mt-6 font-display text-[clamp(2.6rem,8vw,7rem)] font-light leading-[0.9] tracking-[0.12em] text-ivory">
            {title}
          </h1>
        </header>
        {children}
      </main>
      <Footer />
    </>
  );
};
