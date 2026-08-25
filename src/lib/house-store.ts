import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "fs";
import { join } from "path";
import { SEED_BOOKS, type HouseBooks } from "@/lib/atelier-books";
import { SEED_CATALOG, SEED_FEATURED_IDS, type CatalogProduct } from "@/lib/products";

export type LineFile = {
  products: CatalogProduct[];
  featuredIds: string[];
};

const DATA_DIR = join(process.cwd(), "data");
const LINE_PATH = join(DATA_DIR, "line.json");
const BOOKS_PATH = join(DATA_DIR, "books.json");

const ensureDir = () => {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
};

const writeAtomic = (path: string, value: unknown) => {
  ensureDir();
  const temp = `${path}.tmp`;
  writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  renameSync(temp, path);
};

export const readLine = (): LineFile => {
  ensureDir();
  if (!existsSync(LINE_PATH)) {
    const seed: LineFile = { products: SEED_CATALOG, featuredIds: [...SEED_FEATURED_IDS] };
    writeAtomic(LINE_PATH, seed);
    return seed;
  }
  return JSON.parse(readFileSync(LINE_PATH, "utf8")) as LineFile;
};

export const writeLine = (line: LineFile) => {
  writeAtomic(LINE_PATH, line);
};

export const readBooks = (): HouseBooks => {
  ensureDir();
  if (!existsSync(BOOKS_PATH)) {
    writeAtomic(BOOKS_PATH, SEED_BOOKS);
    return SEED_BOOKS;
  }
  return JSON.parse(readFileSync(BOOKS_PATH, "utf8")) as HouseBooks;
};

export const writeBooks = (books: HouseBooks) => {
  writeAtomic(BOOKS_PATH, books);
};
