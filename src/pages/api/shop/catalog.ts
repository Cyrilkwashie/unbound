import type { NextApiRequest, NextApiResponse } from "next";
import { availableFrom } from "@/lib/products";
import { readLine } from "@/lib/house-store";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).end();
  }

  const products = availableFrom(readLine().products).map((product) => ({
    id: product.id,
    name: product.name,
  }));
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ products });
}
