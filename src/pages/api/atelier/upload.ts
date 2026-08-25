import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAtelierApi } from "@/lib/atelier-guard";

export const config = {
  api: { bodyParser: { sizeLimit: "8mb" } },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAtelierApi(req, res)) return;
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const filename = typeof req.body?.filename === "string" ? req.body.filename : "";
  const data = typeof req.body?.data === "string" ? req.body.data : "";
  const match = data.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i);
  if (!match) return res.status(400).json({ error: "Use a JPG, PNG, or WEBP still." });

  const ext = match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "").replace(/\.[^.]+$/, "") || "piece";
  const stamp = Date.now().toString();
  const stored = `${safe.slice(0, 40)}-${stamp}.${ext}`;
  const dir = join(process.cwd(), "public", "shop");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, stored), Buffer.from(match[2], "base64"));
  return res.status(200).json({ ok: true, path: `/shop/${stored}` });
}
