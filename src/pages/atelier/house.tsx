import Head from "next/head";
import type { GetServerSideProps } from "next";
import { AtelierShell } from "@/components/atelier/AtelierShell";
import { atelierName, isAtelierSession } from "@/lib/atelier";
import { ATELIER_LOGIN } from "@/lib/atelier-guard";

type HousePageProps = {
  door: string;
};

export default function AtelierHousePage({ door }: HousePageProps) {
  const rows = [
    { label: "PUBLIC NAME", value: "UNBOUND" },
    { label: "COLLECTION", value: "001" },
    { label: "PUBLIC EMAIL", value: "hello@unbound.studio" },
    { label: "THE DOOR", value: "/atelier" },
    { label: "THE NAME", value: door || "—" },
    { label: "THE KEY", value: "Held in the house env. Not shown here." },
  ];

  return (
    <>
      <Head>
        <title>House — UNBOUND</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AtelierShell title="HOUSE" kicker="SETTINGS — HOW THE ATELIER STANDS">
        <p className="max-w-md text-sm leading-7 text-mist">
          The public site stays cinematic. The Line is the shop. Orders write The Till.
          Change the door name and key in the house environment — never on the page.
        </p>

        <ul className="mt-14">
          {rows.map((row) => (
            <li
              key={row.label}
              className="flex flex-col gap-2 border-t border-ivory/10 py-6 last:border-b md:flex-row md:items-baseline md:justify-between"
            >
              <p className="text-[10px] tracking-[0.28em] text-mist">{row.label}</p>
              <p className="font-display text-sm tracking-[0.1em] text-ivory md:text-right">
                {row.value}
              </p>
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
  return { props: { door: atelierName() } };
};
