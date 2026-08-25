import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { dirname, join } from "path";
import { SEED_BOOKS, type HouseBooks } from "@/lib/atelier-books";
import {
  SEED_CATALOG,
  SEED_FEATURED_IDS,
  normalizeProduct,
  type CatalogProduct,
} from "@/lib/products";

export type LineFile = {
  products: CatalogProduct[];
  featuredIds: string[];
};

const serverless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const COMMITTED_DIR = join(process.cwd(), "data");

const committedLine = join(COMMITTED_DIR, "line.json");
const committedBooks = join(COMMITTED_DIR, "books.json");
const runtimeLine = serverless ? join(tmpdir(), "unbound-line.json") : committedLine;
const runtimeBooks = serverless ? join(tmpdir(), "unbound-books.json") : committedBooks;

const seedLine = (): LineFile => ({
  products: SEED_CATALOG,
  featuredIds: [...SEED_FEATURED_IDS],
});

const readJson = <T,>(path: string): T | null => {
  try {
    if (!existsSync(path)) return null;
    return JSON.parse(readFileSync(path, "utf8")) as T;
  } catch {
    return null;
  }
};

const writeAtomic = (path: string, value: unknown) => {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  const temp = `${path}.${process.pid}.tmp`;
  writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  renameSync(temp, path);
};

const writeSafe = (path: string, fallback: string, value: unknown) => {
  try {
    writeAtomic(path, value);
  } catch {
    writeAtomic(fallback, value);
  }
};

export const readLine = (): LineFile => {
  const line = readJson<LineFile>(runtimeLine) ?? readJson<LineFile>(committedLine) ?? seedLine();
  return {
    ...line,
    products: (line.products ?? []).map(normalizeProduct),
    featuredIds: line.featuredIds ?? [],
  };
};

export const writeLine = (line: LineFile) => {
  writeSafe(runtimeLine, join(tmpdir(), "unbound-line.json"), {
    ...line,
    products: (line.products ?? []).map(normalizeProduct),
    featuredIds: line.featuredIds ?? [],
  });
};

export const readBooks = (): HouseBooks =>
  readJson<HouseBooks>(runtimeBooks) ?? readJson<HouseBooks>(committedBooks) ?? SEED_BOOKS;

export const writeBooks = (books: HouseBooks) => {
  writeSafe(runtimeBooks, join(tmpdir(), "unbound-books.json"), books);
};
