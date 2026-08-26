"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type BagItem = {
  id: string;
  name: string;
  price: number;
  size: string;
  color: string;
  qty: number;
  image: string;
  imageFit?: "contain" | "cover";
  imageBg?: string;
};

const sameMark = (a: BagItem, b: Pick<BagItem, "id" | "size" | "color">) =>
  a.id === b.id && a.size === b.size && a.color === b.color;

type BagContextValue = {
  items: BagItem[];
  count: number;
  isOpen: boolean;
  openBag: () => void;
  closeBag: () => void;
  toggleBag: () => void;
  addItem: (item: BagItem) => void;
  setQty: (item: Pick<BagItem, "id" | "size" | "color">, qty: number) => void;
  removeItem: (item: Pick<BagItem, "id" | "size" | "color">) => void;
};

const BagContext = createContext<BagContextValue | null>(null);

export const BagProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<BagItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((item: BagItem) => {
    const qty = Math.max(1, Math.floor(item.qty) || 1);
    setItems((current) => {
      const index = current.findIndex((row) => sameMark(row, item));
      if (index < 0) return [...current, { ...item, qty }];
      const next = [...current];
      next[index] = { ...next[index], qty: next[index].qty + qty };
      return next;
    });
    setIsOpen(true);
  }, []);

  const setQty = useCallback((item: Pick<BagItem, "id" | "size" | "color">, qty: number) => {
    const nextQty = Math.max(0, Math.floor(qty) || 0);
    setItems((current) => {
      if (nextQty <= 0) return current.filter((row) => !sameMark(row, item));
      return current.map((row) => (sameMark(row, item) ? { ...row, qty: nextQty } : row));
    });
  }, []);

  const removeItem = useCallback((item: Pick<BagItem, "id" | "size" | "color">) => {
    setItems((current) => current.filter((row) => !sameMark(row, item)));
  }, []);

  const count = items.reduce((sum, item) => sum + item.qty, 0);

  const value = useMemo(
    () => ({
      items,
      count,
      isOpen,
      openBag: () => setIsOpen(true),
      closeBag: () => setIsOpen(false),
      toggleBag: () => setIsOpen((open) => !open),
      addItem,
      setQty,
      removeItem,
    }),
    [items, count, isOpen, addItem, setQty, removeItem]
  );

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
};

export const useBag = () => {
  const ctx = useContext(BagContext);
  if (!ctx) {
    throw new Error("useBag must be used within BagProvider");
  }
  return ctx;
};
