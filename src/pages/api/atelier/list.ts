import type { NextApiRequest, NextApiResponse } from "next";
import { formatPlaced } from "@/lib/atelier-books";
import { requireAtelierApi } from "@/lib/atelier-guard";
import { readBooks, writeBooks } from "@/lib/house-store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAtelierApi(req, res)) return;

  if (req.method === "POST") {
    const mark = typeof req.body?.mark === "string" ? req.body.mark.trim() : "";
    const email = typeof req.body?.email === "string" ? req.body.email.trim() : "";
    if (!mark) return res.status(400).json({ error: "The list needs a name." });
    const stored = mark.includes("@") ? mark.toLowerCase() : mark.toUpperCase();
    const books = readBooks();
    if (books.list.some((entry) => entry.mark.toUpperCase() === stored.toUpperCase())) {
      return res.status(400).json({ error: "That name is already on the list." });
    }
    writeBooks({
      ...books,
      list: [
        {
          mark: stored,
          joined: formatPlaced(new Date().toISOString()),
          source: "THE LIST",
          email: email || undefined,
        },
        ...books.list,
      ],
    });
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    const mark = typeof req.body?.mark === "string" ? req.body.mark.trim() : "";
    if (!mark) return res.status(400).json({ error: "Choose a name to drop." });
    const books = readBooks();
    const key = mark.toUpperCase();
    writeBooks({
      ...books,
      list: books.list.filter((entry) => entry.mark.toUpperCase() !== key),
    });
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "POST, DELETE");
  return res.status(405).end();
}
