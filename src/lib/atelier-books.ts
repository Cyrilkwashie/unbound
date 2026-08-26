import type { ProductCategory } from "@/lib/products";

export const money = (value: number) =>
  `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

export type OrderStatus = "paid" | "cutting" | "sent" | "void";

export const ORDER_STATUS: Record<OrderStatus, string> = {
  paid: "PAID",
  cutting: "PACKING",
  sent: "SENT",
  void: "VOID",
};

export const LIVE_STATUSES: OrderStatus[] = ["paid", "cutting", "sent"];

export const SALE_CHANNELS = ["till", "instagram", "pickup"] as const;
export type SaleChannel = (typeof SALE_CHANNELS)[number];

export const CHANNEL_LABEL: Record<SaleChannel, string> = {
  till: "TILL",
  instagram: "INSTAGRAM",
  pickup: "PICKUP",
};

export type OrderLine = {
  productId: string;
  look: string;
  piece: string;
  category: ProductCategory;
  color: string;
  size: string;
  qty: number;
  unit: number;
};

export type AtelierOrder = {
  id: string;
  placedAt: string;
  client: string;
  total: number;
  status: OrderStatus;
  source: "manual" | "shop";
  lines: OrderLine[];
  look?: string;
  piece?: string;
  productId?: string;
  category?: ProductCategory;
  color?: string;
  size?: string;
  qty?: number;
  note?: string;
  contact?: string;
  channel?: SaleChannel;
};

export type MonthTaking = {
  label: string;
  value: number;
};

export type ListName = {
  mark: string;
  joined: string;
  source: string;
  email?: string;
};

export type Letter = {
  id: string;
  from: string;
  received: string;
  subject: string;
  body: string;
  unread: boolean;
  email?: string;
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

export const todayKey = () => new Date().toISOString().slice(0, 10);

export const isToday = (iso: string) => iso.slice(0, 10) === todayKey();

export const lineQty = (qty?: number) => Math.max(1, Math.floor(Number(qty) || 1));

export const lineTotal = (line: OrderLine) => line.unit * lineQty(line.qty);

export const ticketTotal = (lines: OrderLine[]) =>
  lines.reduce((sum, line) => sum + lineTotal(line), 0);

export const orderLines = (order: AtelierOrder): OrderLine[] => {
  if (order.lines?.length) {
    return order.lines.map((line) => ({
      ...line,
      qty: lineQty(line.qty),
      unit: Math.max(0, Math.floor(Number(line.unit) || 0)),
    }));
  }
  if (!order.productId || !order.piece) return [];
  const qty = lineQty(order.qty);
  return [
    {
      productId: order.productId,
      look: order.look ?? "",
      piece: order.piece,
      category: order.category ?? "tops",
      color: order.color ?? "",
      size: order.size ?? "",
      qty,
      unit: Math.max(0, Math.round((order.total || 0) / qty)),
    },
  ];
};

export const orderQty = (order: Pick<AtelierOrder, "qty" | "lines" | "productId" | "piece">) => {
  const lines = order.lines?.length
    ? order.lines
    : order.productId && order.piece
      ? [{ qty: order.qty }]
      : [];
  if (lines.length === 0) return lineQty(order.qty);
  return lines.reduce((sum, line) => sum + lineQty(line.qty), 0);
};

export const ticketSummary = (order: AtelierOrder) => {
  const lines = orderLines(order);
  if (lines.length === 0) return "—";
  if (lines.length === 1) return lines[0].piece;
  return `${lines[0].piece} +${String(lines.length - 1).padStart(2, "0")}`;
};

export const orderChannel = (order: Pick<AtelierOrder, "channel">): SaleChannel =>
  order.channel && SALE_CHANNELS.includes(order.channel) ? order.channel : "till";

export const clientMark = (value: string) => {
  const mark = value.trim();
  if (!mark) return "";
  return mark.includes("@") ? mark.toLowerCase() : mark.toUpperCase();
};

export const uniqueClients = (list: ListName[], orders: AtelierOrder[]): ListName[] => {
  const map = new Map<string, ListName>();
  for (const entry of list) {
    const key = entry.mark.toUpperCase();
    map.set(key, entry);
  }
  for (const order of orders) {
    const key = order.client.toUpperCase();
    const current = map.get(key);
    if (!current) {
      map.set(key, {
        mark: order.client,
        joined: formatPlaced(order.placedAt),
        source: "ORDER",
        email: order.contact,
      });
      continue;
    }
    if (order.contact && !current.email) {
      map.set(key, { ...current, email: order.contact });
    }
  }
  return [...map.values()];
};

export const normalizeOrder = (order: AtelierOrder): AtelierOrder => {
  const lines = orderLines(order);
  const first = lines[0];
  return {
    ...order,
    lines,
    total: ticketTotal(lines) || order.total || 0,
    qty: lines.reduce((sum, line) => sum + line.qty, 0),
    channel: orderChannel(order),
    note: order.note?.trim() || undefined,
    contact: order.contact?.trim() || undefined,
    look: first?.look,
    piece: first?.piece,
    productId: first?.productId,
    category: first?.category,
    color: first?.color,
    size: first?.size,
  };
};

export const normalizeBooks = (books: HouseBooks): HouseBooks => ({
  orders: (books.orders ?? []).map(normalizeOrder),
  list: books.list ?? [],
  letters: books.letters ?? [],
});

export const nextTicket = (orders: AtelierOrder[]) => {
  const highest = Math.max(
    0,
    ...orders.map((order) => Number.parseInt(order.id.replace(/\D/g, ""), 10) || 0)
  );
  return `UB-${String(highest + 1).padStart(4, "0")}`;
};

export const nextLetter = (letters: Letter[]) => {
  const highest = Math.max(
    0,
    ...letters.map((letter) => Number.parseInt(letter.id.replace(/\D/g, ""), 10) || 0)
  );
  return `LT-${String(highest + 1).padStart(3, "0")}`;
};

export const liveOrders = (orders: AtelierOrder[]) =>
  orders.filter((order) => order.status !== "void");

export const tillMonths = (orders: AtelierOrder[]): MonthTaking[] => {
  const buckets = new Map<string, { sort: number; value: number }>();
  for (const order of liveOrders(orders)) {
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
  liveOrders(orders).reduce((sum, order) => sum + order.total, 0);

export const tillToday = (orders: AtelierOrder[]) =>
  tillTotal(orders.filter((order) => isToday(order.placedAt)));

export const ticketCount = (orders: AtelierOrder[]) => liveOrders(orders).length;

export const averageTicket = (orders: AtelierOrder[]) => {
  const live = liveOrders(orders);
  if (live.length === 0) return 0;
  return Math.round(tillTotal(live) / live.length);
};

export const openOrders = (orders: AtelierOrder[]) =>
  orders.filter((order) => order.status === "paid" || order.status === "cutting");

export const categoryTakings = (orders: AtelierOrder[]) => {
  const buckets: Record<ProductCategory, number> = { tops: 0, bottoms: 0, outer: 0 };
  for (const order of liveOrders(orders)) {
    for (const line of orderLines(order)) {
      buckets[line.category] += lineTotal(line);
    }
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
      id: "UB-0003",
      placedAt: "2026-08-25",
      client: "A. MOREAU",
      total: 360,
      status: "paid",
      source: "manual",
      channel: "till",
      contact: "moreau@studio.mail",
      lines: [
        {
          productId: "split-crew",
          look: "01",
          piece: "SPLIT CREW",
          category: "tops",
          color: "BLACK",
          size: "M",
          qty: 1,
          unit: 165,
        },
        {
          productId: "angel-pant",
          look: "03",
          piece: "ANGEL PANT",
          category: "bottoms",
          color: "BLACK",
          size: "L",
          qty: 1,
          unit: 195,
        },
      ],
    },
    {
      id: "UB-0002",
      placedAt: "2026-08-24",
      client: "J. KANE",
      total: 195,
      status: "cutting",
      source: "manual",
      channel: "instagram",
      note: "Hold at the till — Saturday pickup.",
      lines: [
        {
          productId: "angel-pant",
          look: "03",
          piece: "ANGEL PANT",
          category: "bottoms",
          color: "BLACK",
          size: "L",
          qty: 1,
          unit: 195,
        },
      ],
    },
    {
      id: "UB-0001",
      placedAt: "2026-08-22",
      client: "R. VEIL",
      total: 165,
      status: "sent",
      source: "manual",
      channel: "pickup",
      lines: [
        {
          productId: "flame-crew",
          look: "08",
          piece: "FLAME CREW",
          category: "tops",
          color: "BLACK",
          size: "M",
          qty: 1,
          unit: 165,
        },
      ],
    },
  ],
  list: [
    { mark: "A. MOREAU", joined: "25 AUG", source: "ORDER", email: "moreau@studio.mail" },
    { mark: "J. KANE", joined: "24 AUG", source: "THE LIST" },
    { mark: "R. VEIL", joined: "22 AUG", source: "ORDER" },
  ],
  letters: [
    {
      id: "LT-001",
      from: "studio inquiry",
      received: "21 AUG",
      subject: "Stockist — Paris",
      body: "Asking for wholesale on Collection 001. Held until you answer.",
      unread: true,
      email: "paris@atelier.mail",
    },
  ],
};
