import type { NextApiRequest, NextApiResponse } from "next";
import { formatPlaced, nextTicket, type OrderStatus } from "@/lib/atelier-books";
import { requireAtelierApi } from "@/lib/atelier-guard";
import { readBooks, readLine, writeBooks } from "@/lib/house-store";

const STATUSES: OrderStatus[] = ["paid", "cutting", "sent"];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAtelierApi(req, res)) return;
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const productId = typeof req.body?.productId === "string" ? req.body.productId : "";
  const client = typeof req.body?.client === "string" ? req.body.client.trim().toUpperCase() : "";
  const line = readLine();
  const product = line.products.find((item) => item.id === productId);
  if (!product) return res.status(400).json({ error: "Choose a piece from the line." });
  if (!client) return res.status(400).json({ error: "The ticket needs a client." });

  const total = Number(req.body?.total);
  const amount = Number.isFinite(total) && total >= 0 ? total : product.price;
  const status = STATUSES.includes(req.body?.status) ? (req.body.status as OrderStatus) : "paid";
  const placedAt = new Date().toISOString().slice(0, 10);

  const books = readBooks();
  const order = {
    id: nextTicket(books.orders),
    placedAt,
    look: product.look,
    piece: product.name,
    productId: product.id,
    category: product.category,
    client,
    total: amount,
    status,
    source: "manual" as const,
  };

  const list = books.list.some((entry) => entry.mark === client)
    ? books.list
    : [{ mark: client, joined: formatPlaced(placedAt), source: "ORDER" }, ...books.list];

  writeBooks({ ...books, orders: [order, ...books.orders], list });
  return res.status(200).json({ ok: true, id: order.id });
}
