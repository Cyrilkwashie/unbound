import type { NextApiRequest, NextApiResponse } from "next";
import { atelierCookie, sessionToken } from "@/lib/atelier";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const givenName = typeof req.body?.name === "string" ? req.body.name.trim() : "";
  const key = typeof req.body?.key === "string" ? req.body.key.trim() : "";
  if (!givenName || !key) {
    return res.status(401).json({ error: "closed" });
  }

  res.setHeader("Set-Cookie", atelierCookie(sessionToken(), req));
  return res.status(200).json({ ok: true });
}
