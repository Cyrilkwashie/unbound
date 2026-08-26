import type { NextApiRequest, NextApiResponse } from "next";
import { requireAtelierApi } from "@/lib/atelier-guard";
import { readLine, writeLine } from "@/lib/house-store";
import { GARMENT_SIZES, isGarmentSize, putStock } from "@/lib/products";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAtelierApi(req, res)) return;
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const productId = typeof req.body?.productId === "string" ? req.body.productId : "";
  const line = readLine();
  const product = line.products.find((item) => item.id === productId);
  if (!product) return res.status(400).json({ error: "Choose a piece from the line." });

  const qtyRaw = Number(req.body?.qty);
  const qty = Number.isFinite(qtyRaw) ? Math.floor(qtyRaw) : 0;
  const allowedSizes = (product.sizes?.length ? product.sizes : [...GARMENT_SIZES]).filter(isGarmentSize);
  const sizeRaw = typeof req.body?.size === "string" ? req.body.size.trim().toUpperCase() : "";
  const size = isGarmentSize(sizeRaw) && allowedSizes.includes(sizeRaw) ? sizeRaw : allowedSizes[0];
  const colorNames = (product.colors ?? []).map((swatch) => swatch.label);
  const colorRaw = typeof req.body?.color === "string" ? req.body.color.trim() : "";
  const color =
    colorNames.find((label) => label.toUpperCase() === colorRaw.toUpperCase()) ??
    colorNames[0] ??
    product.color;

  const put = putStock(product, color, size, qty);
  if ("error" in put) return res.status(400).json({ error: put.error });

  writeLine({
    ...line,
    products: line.products.map((item) => (item.id === product.id ? put : item)),
  });
  return res.status(200).json({ ok: true, onHand: put.stock });
}
