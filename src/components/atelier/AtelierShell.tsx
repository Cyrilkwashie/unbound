"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/router";

export const ATELIER_NAV = [
  { href: "/atelier/desk", label: "DESK", hint: "Overview" },
  { href: "/atelier/line", label: "THE LINE", hint: "Add & edit products" },
  { href: "/atelier/till", label: "THE TILL", hint: "Sales & revenue" },
  { href: "/atelier/orders", label: "ORDERS", hint: "Sales & tickets" },
  { href: "/atelier/list", label: "THE LIST", hint: "Clients" },
  { href: "/atelier/letters", label: "LETTERS", hint: "Messages" },
  { href: "/atelier/house", label: "HOUSE", hint: "Settings" },
] as const;

type AtelierShellProps = {
  title: string;
  kicker: string;
  children: ReactNode;
};

export const AtelierShell = ({ title, kicker, children }: AtelierShellProps) => {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const leave = async () => {
    if (leaving) return;
    setLeaving(true);
    await fetch("/api/atelier/leave", { method: "POST", credentials: "same-origin" });
    window.location.assign("/atelier");
  };

  const nav = (
    <nav className="flex flex-col gap-5" aria-label="Atelier">
      {ATELIER_NAV.map((item) => {
        const active = router.pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            className={`flex flex-col gap-1 ${
              active ? "text-ivory" : "text-mist hover:text-ivory"
            }`}
            data-cursor="VIEW"
          >
            <span className="text-[11px] tracking-[0.28em]">{item.label}</span>
            <span className={`text-[9px] tracking-[0.2em] ${active ? "text-mist" : "text-stone"}`}>
              {item.hint}
            </span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-[100svh] bg-void-0 text-ivory">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-ivory/10 bg-void-1 px-7 py-8 lg:flex">
        <p className="font-display text-[11px] tracking-[0.42em]">UNBOUND</p>
        <p className="mt-3 text-[10px] tracking-[0.32em] text-mist">THE ATELIER</p>
        <div className="mt-14 flex-1">{nav}</div>
        <button
          type="button"
          onClick={leave}
          disabled={leaving}
          className="text-left text-[10px] tracking-[0.28em] text-mist transition-colors duration-500 hover:text-ivory disabled:text-stone"
          data-cursor="VIEW"
        >
          {leaving ? "LEAVING" : "LEAVE"}
        </button>
      </aside>

      <header className="sticky top-0 z-40 border-b border-ivory/10 bg-void-0/90 px-5 py-4 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between">
          <p className="font-display text-[11px] tracking-[0.42em]">UNBOUND</p>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="text-[10px] tracking-[0.28em] text-ivory"
            aria-expanded={menuOpen}
          >
            {menuOpen ? "CLOSE" : "MENU"}
          </button>
        </div>
        {menuOpen ? (
          <div className="mt-8 pb-4">
            {nav}
            <button
              type="button"
              onClick={leave}
              disabled={leaving}
              className="mt-8 text-[10px] tracking-[0.28em] text-mist"
            >
              {leaving ? "LEAVING" : "LEAVE"}
            </button>
          </div>
        ) : null}
      </header>

      <main className="px-5 py-10 md:px-10 md:py-14 lg:ml-64 lg:px-16 lg:py-16">
        <p className="text-[10px] tracking-[0.36em] text-mist">{kicker}</p>
        <h1 className="mt-5 font-display text-[clamp(2rem,5vw,4.4rem)] font-light leading-[0.92] tracking-[0.12em]">
          {title}
        </h1>
        <div className="editorial-line mt-8 w-16" />
        <div className="mt-12 md:mt-16">{children}</div>
      </main>
    </div>
  );
};
