import type { NextApiRequest, NextApiResponse } from "next";
import { requireAtelierApi } from "@/lib/atelier-guard";
import { readBooks, writeBooks } from "@/lib/house-store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAtelierApi(req, res)) return;

  if (req.method === "PATCH") {
    const id = typeof req.body?.id === "string" ? req.body.id : "";
    if (!id) return res.status(400).json({ error: "Choose a letter." });
    const books = readBooks();
    if (!books.letters.some((letter) => letter.id === id)) {
      return res.status(404).json({ error: "That letter is not in the post." });
    }
    const unread = req.body?.unread === true;
    writeBooks({
      ...books,
      letters: books.letters.map((letter) => (letter.id === id ? { ...letter, unread } : letter)),
    });
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    const id = typeof req.body?.id === "string" ? req.body.id : "";
    if (!id) return res.status(400).json({ error: "Choose a letter." });
    const books = readBooks();
    writeBooks({ ...books, letters: books.letters.filter((letter) => letter.id !== id) });
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "PATCH, DELETE");
  return res.status(405).end();
}
