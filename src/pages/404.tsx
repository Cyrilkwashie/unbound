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
      <main className="flex min-h-[100svh] flex-col items-center justify-center bg-void-0 px-5 text-center">
        <p className="text-[10px] tracking-[0.4em] text-mist">ERROR — 404</p>
        <h1 className="mt-8 font-display text-[clamp(4.5rem,18vw,14rem)] font-light leading-[0.8] tracking-[0.08em] text-ivory">
          404
        </h1>
        <div className="editorial-line mx-auto mt-10 w-16" />
        <p className="mt-10 max-w-md font-serif text-2xl italic leading-snug text-ivory md:text-3xl">
          This path was never meant to follow.
        </p>
        <p className="mt-6 max-w-sm text-sm leading-7 text-mist">
          The look does not exist. Return to the house, or enter the shop.
        </p>
        <nav className="mt-14 flex flex-wrap justify-center gap-8 text-[11px] tracking-[0.28em] text-ivory">
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
