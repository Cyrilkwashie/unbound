"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useBag } from "@/context/BagContext";
import { useLenis } from "@/context/LenisContext";
import { useFrameSequence } from "@/context/FrameSequenceContext";

const NAV_LINKS = [
  { href: "#shop", label: "SHOP" },
  { href: "#collection", label: "COLLECTION" },
  { href: "#story", label: "STORY" },
] as const;

export const Navbar = () => {
  const { items, openBag, toggleBag } = useBag();
  const { isReady } = useFrameSequence();
  const lenis = useLenis();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || 0;
      setScrolled(y > 24);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen || searchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen, searchOpen]);

  const goTo = (href: string) => {
    setMenuOpen(false);
    const el = document.querySelector(href);
    if (el instanceof HTMLElement) {
      if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 });
      else el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-[background,backdrop-filter,border-color] duration-700 ease-cinematic ${
          scrolled
            ? "border-b border-ivory/10 bg-void-0/55 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        } ${isReady ? "opacity-100" : "opacity-0"}`}
      >
        <nav className="grid grid-cols-3 items-center px-5 py-5 md:px-10">
          <a
            href="#top"
            onClick={(event) => {
              event.preventDefault();
              if (lenis) lenis.scrollTo(0, { duration: 1.4 });
              else window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="justify-self-start font-display text-[11px] tracking-[0.42em] text-ivory"
            data-cursor="VIEW"
          >
            UNBOUND
          </a>

          <ul className="hidden justify-self-center gap-10 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <button
                  type="button"
                  onClick={() => goTo(link.href)}
                  className="text-[10px] tracking-[0.28em] text-ivory/80 transition-colors duration-500 hover:text-ivory"
                  data-cursor="VIEW"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center justify-self-end gap-6">
            <button
              type="button"
              className="hidden text-[10px] tracking-[0.28em] text-ivory/80 transition-colors duration-500 hover:text-ivory md:inline"
              onClick={() => setSearchOpen(true)}
              data-cursor="VIEW"
            >
              SEARCH
            </button>
            <button
              type="button"
              className="relative text-[10px] tracking-[0.28em] text-ivory/80 transition-colors duration-500 hover:text-ivory"
              onClick={openBag}
              data-cursor="SHOP"
              aria-label={`Bag, ${items.length} items`}
            >
              BAG
              <span className="ml-2 text-mist">{String(items.length).padStart(2, "0")}</span>
            </button>
            <button
              type="button"
              className="md:hidden"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className="flex h-4 w-6 flex-col justify-between">
                <span className={`h-px w-full bg-ivory transition-transform duration-500 ${menuOpen ? "translate-y-[7.5px] rotate-45" : ""}`} />
                <span className={`h-px w-full bg-ivory transition-opacity duration-300 ${menuOpen ? "opacity-0" : "opacity-100"}`} />
                <span className={`h-px w-full bg-ivory transition-transform duration-500 ${menuOpen ? "-translate-y-[7.5px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-end bg-void-0 px-6 pb-16 pt-28 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex flex-col gap-7">
              {NAV_LINKS.map((link, index) => (
                <motion.button
                  key={link.href}
                  type="button"
                  onClick={() => goTo(link.href)}
                  className="text-left font-display text-4xl tracking-[0.12em] text-ivory"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * index, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  {link.label}
                </motion.button>
              ))}
              <button
                type="button"
                className="mt-4 text-left text-[11px] tracking-[0.28em] text-mist"
                onClick={() => {
                  setMenuOpen(false);
                  setSearchOpen(true);
                }}
              >
                SEARCH
              </button>
              <button
                type="button"
                className="text-left text-[11px] tracking-[0.28em] text-mist"
                onClick={() => {
                  setMenuOpen(false);
                  toggleBag();
                }}
              >
                BAG / {String(items.length).padStart(2, "0")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-end bg-void-0/88 px-6 py-16 backdrop-blur-md md:items-center md:px-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-full max-w-3xl">
              <p className="mb-6 text-[10px] tracking-[0.32em] text-mist">SEARCH THE HOUSE</p>
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Baggy top, cargo, Collection"
                className="w-full border-b border-ivory/25 bg-transparent pb-4 font-serif text-3xl italic text-ivory outline-none placeholder:text-ivory/25 md:text-5xl"
                aria-label="Search"
              />
              <p className="mt-8 max-w-md text-sm leading-7 text-mist">
                {query.trim()
                  ? "Collection 001 currently holds the Darkness Baggy Top and baggy cargos."
                  : "Type a garment, look, or chapter."}
              </p>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="mt-12 text-[10px] tracking-[0.32em] text-ivory"
                data-cursor="VIEW"
              >
                CLOSE
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
