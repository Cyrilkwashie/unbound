"use client";

import { FormEvent, useState } from "react";

const COPY: Record<string, string> = {
  closed: "The door stays closed.",
  sealed: "The door is sealed.",
  locked: "Wait.",
};

export const AtelierLogin = () => {
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !key.trim() || busy) return;
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/atelier/enter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name: name.trim(), key }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(COPY[payload?.error ?? ""] ?? COPY.closed);
        setBusy(false);
        return;
      }

      window.location.assign("/atelier/desk");
    } catch {
      setError(COPY.closed);
      setBusy(false);
    }
  };

  return (
    <form className="w-full max-w-md" onSubmit={submit}>
      <label htmlFor="atelier-name" className="text-[10px] tracking-[0.32em] text-mist">
        THE NAME
      </label>
      <input
        id="atelier-name"
        type="text"
        autoFocus
        autoComplete="username"
        autoCapitalize="none"
        spellCheck={false}
        value={name}
        onChange={(event) => setName(event.target.value)}
        className="mt-4 w-full border-b border-ivory/20 bg-transparent pb-3 text-sm tracking-[0.12em] text-ivory outline-none"
      />

      <label htmlFor="atelier-key" className="mt-10 block text-[10px] tracking-[0.32em] text-mist">
        THE KEY
      </label>
      <input
        id="atelier-key"
        type="password"
        autoComplete="current-password"
        value={key}
        onChange={(event) => setKey(event.target.value)}
        className="mt-4 w-full border-b border-ivory/20 bg-transparent pb-3 text-sm tracking-[0.12em] text-ivory outline-none"
      />

      <button
        type="submit"
        disabled={busy}
        className="mt-12 inline-flex items-center gap-3 text-[10px] tracking-[0.28em] text-ivory disabled:text-mist"
        data-cursor="VIEW"
      >
        {busy ? "ENTERING" : "ENTER"}
        <span className="block h-px w-8 bg-ivory/70" />
      </button>

      {error ? <p className="mt-6 text-sm leading-7 text-mist">{error}</p> : null}
    </form>
  );
};
