import type { NextApiRequest, NextApiResponse } from "next";
import {
  SALE_CHANNELS,
  clientMark,
  formatPlaced,
  nextTicket,
  ticketTotal,
  type OrderLine,
  type OrderStatus,
  type SaleChannel,
} from "@/lib/atelier-books";
import { requireAtelierApi } from "@/lib/atelier-guard";
import { readBooks, readLine, writeBooks, writeLine } from "@/lib/house-store";
import {
  GARMENT_SIZES,
  isGarmentSize,
  takeStock,
  type CatalogProduct,
} from "@/lib/products";

const STATUSES: OrderStatus[] = ["paid", "cutting", "sent"];

const parseLines = (raw: unknown, products: CatalogProduct[]): OrderLine[] | { error: string } => {
  const rows = Array.isArray(raw) ? raw : [];
  if (rows.length === 0) return { error: "Add a piece to the ticket." };
  const built: OrderLine[] = [];
  for (const row of rows) {
    const productId = typeof row?.productId === "string" ? row.productId : "";
    const product = products.find((item) => item.id === productId);
    if (!product) return { error: "Choose a piece from the line." };
    const qtyRaw = Number(row?.qty);
    const qty = Number.isFinite(qtyRaw) && qtyRaw >= 1 ? Math.floor(qtyRaw) : 1;
    const allowedSizes = (product.sizes?.length ? product.sizes : [...GARMENT_SIZES]).filter(isGarmentSize);
    const sizeRaw = typeof row?.size === "string" ? row.size.trim().toUpperCase() : "";
    const size = isGarmentSize(sizeRaw) && allowedSizes.includes(sizeRaw) ? sizeRaw : allowedSizes[0];
    const colorNames = (product.colors ?? []).map((swatch) => swatch.label);
    const colorRaw = typeof row?.color === "string" ? row.color.trim() : "";
    const color =
      colorNames.find((label) => label.toUpperCase() === colorRaw.toUpperCase()) ??
      colorNames[0] ??
      product.color;
    built.push({
      productId: product.id,
      look: product.look,
      piece: product.name,
      category: product.category,
      color,
      size,
      qty,
      unit: product.price,
    });
  }
  return built;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAtelierApi(req, res)) return;
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const client = clientMark(typeof req.body?.client === "string" ? req.body.client : "");
  if (!client) return res.status(400).json({ error: "The ticket needs a client." });

  const catalog = readLine();
  const parsed = parseLines(req.body?.lines, catalog.products);
  if ("error" in parsed) return res.status(400).json({ error: parsed.error });

  let products = catalog.products;
  for (const row of parsed) {
    const product = products.find((item) => item.id === row.productId);
    if (!product) return res.status(400).json({ error: "Choose a piece from the line." });
    if (!isGarmentSize(row.size)) return res.status(400).json({ error: `${row.piece} needs a size.` });
    const taken = takeStock(product, row.color, row.size, row.qty);
    if ("error" in taken) {
      return res.status(400).json({ error: `${row.piece} — ${taken.error}` });
    }
    products = products.map((item) => (item.id === product.id ? taken : item));
  }

  const status = STATUSES.includes(req.body?.status) ? (req.body.status as OrderStatus) : "paid";
  const placedAt = new Date().toISOString().slice(0, 10);
  const channelRaw = typeof req.body?.channel === "string" ? req.body.channel.trim().toLowerCase() : "";
  const channel: SaleChannel = SALE_CHANNELS.includes(channelRaw as SaleChannel)
    ? (channelRaw as SaleChannel)
    : "till";
  const note = typeof req.body?.note === "string" ? req.body.note.trim() : "";
  const contact = typeof req.body?.contact === "string" ? req.body.contact.trim() : "";
  const first = parsed[0];

  const books = readBooks();
  const order = {
    id: nextTicket(books.orders),
    placedAt,
    client,
    total: ticketTotal(parsed),
    status,
    source: "manual" as const,
    lines: parsed,
    look: first.look,
    piece: first.piece,
    productId: first.productId,
    category: first.category,
    color: first.color,
    size: first.size,
    qty: parsed.reduce((sum, line) => sum + line.qty, 0),
    channel,
    note: note || undefined,
    contact: contact || undefined,
  };

  const known = books.list.find((entry) => entry.mark.toUpperCase() === client.toUpperCase());
  const list = known
    ? books.list.map((entry) =>
        entry.mark.toUpperCase() === client.toUpperCase() && contact && !entry.email
          ? { ...entry, email: contact }
          : entry
      )
    : [{ mark: client, joined: formatPlaced(placedAt), source: "ORDER", email: contact || undefined }, ...books.list];

  writeLine({ ...catalog, products });
  writeBooks({ ...books, orders: [order, ...books.orders], list });
  return res.status(200).json({ ok: true, id: order.id });
}
