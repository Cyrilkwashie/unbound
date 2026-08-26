import Head from "next/head";
import type { GetServerSideProps } from "next";
import { AtelierShell } from "@/components/atelier/AtelierShell";
import { atelierName, isAtelierSession } from "@/lib/atelier";
import { ATELIER_LOGIN } from "@/lib/atelier-guard";

type HousePageProps = {
  door: string;
  serverless: boolean;
};

export default function AtelierHousePage({ door, serverless }: HousePageProps) {
  const rows = [
    { label: "PUBLIC NAME", value: "UNBOUND" },
    { label: "COLLECTION", value: "001" },
    { label: "PUBLIC EMAIL", value: "hello@unbound.studio" },
    { label: "THE DOOR", value: "/atelier" },
    { label: "THE NAME", value: door || "OPEN" },
    {
      label: "THE KEY",
      value: door
        ? "Set in the house environment."
        : "The door is open for now. Any name and key may enter.",
    },
    {
      label: "THE BOOK",
      value: serverless
        ? "On this host the book lives in memory. A restart forgets it."
        : "Written to the house files on this machine.",
    },
  ];

  const how = [
    "A ticket takes the pieces off the rail and puts money in the till.",
    "VOID puts the piece back. The money leaves the till.",
    "GOODS IN adds a drop to a color and size.",
    "ENTER THE LIST on the public site writes a name here.",
    "CONTACT writes a letter into the post.",
    "The bag still does not take money. Checkout is not live.",
  ];

  return (
    <>
      <Head>
        <title>House — UNBOUND</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AtelierShell title="HOUSE" kicker="SETTINGS — HOW THE ATELIER STANDS">
        <p className="max-w-md text-sm leading-7 text-mist">
          The public site stays cinematic. The Line is the shop. Tickets write The Till.
          Change the door name and key in the house environment — never on the page.
        </p>

        <ul className="mt-14">
          {rows.map((row) => (
            <li
              key={row.label}
              className="flex flex-col gap-2 border-t border-ivory/10 py-6 last:border-b md:flex-row md:items-baseline md:justify-between"
            >
              <p className="text-[10px] tracking-[0.28em] text-mist">{row.label}</p>
              <p className="font-display text-sm tracking-[0.1em] text-ivory md:max-w-md md:text-right">
                {row.value}
              </p>
            </li>
          ))}
        </ul>

        <h2 className="mt-20 text-[10px] tracking-[0.32em] text-mist">HOW THE HOUSE RUNS</h2>
        <ul className="mt-8">
          {how.map((line) => (
            <li key={line} className="border-t border-ivory/10 py-5 text-sm leading-7 text-mist last:border-b">
              {line}
            </li>
          ))}
        </ul>
      </AtelierShell>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<HousePageProps> = async ({ req }) => {
  if (!isAtelierSession(req)) {
    return { redirect: { destination: ATELIER_LOGIN, permanent: false } };
  }
  return {
    props: {
      door: atelierName(),
      serverless: Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME),
    },
  };
};
