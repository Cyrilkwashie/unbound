"use client";

import { FormEvent, useState } from "react";
import type { ListName } from "@/lib/atelier-books";

type ListBoardProps = {
  names: ListName[];
};

export const ListBoard = ({ names }: ListBoardProps) => {
  const [rows, setRows] = useState(names);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const add = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const mark = String(data.get("mark") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const response = await fetch("/api/atelier/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ mark, email }),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "The name could not be written.");
      setBusy(false);
      return;
    }
    window.location.reload();
  };

  const drop = async (mark: string) => {
    const previous = rows;
    setRows(rows.filter((entry) => entry.mark !== mark));
    const response = await fetch("/api/atelier/list", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ mark }),
    });
    if (!response.ok) setRows(previous);
  };

  return (
    <div>
      <form className="max-w-xl border-b border-ivory/10 pb-16" onSubmit={add}>
        <p className="text-[10px] tracking-[0.32em] text-mist">ADD A NAME</p>
        <p className="mt-4 max-w-md text-sm leading-7 text-mist">
          People who stay close — a sale, a walk-in, or ENTER THE LIST on the public site.
        </p>

        <label className="mt-10 block text-[10px] tracking-[0.32em] text-mist" htmlFor="list-mark">
          NAME
        </label>
        <input
          id="list-mark"
          name="mark"
          required
          placeholder="A. MOREAU"
          className="mt-4 w-full border-b border-ivory/20 bg-transparent pb-3 text-sm tracking-[0.12em] text-ivory outline-none"
        />

        <label className="mt-10 block text-[10px] tracking-[0.32em] text-mist" htmlFor="list-email">
          EMAIL
        </label>
        <input
          id="list-email"
          name="email"
          type="email"
          placeholder="Optional"
          className="mt-4 w-full border-b border-ivory/20 bg-transparent pb-3 text-sm text-ivory outline-none"
        />

        {error ? <p className="mt-6 text-sm leading-7 text-mist">{error}</p> : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-12 inline-flex items-center gap-3 text-[10px] tracking-[0.28em] text-ivory disabled:text-mist"
          data-cursor="VIEW"
        >
          {busy ? "WRITING" : "PUT ON THE LIST"}
          <span className="block h-px w-8 bg-ivory/70" />
        </button>
      </form>

      <p className="mt-12 text-[10px] tracking-[0.28em] text-mist">
        {String(rows.length).padStart(2, "0")} NAMES
      </p>

      {rows.length === 0 ? (
        <p className="mt-20 font-serif text-2xl italic text-ivory/50">The list is empty.</p>
      ) : (
        <ul className="mt-10">
          {rows.map((entry) => (
            <li
              key={entry.mark}
              className="grid grid-cols-2 gap-3 border-t border-ivory/10 py-6 last:border-b md:grid-cols-4"
            >
              <p className="font-display text-sm tracking-[0.14em] text-ivory">{entry.mark}</p>
              <p className="text-[11px] tracking-[0.2em] text-mist">{entry.joined}</p>
              <p className="col-span-2 text-[10px] tracking-[0.24em] text-stone md:col-span-1">
                {entry.source}
                {entry.email ? ` · ${entry.email}` : ""}
              </p>
              <button
                type="button"
                onClick={() => void drop(entry.mark)}
                className="col-span-2 text-left text-[10px] tracking-[0.24em] text-stone hover:text-mist md:col-span-1 md:text-right"
              >
                DROP
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
