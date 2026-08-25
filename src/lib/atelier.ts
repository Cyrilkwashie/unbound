import { createHmac, timingSafeEqual } from "crypto";
import type { IncomingMessage } from "http";

export const ATELIER_PATH = "/atelier";
export const COOKIE_NAME = "ub_atelier";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SESSION_MARK = "unbound-atelier-session-v1";
/** Temporary open door while Vercel has no env key. */
const OPEN_SECRET = "unbound-atelier-open-door";

export const atelierName = () => process.env.ATELIER_NAME?.trim() ?? "";
export const atelierPassword = () => process.env.ATELIER_PASSWORD?.trim() ?? "";

export const doorSecret = () => {
  const name = atelierName();
  const password = atelierPassword();
  if (name && password) return `${name}:${password}`;
  return OPEN_SECRET;
};

export const sessionToken = () =>
  createHmac("sha256", doorSecret()).update(SESSION_MARK).digest("hex");

export const safeEqual = (left: string, right: string) => {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
};

export const readAtelierCookie = (req: IncomingMessage) => {
  const header = req.headers.cookie ?? "";
  const match = header.split(";").map((part) => part.trim()).find((part) =>
    part.startsWith(`${COOKIE_NAME}=`)
  );
  return match ? decodeURIComponent(match.slice(COOKIE_NAME.length + 1)) : "";
};

export const isAtelierSession = (req: IncomingMessage) => {
  const token = readAtelierCookie(req);
  if (!token) return false;
  return safeEqual(token, sessionToken());
};

export const atelierCookie = (token: string, req: IncomingMessage, clear = false) => {
  const host = req.headers.host ?? "";
  const proto = String(req.headers["x-forwarded-proto"] ?? "");
  const local = host.includes("localhost") || host.startsWith("127.");
  const secure = !local && (proto === "https" || process.env.NODE_ENV === "production");
  const base = `${COOKIE_NAME}=${clear ? "" : token}; HttpOnly; Path=/; SameSite=Lax`;
  if (clear) return `${base}; Max-Age=0${secure ? "; Secure" : ""}`;
  return `${base}; Max-Age=${COOKIE_MAX_AGE}${secure ? "; Secure" : ""}`;
};
