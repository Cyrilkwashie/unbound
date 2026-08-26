import { existsSync, mkdirSync, writeFileSync } from "fs";
import { join } from "path";
import type { NextApiRequest, NextApiResponse } from "next";
import { requireAtelierApi } from "@/lib/atelier-guard";

export const config = {
  api: { bodyParser: { sizeLimit: "8mb" } },
};

const MAX_BYTES = 8 * 1024 * 1024;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!requireAtelierApi(req, res)) return;
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const filename = typeof req.body?.filename === "string" ? req.body.filename : "";
  const data = typeof req.body?.data === "string" ? req.body.data : "";
  const url = typeof req.body?.url === "string" ? req.body.url.trim() : "";

  if (url) {
    const pulled = await pullStill(url);
    if ("error" in pulled) return res.status(400).json({ error: pulled.error });
    return res.status(200).json({ ok: true, path: storeStill(pulled.buffer, pulled.ext, pulled.name) });
  }

  const match = data.match(/^data:image\/(jpeg|jpg|png|webp);base64,(.+)$/i);
  if (!match) return res.status(400).json({ error: "Use a JPG, PNG, or WEBP still — from the device or a link." });

  const ext = match[1].toLowerCase() === "jpeg" ? "jpg" : match[1].toLowerCase();
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > MAX_BYTES) return res.status(400).json({ error: "The still is too large." });
  return res.status(200).json({ ok: true, path: storeStill(buffer, ext, filename) });
}

const storeStill = (buffer: Buffer, ext: string, filename: string) => {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "").replace(/\.[^.]+$/, "") || "piece";
  const stored = `${safe.slice(0, 40)}-${Date.now()}.${ext}`;
  const dir = join(process.cwd(), "public", "shop");
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, stored), buffer);
  return `/shop/${stored}`;
};

const sniff = (buffer: Buffer): "jpg" | "png" | "webp" | null => {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return "jpg";
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) return "png";
  if (buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") {
    return "webp";
  }
  return null;
};

const isPrivateHost = (hostname: string) => {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host === "::1" || host === "0.0.0.0" || host.endsWith(".local")) {
    return true;
  }
  if (host === "169.254.169.254") return true;
  const parts = host.split(".").map(Number);
  if (parts.length === 4 && parts.every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) {
    const [a, b] = parts;
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
  }
  return false;
};

const publicHttpUrl = (raw: string) => {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
  if (isPrivateHost(parsed.hostname)) return null;
  return parsed;
};

const pullStill = async (
  raw: string
): Promise<{ buffer: Buffer; ext: string; name: string } | { error: string }> => {
  let current = raw;
  let response: Response | null = null;
  for (let hop = 0; hop < 4; hop += 1) {
    const parsed = publicHttpUrl(current);
    if (!parsed) return { error: "That link cannot be used." };
    try {
      response = await fetch(parsed, {
        redirect: "manual",
        signal: AbortSignal.timeout(15000),
        headers: { Accept: "image/jpeg,image/png,image/webp,image/*;q=0.8" },
      });
    } catch {
      return { error: "The still could not be pulled from that link." };
    }
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) return { error: "The still could not be pulled from that link." };
      current = new URL(location, parsed).href;
      continue;
    }
    break;
  }

  if (!response || !response.ok) return { error: "The still could not be pulled from that link." };
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > MAX_BYTES) return { error: "The still is too large." };
  const ext = sniff(buffer);
  if (!ext) return { error: "Use a JPG, PNG, or WEBP still." };
  const name = decodeURIComponent(new URL(current).pathname.split("/").pop() || "piece");
  return { buffer, ext, name };
};
