import type { NextApiRequest, NextApiResponse } from "next";
import {
  atelierCookie,
  atelierName,
  atelierPassword,
  credentialsMatch,
  sessionToken,
} from "@/lib/atelier";

const WINDOW_MS = 60_000;
const MAX_TRIES = 8;
const attempts = new Map<string, { count: number; resetAt: number }>();

const clientKey = (req: NextApiRequest) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0]?.trim() || "local";
  }
  return req.socket.remoteAddress ?? "local";
};

const locked = (req: NextApiRequest) => {
  const id = clientKey(req);
  const now = Date.now();
  const current = attempts.get(id);
  if (!current || now > current.resetAt) {
    attempts.set(id, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_TRIES;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).end();
  }

  const name = atelierName();
  const password = atelierPassword();
  if (!name || !password) {
    return res.status(503).json({ error: "sealed" });
  }

  if (locked(req)) {
    return res.status(429).json({ error: "locked" });
  }

  const givenName = typeof req.body?.name === "string" ? req.body.name : "";
  const key = typeof req.body?.key === "string" ? req.body.key : "";
  if (!credentialsMatch(givenName, key)) {
    return res.status(401).json({ error: "closed" });
  }

  attempts.delete(clientKey(req));
  res.setHeader("Set-Cookie", atelierCookie(sessionToken(name, password), req));
  return res.status(200).json({ ok: true });
}
