import Head from "next/head";
import Link from "next/link";

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
      <main className="flex min-h-[100svh] flex-col items-center justify-center bg-void-0 px-5 py-28 text-center">
        <p className="text-[10px] tracking-[0.4em] text-mist">ERROR — 404</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/404-hanger.png"
          alt="Empty hanger. Nothing to wear here."
          className="mt-10 w-full max-w-[220px] object-contain md:max-w-[280px]"
        />
        <p className="mt-10 max-w-md font-serif text-2xl italic leading-snug text-ivory md:text-3xl">
          Nothing on the rail.
        </p>
        <p className="mt-5 max-w-sm text-sm leading-7 text-mist">
          This path does not exist. Return to the house, or enter the shop.
        </p>
        <nav className="mt-12 flex flex-wrap justify-center gap-8 text-[11px] tracking-[0.28em] text-ivory">
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
      </main>
    </>
  );
}
