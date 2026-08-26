import type { ProductCategory } from "@/lib/products";

export const money = (value: number) =>
  `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export type OrderStatus = "paid" | "cutting" | "sent";

export const ORDER_STATUS: Record<OrderStatus, string> = {
  paid: "PAID",
  cutting: "PACKING",
  sent: "SENT",
};

export type AtelierOrder = {
  id: string;
  placedAt: string;
  look: string;
  piece: string;
  productId: string;
  category: ProductCategory;
  client: string;
  total: number;
  status: OrderStatus;
  source: "manual" | "shop";
  color?: string;
  size?: string;
};

export type MonthTaking = {
  label: string;
  value: number;
};

export type ListName = {
  mark: string;
  joined: string;
  source: string;
};

export type Letter = {
  id: string;
  from: string;
  received: string;
  subject: string;
  body: string;
  unread: boolean;
};

export type HouseBooks = {
  orders: AtelierOrder[];
  list: ListName[];
  letters: Letter[];
};

export const formatPlaced = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date
    .toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
    .replace(" ", " ")
    .toUpperCase();
};

export const nextTicket = (orders: AtelierOrder[]) => {
  const highest = Math.max(
    0,
    ...orders.map((order) => Number.parseInt(order.id.replace(/\D/g, ""), 10) || 0)
  );
  return `UB-${String(highest + 1).padStart(4, "0")}`;
};

export const tillMonths = (orders: AtelierOrder[]): MonthTaking[] => {
  const buckets = new Map<string, { sort: number; value: number }>();
  for (const order of orders) {
    const date = new Date(order.placedAt);
    if (Number.isNaN(date.getTime())) continue;
    const label = date.toLocaleDateString("en-GB", { month: "short" }).toUpperCase();
    const sort = date.getFullYear() * 100 + date.getMonth();
    const current = buckets.get(label) ?? { sort, value: 0 };
    current.value += order.total;
    buckets.set(label, current);
  }
  return [...buckets.entries()]
    .sort((left, right) => left[1].sort - right[1].sort)
    .map(([label, item]) => ({ label, value: item.value }));
};

export const tillTotal = (orders: AtelierOrder[]) =>
  orders.reduce((sum, order) => sum + order.total, 0);

export const openOrders = (orders: AtelierOrder[]) =>
  orders.filter((order) => order.status === "paid" || order.status === "cutting");

export const categoryTakings = (orders: AtelierOrder[]) => {
  const buckets: Record<ProductCategory, number> = { tops: 0, bottoms: 0, outer: 0 };
  for (const order of orders) {
    buckets[order.category] += order.total;
  }
  return [
    { label: "TOPS", value: buckets.tops },
    { label: "BOTTOMS", value: buckets.bottoms },
    { label: "OUTER", value: buckets.outer },
  ];
};

export const SEED_BOOKS: HouseBooks = {
  orders: [
    {
      id: "UB-0018",
      placedAt: "2026-08-25",
      look: "01",
      piece: "DARKNESS BAGGY TOP",
      productId: "darkness-baggy-top",
      category: "tops",
      client: "A. MOREAU",
      total: 165,
      status: "paid",
      source: "manual",
    },
    {
      id: "UB-0017",
      placedAt: "2026-08-24",
      look: "02",
      piece: "BAGGY CARGO",
      productId: "baggy-cargo",
      category: "bottoms",
      client: "J. KANE",
      total: 195,
      status: "cutting",
      source: "manual",
    },
    {
      id: "UB-0016",
      placedAt: "2026-08-22",
      look: "05",
      piece: "MOTION SHELL",
      productId: "motion-shell",
      category: "outer",
      client: "R. VEIL",
      total: 245,
      status: "sent",
      source: "manual",
    },
    {
      id: "UB-0015",
      placedAt: "2026-08-19",
      look: "04",
      piece: "CROSS CARGO WIDE",
      productId: "cross-cargo-wide",
      category: "bottoms",
      client: "M. ASH",
      total: 210,
      status: "sent",
      source: "manual",
    },
    {
      id: "UB-0014",
      placedAt: "2026-08-16",
      look: "03",
      piece: "THORN LAYER TEE",
      productId: "thorn-layer-tee",
      category: "tops",
      client: "S. NOIR",
      total: 145,
      status: "sent",
      source: "manual",
    },
    {
      id: "UB-0013",
      placedAt: "2026-08-12",
      look: "02",
      piece: "BAGGY CARGO",
      productId: "baggy-cargo",
      category: "bottoms",
      client: "L. GREY",
      total: 195,
      status: "sent",
      source: "manual",
    },
    {
      id: "UB-0012",
      placedAt: "2026-08-08",
      look: "01",
      piece: "DARKNESS BAGGY TOP",
      productId: "darkness-baggy-top",
      category: "tops",
      client: "K. VOSS",
      total: 165,
      status: "sent",
      source: "manual",
    },
    {
      id: "UB-0011",
      placedAt: "2026-08-03",
      look: "08",
      piece: "VOID OVERSHIRT",
      productId: "void-overshirt",
      category: "outer",
      client: "N. HALE",
      total: 220,
      status: "sent",
      source: "manual",
    },
  ],
  list: [
    { mark: "A. MOREAU", joined: "25 AUG", source: "ORDER" },
    { mark: "J. KANE", joined: "24 AUG", source: "THE LIST" },
    { mark: "R. VEIL", joined: "22 AUG", source: "ORDER" },
    { mark: "M. ASH", joined: "19 AUG", source: "THE LIST" },
    { mark: "S. NOIR", joined: "16 AUG", source: "ORDER" },
    { mark: "L. GREY", joined: "12 AUG", source: "THE LIST" },
    { mark: "K. VOSS", joined: "08 AUG", source: "ORDER" },
    { mark: "N. HALE", joined: "03 AUG", source: "THE LIST" },
  ],
  letters: [
    {
      id: "LT-004",
      from: "studio inquiry",
      received: "21 AUG",
      subject: "Stockist — Paris",
      body: "Asking for wholesale on Collection 001. Held until you answer.",
      unread: true,
    },
  ],
};
