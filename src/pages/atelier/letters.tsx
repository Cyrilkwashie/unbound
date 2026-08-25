import Head from "next/head";
import type { GetServerSideProps } from "next";
import { AtelierShell } from "@/components/atelier/AtelierShell";
import type { Letter } from "@/lib/atelier-books";
import { isAtelierSession } from "@/lib/atelier";
import { ATELIER_LOGIN } from "@/lib/atelier-guard";
import { readBooks } from "@/lib/house-store";

type LettersPageProps = {
  letters: Letter[];
};

export default function AtelierLettersPage({ letters }: LettersPageProps) {
  const unread = letters.filter((letter) => letter.unread).length;

  return (
    <>
      <Head>
        <title>Letters — UNBOUND</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AtelierShell title="LETTERS" kicker="MESSAGES — WHAT WAS WRITTEN IN">
        <p className="max-w-md text-sm leading-7 text-mist">
          Inquiries, stockists, press. The public contact page is email-only for now —
          letters will arrive here when the wire is cut.
        </p>

        <p className="mt-10 text-[10px] tracking-[0.28em] text-mist">
          {String(unread).padStart(2, "0")} UNREAD · {String(letters.length).padStart(2, "0")} HELD
        </p>

        {letters.length === 0 ? (
          <p className="mt-20 font-serif text-2xl italic text-ivory/50">Nothing in the post.</p>
        ) : (
          <ul className="mt-12">
            {letters.map((letter) => (
              <li key={letter.id} className="border-t border-ivory/10 py-8 last:border-b">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <p className="text-[10px] tracking-[0.28em] text-mist">
                    {letter.id}
                    {letter.unread ? " · UNREAD" : ""}
                  </p>
                  <p className="text-[10px] tracking-[0.24em] text-stone">{letter.received}</p>
                </div>
                <h2 className="mt-5 font-display text-xl tracking-[0.12em] text-ivory md:text-2xl">
                  {letter.subject}
                </h2>
                <p className="mt-3 text-[11px] tracking-[0.2em] text-mist">{letter.from}</p>
                <p className="mt-6 max-w-xl text-sm leading-7 text-mist">{letter.body}</p>
              </li>
            ))}
          </ul>
        )}
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
