"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

export const Footer = () => {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || joined) return;
    const value = email.trim();
    if (!value) return;
    setBusy(true);
    setError("");
    const response = await fetch("/api/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: value, website: "" }),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Could not join.");
      setBusy(false);
      return;
    }
    setJoined(true);
    setBusy(false);
  };

  return (
    <footer className="border-t border-ivory/10 bg-void-1 px-5 py-20 md:px-10 md:py-28">
      <div className="flex flex-col gap-16 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[10px] tracking-[0.36em] text-mist">UNBOUND</p>
          <p className="mt-6 font-display text-[clamp(2.4rem,8vw,7rem)] font-light leading-none tracking-[0.12em] text-ivory">
            UNBOUND
          </p>
        </div>

        <form className="w-full max-w-md" onSubmit={submit}>
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
              disabled={joined}
              className="w-full bg-transparent pb-3 text-sm text-ivory outline-none placeholder:text-stone disabled:text-mist"
            />
            <button
              type="submit"
              disabled={busy || joined}
              className="pb-3 text-[10px] tracking-[0.28em] text-ivory disabled:text-mist"
              data-cursor="VIEW"
            >
              {joined ? "JOINED" : busy ? "…" : "JOIN"}
            </button>
          </div>
          {error ? <p className="mt-3 text-[11px] tracking-[0.16em] text-mist">{error}</p> : null}
        </form>
      </div>

      <div className="mt-20 flex flex-col gap-6 border-t border-ivory/10 pt-8 text-[10px] tracking-[0.22em] text-mist md:flex-row md:items-center md:justify-between">
        <div className="flex gap-8">
          <Link href="/shop" className="transition-colors duration-500 hover:text-ivory">
            SHOP
          </Link>
          <Link href="/story" className="transition-colors duration-500 hover:text-ivory">
            STORY
          </Link>
          <Link href="/contact" className="transition-colors duration-500 hover:text-ivory">
            CONTACT
          </Link>
        </div>
        <p>© 2026 UNBOUND — ALL RIGHTS RESERVED</p>
      </div>
    </footer>
  );
};
