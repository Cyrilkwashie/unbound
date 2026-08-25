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
};

type BagContextValue = {
  items: BagItem[];
  isOpen: boolean;
  openBag: () => void;
  closeBag: () => void;
  toggleBag: () => void;
  addItem: (item: BagItem) => void;
};

const BagContext = createContext<BagContextValue | null>(null);

export const BagProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<BagItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((item: BagItem) => {
    setItems((current) => [...current, item]);
    setIsOpen(true);
  }, []);

  const value = useMemo(
    () => ({
      items,
      isOpen,
      openBag: () => setIsOpen(true),
      closeBag: () => setIsOpen(false),
      toggleBag: () => setIsOpen((open) => !open),
      addItem,
    }),
    [items, isOpen, addItem]
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
