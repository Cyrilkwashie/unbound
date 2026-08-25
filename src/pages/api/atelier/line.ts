import type { NextApiRequest, NextApiResponse } from "next";
import { requireAtelierApi } from "@/lib/atelier-guard";
import { productFromPayload } from "@/lib/atelier-line";
import { nextLook, slugify } from "@/lib/products";
import { readLine, writeLine } from "@/lib/house-store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAtelierApi(req, res)) return;

  if (req.method === "POST") {
    const line = readLine();
    const parsed = productFromPayload(req.body ?? {}, { look: nextLook(line.products) });
    if ("error" in parsed) return res.status(400).json({ error: parsed.error });

    let id = parsed.id;
    if (line.products.some((item) => item.id === id)) id = `${id}-${Date.now().toString().slice(-4)}`;
    const product = { ...parsed, id: slugify(id) };
    const featuredIds = req.body?.featured
      ? [...line.featuredIds.filter((item) => item !== product.id), product.id].slice(-2)
      : line.featuredIds;
    writeLine({ products: [...line.products, product], featuredIds });
    return res.status(200).json({ ok: true, id: product.id });
  }

  if (req.method === "PUT") {
    const id = typeof req.body?.id === "string" ? req.body.id : "";
    const line = readLine();
    const current = line.products.find((item) => item.id === id);
    if (!current) return res.status(404).json({ error: "That piece is not on the line." });

    const parsed = productFromPayload(req.body ?? {}, { id: current.id, look: current.look });
    if ("error" in parsed) return res.status(400).json({ error: parsed.error });

    const products = line.products.map((item) => (item.id === id ? { ...parsed, id } : item));
    let featuredIds = line.featuredIds.filter((item) => item !== id);
    if (req.body?.featured) featuredIds = [...featuredIds, id].slice(-2);
    writeLine({ products, featuredIds });
    return res.status(200).json({ ok: true, id });
  }

  if (req.method === "DELETE") {
    const id = typeof req.body?.id === "string" ? req.body.id : "";
    const line = readLine();
    if (!line.products.some((item) => item.id === id)) {
      return res.status(404).json({ error: "That piece is not on the line." });
    }
    writeLine({
      products: line.products.filter((item) => item.id !== id),
      featuredIds: line.featuredIds.filter((item) => item !== id),
    });
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "POST, PUT, DELETE");
  return res.status(405).end();
}
