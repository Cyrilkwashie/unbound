import type { NextApiRequest, NextApiResponse } from "next";
import { formatPlaced } from "@/lib/atelier-books";
import { readBooks, writeBooks } from "@/lib/house-store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  if (typeof req.body?.website === "string" && req.body.website.trim()) {
    return res.status(200).json({ ok: true });
  }

  const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "A real email is needed." });
  }

  const books = readBooks();
  if (books.list.some((entry) => entry.mark.toLowerCase() === email || entry.email?.toLowerCase() === email)) {
    return res.status(200).json({ ok: true });
  }

  writeBooks({
    ...books,
    list: [
      {
        mark: email,
        joined: formatPlaced(new Date().toISOString()),
        source: "THE LIST",
        email,
      },
      ...books.list,
    ],
  });
  return res.status(200).json({ ok: true });
}
