import { createHmac, timingSafeEqual } from "crypto";
import type { IncomingMessage } from "http";

export const ATELIER_PATH = "/atelier";
export const COOKIE_NAME = "ub_atelier";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SESSION_MARK = "unbound-atelier-session-v1";

export const atelierName = () => process.env.ATELIER_NAME?.trim() ?? "";
export const atelierPassword = () => process.env.ATELIER_PASSWORD?.trim() ?? "";

export const digest = (value: string, mark: string) =>
  createHmac("sha256", value).update(mark).digest("hex");

export const sessionToken = (name: string, password: string) =>
  createHmac("sha256", `${name}:${password}`).update(SESSION_MARK).digest("hex");

export const safeEqual = (left: string, right: string) => {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
};

export const credentialsMatch = (name: string, key: string) => {
  const expectedName = atelierName();
  const expectedKey = atelierPassword();
  if (!expectedName || !expectedKey || !name || !key) return false;
  const nameOk = safeEqual(digest(name, "name"), digest(expectedName, "name"));
  const keyOk = safeEqual(digest(key, "key"), digest(expectedKey, "key"));
  return nameOk && keyOk;
};

export const readAtelierCookie = (req: IncomingMessage) => {
  const header = req.headers.cookie ?? "";
  const match = header.split(";").map((part) => part.trim()).find((part) =>
    part.startsWith(`${COOKIE_NAME}=`)
  );
  return match ? decodeURIComponent(match.slice(COOKIE_NAME.length + 1)) : "";
};

export const isAtelierSession = (req: IncomingMessage) => {
  const name = atelierName();
  const password = atelierPassword();
  if (!name || !password) return false;
  const token = readAtelierCookie(req);
  if (!token) return false;
  return safeEqual(token, sessionToken(name, password));
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
