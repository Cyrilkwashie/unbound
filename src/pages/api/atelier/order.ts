import type { NextApiRequest, NextApiResponse } from "next";
import { LIVE_STATUSES, orderLines, type OrderStatus } from "@/lib/atelier-books";
import { requireAtelierApi } from "@/lib/atelier-guard";
import { readBooks, readLine, writeBooks, writeLine } from "@/lib/house-store";
import { isGarmentSize, putStock } from "@/lib/products";

const STATUSES: OrderStatus[] = ["paid", "cutting", "sent", "void"];

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
  const order = books.orders.find((item) => item.id === id);
  if (!order) return res.status(404).json({ error: "That ticket is not in the book." });
  if (order.status === "void") {
    return res.status(400).json({ error: "A voided ticket stays void." });
  }

  if (status === "void") {
    const catalog = readLine();
    let products = catalog.products;
    for (const row of orderLines(order)) {
      const product = products.find((item) => item.id === row.productId);
      if (!product || !isGarmentSize(row.size)) continue;
      const restored = putStock(product, row.color || product.color, row.size, row.qty);
      if (!("error" in restored)) {
        products = products.map((item) => (item.id === product.id ? restored : item));
      }
    }
    writeLine({ ...catalog, products });
  } else if (!LIVE_STATUSES.includes(status)) {
    return res.status(400).json({ error: "Unknown status." });
  }

  writeBooks({
    ...books,
    orders: books.orders.map((item) => (item.id === id ? { ...item, status } : item)),
  });
  return res.status(200).json({ ok: true });
}
