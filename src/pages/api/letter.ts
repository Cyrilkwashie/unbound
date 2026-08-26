import type { NextApiRequest, NextApiResponse } from "next";
import { formatPlaced, nextLetter } from "@/lib/atelier-books";
import { readBooks, writeBooks } from "@/lib/house-store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  if (typeof req.body?.website === "string" && req.body.website.trim()) {
    return res.status(200).json({ ok: true });
  }

  const from = typeof req.body?.from === "string" ? req.body.from.trim() : "";
  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  const subject = typeof req.body?.subject === "string" ? req.body.subject.trim() : "";
  const body = typeof req.body?.body === "string" ? req.body.body.trim() : "";

  if (!from) return res.status(400).json({ error: "A name is needed." });
  if (!body) return res.status(400).json({ error: "The letter is empty." });
  if (body.length > 2000) return res.status(400).json({ error: "Keep the letter shorter." });

  const books = readBooks();
  const letter = {
    id: nextLetter(books.letters),
    from,
    received: formatPlaced(new Date().toISOString()),
    subject: subject || "A letter",
    body,
    unread: true,
    email: email || undefined,
  };

  writeBooks({ ...books, letters: [letter, ...books.letters] });
  return res.status(200).json({ ok: true });
}
