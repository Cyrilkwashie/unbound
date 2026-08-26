"use client";

import { FormEvent, useState } from "react";

export const ContactForm = () => {
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || sent) return;
    setBusy(true);
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const response = await fetch("/api/letter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from: data.get("from"),
        email: data.get("email"),
        subject: data.get("subject"),
        body: data.get("body"),
        website: data.get("website"),
      }),
    });
    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "The letter could not be sent.");
      setBusy(false);
      return;
    }
    setSent(true);
    setBusy(false);
    form.reset();
  };

  if (sent) {
    return (
      <p className="font-serif text-2xl italic text-ivory md:text-3xl">The letter is with the house.</p>
    );
  }

  return (
    <form className="max-w-xl" onSubmit={submit}>
      <p className="text-[10px] tracking-[0.32em] text-mist">WRITE THE HOUSE</p>

      <label className="mt-10 block text-[10px] tracking-[0.32em] text-mist" htmlFor="letter-from">
        NAME
      </label>
      <input
        id="letter-from"
        name="from"
        required
        className="mt-4 w-full border-b border-ivory/20 bg-transparent pb-3 text-sm tracking-[0.12em] text-ivory outline-none"
      />

      <label className="mt-10 block text-[10px] tracking-[0.32em] text-mist" htmlFor="letter-email">
        EMAIL
      </label>
      <input
        id="letter-email"
        name="email"
        type="email"
        className="mt-4 w-full border-b border-ivory/20 bg-transparent pb-3 text-sm text-ivory outline-none"
      />

      <label className="mt-10 block text-[10px] tracking-[0.32em] text-mist" htmlFor="letter-subject">
        SUBJECT
      </label>
      <input
        id="letter-subject"
        name="subject"
        placeholder="Stockist, press, a piece"
        className="mt-4 w-full border-b border-ivory/20 bg-transparent pb-3 text-sm text-ivory outline-none"
      />

      <label className="sr-only" htmlFor="letter-website">
        Website
      </label>
      <input id="letter-website" name="website" tabIndex={-1} autoComplete="off" className="hidden" />

      <label className="mt-10 block text-[10px] tracking-[0.32em] text-mist" htmlFor="letter-body">
        LETTER
      </label>
      <textarea
        id="letter-body"
        name="body"
        required
        rows={5}
        className="mt-4 w-full resize-none border-b border-ivory/20 bg-transparent pb-3 text-sm leading-7 text-ivory outline-none"
      />

      {error ? <p className="mt-6 text-sm leading-7 text-mist">{error}</p> : null}

      <button
        type="submit"
        disabled={busy}
        className="mt-12 inline-flex items-center gap-3 text-[10px] tracking-[0.28em] text-ivory disabled:text-mist"
        data-cursor="VIEW"
      >
        {busy ? "SENDING" : "SEND"}
        <span className="block h-px w-8 bg-ivory/70" />
      </button>
    </form>
  );
};
