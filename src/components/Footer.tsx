"use client";

import { useState } from "react";
import { useLenis } from "@/context/LenisContext";

export const Footer = () => {
  const lenis = useLenis();
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);

  return (
    <footer className="border-t border-ivory/10 bg-void-1 px-5 py-20 md:px-10 md:py-28">
      <div className="flex flex-col gap-16 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] tracking-[0.36em] text-mist">UNBOUND</p>
          <p className="mt-6 font-display text-[clamp(2.4rem,8vw,7rem)] font-light leading-none tracking-[0.12em] text-ivory">
            UNBOUND
          </p>
        </div>

        <form
          className="w-full max-w-md"
          onSubmit={(event) => {
            event.preventDefault();
            if (!email.trim()) return;
            setJoined(true);
          }}
        >
          <label htmlFor="list-email" className="text-[10px] tracking-[0.28em] text-mist">
            ENTER THE LIST
          </label>
          <div className="mt-4 flex items-end gap-4 border-b border-ivory/20">
            <input
              id="list-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Email"
              className="w-full bg-transparent pb-3 text-sm text-ivory outline-none placeholder:text-stone"
            />
            <button
              type="submit"
              className="pb-3 text-[10px] tracking-[0.28em] text-ivory"
              data-cursor="VIEW"
            >
              {joined ? "JOINED" : "JOIN"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-20 flex flex-col gap-6 border-t border-ivory/10 pt-8 text-[10px] tracking-[0.22em] text-mist md:flex-row md:items-center md:justify-between">
        <div className="flex gap-8">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("collection");
              if (el && lenis) lenis.scrollTo(el);
              else el?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            COLLECTION
          </button>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("shop");
              if (el && lenis) lenis.scrollTo(el);
              else el?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            SHOP
          </button>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("story");
              if (el && lenis) lenis.scrollTo(el);
              else el?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            STORY
          </button>
        </div>
        <p>© 2026 UNBOUND — ALL RIGHTS RESERVED</p>
      </div>
    </footer>
  );
};
