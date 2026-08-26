"use client";

import { useState } from "react";
import type { Letter } from "@/lib/atelier-books";

type LettersBoardProps = {
  letters: Letter[];
};

export const LettersBoard = ({ letters }: LettersBoardProps) => {
  const [rows, setRows] = useState(letters);
  const unread = rows.filter((letter) => letter.unread).length;

  const patch = async (id: string, unreadState: boolean) => {
    const previous = rows;
    setRows(rows.map((letter) => (letter.id === id ? { ...letter, unread: unreadState } : letter)));
    const response = await fetch("/api/atelier/letter", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id, unread: unreadState }),
    });
    if (!response.ok) setRows(previous);
  };

  const drop = async (id: string) => {
    const previous = rows;
    setRows(rows.filter((letter) => letter.id !== id));
    const response = await fetch("/api/atelier/letter", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id }),
    });
    if (!response.ok) setRows(previous);
  };

  return (
    <div>
      <p className="text-[10px] tracking-[0.28em] text-mist">
        {String(unread).padStart(2, "0")} UNREAD · {String(rows.length).padStart(2, "0")} HELD
      </p>

      {rows.length === 0 ? (
        <p className="mt-20 font-serif text-2xl italic text-ivory/50">Nothing in the post.</p>
      ) : (
        <ul className="mt-12">
          {rows.map((letter) => (
            <li key={letter.id} className="border-t border-ivory/10 py-8 last:border-b">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <p className="text-[10px] tracking-[0.28em] text-mist">
                  {letter.id}
                  {letter.unread ? " · UNREAD" : ""}
                </p>
                <p className="text-[10px] tracking-[0.24em] text-stone">{letter.received}</p>
              </div>
              <h2 className="mt-5 font-display text-xl tracking-[0.12em] text-ivory md:text-2xl">
                {letter.subject}
              </h2>
              <p className="mt-3 text-[11px] tracking-[0.2em] text-mist">
                {letter.from}
                {letter.email ? ` · ${letter.email}` : ""}
              </p>
              <p className="mt-6 max-w-xl text-sm leading-7 text-mist">{letter.body}</p>
              <div className="mt-6 flex flex-wrap gap-8 text-[10px] tracking-[0.24em]">
                {letter.unread ? (
                  <button
                    type="button"
                    onClick={() => void patch(letter.id, false)}
                    className="text-ivory"
                  >
                    MARK READ
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void patch(letter.id, true)}
                    className="text-stone hover:text-mist"
                  >
                    HOLD
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void drop(letter.id)}
                  className="text-stone hover:text-mist"
                >
                  DROP
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
