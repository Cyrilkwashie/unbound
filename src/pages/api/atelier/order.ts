import type { NextApiRequest, NextApiResponse } from "next";
import type { OrderStatus } from "@/lib/atelier-books";
import { requireAtelierApi } from "@/lib/atelier-guard";
import { readBooks, writeBooks } from "@/lib/house-store";

const STATUSES: OrderStatus[] = ["paid", "cutting", "sent"];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAtelierApi(req, res)) return;
  if (req.method !== "PATCH") {
    res.setHeader("Allow", "PATCH");
    return res.status(405).end();
  }

  const id = typeof req.body?.id === "string" ? req.body.id : "";
  const status = STATUSES.includes(req.body?.status) ? (req.body.status as OrderStatus) : null;
  if (!id || !status) return res.status(400).json({ error: "Ticket and status required." });

  const books = readBooks();
  if (!books.orders.some((order) => order.id === id)) {
    return res.status(404).json({ error: "That ticket is not in the book." });
  }

  writeBooks({
    ...books,
    orders: books.orders.map((order) => (order.id === id ? { ...order, status } : order)),
  });
  return res.status(200).json({ ok: true });
}
