import Head from "next/head";
import Link from "next/link";
import { CampaignStill } from "@/components/CampaignStill";
import { FEATURED_FRAMES } from "@/lib/frames";

const PATHS = [
  { href: "/", label: "HOME" },
  { href: "/shop", label: "SHOP" },
  { href: "/story", label: "STORY" },
  { href: "/contact", label: "CONTACT" },
] as const;

export default function NotFoundPage() {
  return (
    <>
      <Head>
        <title>404 — UNBOUND</title>
        <meta name="description" content="This path does not exist. Return to UNBOUND." />
      </Head>
      <main className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-void-0">
        <div className="absolute inset-0">
          <CampaignStill
            frame={FEATURED_FRAMES.editorial}
            alt=""
            className="h-full w-full object-cover object-center opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void-0 via-void-0/70 to-void-0/40" />
        </div>

        <div className="relative z-10 px-5 pb-16 pt-32 md:px-10 md:pb-20">
          <p className="text-[10px] tracking-[0.4em] text-mist">ERROR — 404</p>
          <h1 className="mt-6 font-display text-[clamp(4.5rem,18vw,14rem)] font-light leading-[0.8] tracking-[0.08em] text-ivory">
            404
          </h1>
          <p className="mt-8 max-w-md font-serif text-2xl italic leading-snug text-ivory md:text-3xl">
            This path was never meant to follow.
          </p>
          <p className="mt-6 max-w-sm text-sm leading-7 text-mist">
            The look does not exist. Return to the house, or enter the shop.
          </p>

          <nav className="mt-14 flex flex-wrap gap-8 text-[11px] tracking-[0.28em] text-ivory">
            {PATHS.map((path) => (
              <Link
                key={path.href}
                href={path.href}
                className="transition-colors duration-500 hover:text-mist"
                data-cursor="VIEW"
              >
                {path.label}
              </Link>
            ))}
          </nav>
        </div>
      </main>
    </>
  );
}
