"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  CHANNEL_LABEL,
  LIVE_STATUSES,
  ORDER_STATUS,
  SALE_CHANNELS,
  clientMark,
  formatPlaced,
  lineTotal,
  money,
  openOrders,
  orderLines,
  ticketTotal,
  type AtelierOrder,
  type ListName,
  type OrderLine,
  type OrderStatus,
  type SaleChannel,
} from "@/lib/atelier-books";
import { HouseSelect, pieceOptions } from "@/components/HouseSelect";
import {
  GARMENT_SIZES,
  inStockColors,
  inStockSizes,
  stockCount,
  tracksStock,
  type CatalogProduct,
} from "@/lib/products";

type OrdersBoardProps = {
  orders: AtelierOrder[];
  products: CatalogProduct[];
  clients: ListName[];
};

const markKey = (productId: string, color: string, size: string) =>
  `${productId}::${color.toUpperCase()}::${size}`;

export const OrdersBoard = ({ orders, products, clients }: OrdersBoardProps) => {
  const [rows, setRows] = useState(orders);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"open" | "all">("open");
  const [basket, setBasket] = useState<OrderLine[]>([]);
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const selected = products.find((item) => item.id === productId);
  const saleColors = selected ? inStockColors(selected) : [];
  const [saleColor, setSaleColor] = useState(saleColors[0]?.label ?? "");
  const saleSizes = selected ? inStockSizes(selected, saleColor) : [];
  const [saleSize, setSaleSize] = useState<string>(saleSizes.includes("M") ? "M" : saleSizes[0] ?? "");
  const reserved = basket
    .filter((line) => markKey(line.productId, line.color, line.size) === markKey(productId, saleColor, saleSize))
    .reduce((sum, line) => sum + line.qty, 0);
  const onHand =
    selected && saleSize
      ? stockCount(selected, saleColor, saleSize as (typeof GARMENT_SIZES)[number])
      : null;
  const leftover = onHand === null ? null : Math.max(0, onHand - reserved);
  const [qty, setQty] = useState(1);
  const [channel, setChannel] = useState<SaleChannel>("till");
  const [ticketStatus, setTicketStatus] = useState<OrderStatus>("paid");
  const [client, setClient] = useState("");
  const [contact, setContact] = useState("");
  const running = ticketTotal(basket);

  useEffect(() => {
    const piece = products.find((item) => item.id === productId);
    if (!piece) {
      setSaleSize("");
      setSaleColor("");
      return;
    }
    const nextColors = inStockColors(piece);
    const nextColor = nextColors[0]?.label ?? "";
    const nextSizes = inStockSizes(piece, nextColor);
    setSaleColor(nextColor);
    setSaleSize(nextSizes.includes("M") ? "M" : nextSizes[0] ?? "");
    setQty(1);
  }, [productId, products]);

  const addLine = () => {
    if (!selected || !saleSize || leftover === 0) return;
    const take = Math.min(qty, leftover ?? qty);
    if (take < 1) return;
    setError("");
    setBasket((current) => {
      const key = markKey(selected.id, saleColor, saleSize);
      const existing = current.find((line) => markKey(line.productId, line.color, line.size) === key);
      if (existing) {
        return current.map((line) =>
          markKey(line.productId, line.color, line.size) === key
            ? { ...line, qty: line.qty + take }
            : line
        );
      }
      return [
        ...current,
        {
          productId: selected.id,
          look: selected.look,
          piece: selected.name,
          category: selected.category,
          color: saleColor,
          size: saleSize,
          qty: take,
          unit: selected.price,
        },
      ];
    });
    setQty(1);
  };

  const dropLine = (index: number) => {
    setBasket((current) => current.filter((_, item) => item !== index));
  };

  const record = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || basket.length === 0 || !client) return;
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/atelier/sale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        lines: basket.map((line) => ({
          productId: line.productId,
          color: line.color,
          size: line.size,
          qty: line.qty,
        })),
        client,
        contact,
        note: form.get("note"),
        channel,
        status: ticketStatus,
      }),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error ?? "The sale could not be written.");
      setBusy(false);
      return;
    }
    window.location.reload();
  };

  const setStatus = async (id: string, status: OrderStatus) => {
    const previous = rows;
    setRows(rows.map((order) => (order.id === id ? { ...order, status } : order)));
    const response = await fetch("/api/atelier/order", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ id, status }),
    });
    if (!response.ok) setRows(previous);
    else if (status === "void") window.location.reload();
  };

  const takeClient = (next: string) => {
    const mark = clientMark(next);
    setClient(mark);
    const known = clients.find((entry) => entry.mark.toUpperCase() === mark.toUpperCase());
    setContact(known?.email ?? "");
  };

  const shown = filter === "open" ? openOrders(rows) : rows;
  const tooMany = leftover !== null && leftover < qty;
  const onTheList = clients.some((entry) => entry.mark.toUpperCase() === client.toUpperCase());

  return (
    <div>
      <form className="max-w-xl border-b border-ivory/10 pb-16" onSubmit={record}>
        <p className="text-[10px] tracking-[0.32em] text-mist">WRITE A TICKET</p>
        <p className="mt-4 max-w-md text-sm leading-7 text-mist">
          Add every piece they took. The till writes the total. Void puts the rail back.
        </p>

        <label className="mt-10 block text-[10px] tracking-[0.32em] text-mist" htmlFor="sale-piece">
          PIECE
        </label>
        <HouseSelect
          id="sale-piece"
          value={productId}
          onChange={setProductId}
          options={pieceOptions(products)}
        />

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <label className="mt-10 block text-[10px] tracking-[0.32em] text-mist" htmlFor="sale-color">
              COLOR
            </label>
            <HouseSelect
              id="sale-color"
              value={saleColor}
              onChange={(next) => {
                setSaleColor(next);
                if (!selected) return;
                const nextSizes = inStockSizes(selected, next);
                setSaleSize(nextSizes.includes("M") ? "M" : nextSizes[0] ?? "");
              }}
              options={
                saleColors.length > 0
                  ? saleColors.map((swatch) => ({
                      value: swatch.label,
                      label: swatch.label,
                      swatch: swatch.hex,
                    }))
                  : [{ value: saleColor, label: saleColor || "—" }]
              }
            />
          </div>
          <div>
            <label className="mt-10 block text-[10px] tracking-[0.32em] text-mist" htmlFor="sale-size">
              SIZE
            </label>
            <HouseSelect
              id="sale-size"
              value={saleSize}
              onChange={setSaleSize}
              options={saleSizes.map((option) => ({ value: option, label: option }))}
            />
          </div>
        </div>
        {selected && tracksStock(selected) ? (
          <p className="mt-6 text-[10px] tracking-[0.28em] text-mist">
            {leftover === null ? "OPEN" : leftover === 0 ? "NONE LEFT" : `${String(leftover).padStart(2, "0")} LEFT`}
            {selected ? ` · ${money(selected.price)}` : ""}
          </p>
        ) : selected ? (
          <p className="mt-6 text-[10px] tracking-[0.28em] text-mist">{money(selected.price)}</p>
        ) : null}

        <label className="mt-10 block text-[10px] tracking-[0.32em] text-mist" htmlFor="sale-qty">
          QTY
        </label>
        <input
          id="sale-qty"
          type="number"
          min={1}
          max={leftover ?? 99}
          value={qty}
          onChange={(event) => setQty(Math.max(1, Number(event.target.value) || 1))}
          className="mt-4 w-full border-b border-ivory/20 bg-transparent pb-3 text-sm text-ivory outline-none"
        />

        {tooMany ? (
          <p className="mt-6 text-sm leading-7 text-mist">That is more than is left in this mark.</p>
        ) : null}

        <button
          type="button"
          onClick={addLine}
          disabled={products.length === 0 || saleSizes.length === 0 || leftover === 0 || tooMany}
          className="mt-10 inline-flex items-center gap-3 text-[10px] tracking-[0.28em] text-ivory disabled:text-mist"
          data-cursor="VIEW"
        >
          ADD TO TICKET
          <span className="block h-px w-8 bg-ivory/70" />
        </button>

        <div className="mt-14">
          <p className="text-[10px] tracking-[0.32em] text-mist">ON THE TICKET</p>
          {basket.length === 0 ? (
            <p className="mt-6 font-serif text-xl italic text-ivory/50">Nothing on the slip yet.</p>
          ) : (
            <ul className="mt-6">
              {basket.map((line, index) => (
                <li
                  key={`${markKey(line.productId, line.color, line.size)}-${index}`}
                  className="flex items-baseline justify-between gap-4 border-t border-ivory/10 py-4 last:border-b"
                >
                  <div>
                    <p className="font-display text-sm tracking-[0.12em] text-ivory">{line.piece}</p>
                    <p className="mt-1 text-[10px] tracking-[0.2em] text-mist">
                      {line.color} / {line.size} · ×{String(line.qty).padStart(2, "0")}
                    </p>
                  </div>
                  <div className="flex items-baseline gap-6">
                    <p className="font-serif text-xl italic text-ivory">{money(lineTotal(line))}</p>
                    <button
                      type="button"
                      onClick={() => dropLine(index)}
                      className="text-[10px] tracking-[0.22em] text-stone hover:text-mist"
                    >
                      DROP
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-8 font-display text-[clamp(1.8rem,4vw,3rem)] font-light tracking-[0.08em] text-ivory">
            {money(running)}
          </p>
          <p className="mt-2 text-[10px] tracking-[0.28em] text-mist">THE TILL</p>
        </div>

        <label className="mt-14 block text-[10px] tracking-[0.32em] text-mist" htmlFor="sale-client">
          CLIENT
        </label>
        <HouseSelect
          id="sale-client"
          value={client}
          onChange={takeClient}
          options={clients.map((entry) => ({
            value: entry.mark,
            label: entry.mark,
            hint: entry.email || entry.source,
          }))}
          placeholder="CHOOSE OR WRITE A NAME"
          searchable
          allowCreate
          createLabel={(query) => `WRITE ${clientMark(query)} ON THE LIST`}
        />
        {client && !onTheList ? (
          <p className="mt-3 text-[10px] tracking-[0.24em] text-mist">NEW — they join The List with this ticket.</p>
        ) : null}

        <label className="mt-10 block text-[10px] tracking-[0.32em] text-mist" htmlFor="sale-contact">
          PHONE OR EMAIL
        </label>
        <input
          id="sale-contact"
          value={contact}
          onChange={(event) => setContact(event.target.value)}
          placeholder="Optional"
          className="mt-4 w-full border-b border-ivory/20 bg-transparent pb-3 text-sm tracking-[0.08em] text-ivory outline-none"
        />

        <label className="mt-10 block text-[10px] tracking-[0.32em] text-mist" htmlFor="sale-note">
          NOTE
        </label>
        <input
          id="sale-note"
          name="note"
          placeholder="Pickup Saturday. Held at the till."
          className="mt-4 w-full border-b border-ivory/20 bg-transparent pb-3 text-sm text-ivory outline-none"
        />

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <label className="mt-10 block text-[10px] tracking-[0.32em] text-mist" htmlFor="sale-channel">
              HOW
            </label>
            <HouseSelect
              id="sale-channel"
              value={channel}
              onChange={(next) => setChannel(next as SaleChannel)}
              options={SALE_CHANNELS.map((item) => ({
                value: item,
                label: CHANNEL_LABEL[item],
              }))}
            />
          </div>
          <div>
            <label className="mt-10 block text-[10px] tracking-[0.32em] text-mist" htmlFor="sale-status">
              STATUS
            </label>
            <HouseSelect
              id="sale-status"
              value={ticketStatus}
              onChange={(next) => setTicketStatus(next as OrderStatus)}
              options={LIVE_STATUSES.map((status) => ({
                value: status,
                label: ORDER_STATUS[status],
              }))}
            />
          </div>
        </div>

        {error ? <p className="mt-6 text-sm leading-7 text-mist">{error}</p> : null}

        <button
          type="submit"
          disabled={busy || basket.length === 0 || !client}
          className="mt-12 inline-flex items-center gap-3 text-[10px] tracking-[0.28em] text-ivory disabled:text-mist"
          data-cursor="VIEW"
        >
          {busy ? "WRITING" : "WRITE THE TICKET"}
          <span className="block h-px w-8 bg-ivory/70" />
        </button>
      </form>

      <div className="mt-12 flex gap-8 text-[10px] tracking-[0.28em]">
        <button
          type="button"
          onClick={() => setFilter("open")}
          className={filter === "open" ? "text-ivory" : "text-stone hover:text-mist"}
        >
          TO PACK
        </button>
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={filter === "all" ? "text-ivory" : "text-stone hover:text-mist"}
        >
          THE BOOK
        </button>
      </div>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[880px] text-left">
          <thead>
            <tr className="border-b border-ivory/10 text-[10px] tracking-[0.28em] text-mist">
              <th className="py-4 pr-4 font-normal">TICKET</th>
              <th className="py-4 pr-4 font-normal">DATE</th>
              <th className="py-4 pr-4 font-normal">PIECES</th>
              <th className="py-4 pr-4 font-normal">CLIENT</th>
              <th className="py-4 pr-4 font-normal">HOW</th>
              <th className="py-4 pr-4 font-normal">STATUS</th>
              <th className="py-4 font-normal">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {shown.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 font-serif text-xl italic text-ivory/50">
                  {filter === "open" ? "Nothing to pack." : "No tickets yet."}
                </td>
              </tr>
            ) : (
              shown.map((order) => {
                const lines = orderLines(order);
                return (
                  <tr key={order.id} className="border-b border-ivory/10 align-top">
                    <td className="py-5 pr-4 text-[11px] tracking-[0.18em] text-mist">{order.id}</td>
                    <td className="py-5 pr-4 text-[11px] tracking-[0.16em] text-mist">
                      {formatPlaced(order.placedAt)}
                    </td>
                    <td className="py-5 pr-4">
                      {lines.map((line) => (
                        <p key={markKey(line.productId, line.color, line.size)} className="mb-2 last:mb-0">
                          <span className="font-display text-[12px] tracking-[0.12em] text-ivory">
                            {line.piece}
                          </span>
                          <span className="ml-3 text-[10px] tracking-[0.16em] text-mist">
                            {line.color} / {line.size} · ×{line.qty}
                          </span>
                        </p>
                      ))}
                      {order.note ? (
                        <p className="mt-2 max-w-[16rem] text-sm leading-6 text-mist">{order.note}</p>
                      ) : null}
                    </td>
                    <td className="py-5 pr-4">
                      <p className="text-[11px] tracking-[0.18em] text-mist">{order.client}</p>
                      {order.contact ? (
                        <p className="mt-1 text-[10px] tracking-[0.12em] text-stone">{order.contact}</p>
                      ) : null}
                    </td>
                    <td className="py-5 pr-4 text-[10px] tracking-[0.2em] text-stone">
                      {CHANNEL_LABEL[order.channel as SaleChannel] ?? CHANNEL_LABEL.till}
                    </td>
                    <td className="py-5 pr-4">
                      {order.status === "void" ? (
                        <p className="text-[10px] tracking-[0.22em] text-stone">VOID</p>
                      ) : (
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-wrap gap-3">
                            {LIVE_STATUSES.map((status) => (
                              <button
                                key={status}
                                type="button"
                                onClick={() => void setStatus(order.id, status)}
                                className={`text-[10px] tracking-[0.22em] ${
                                  order.status === status ? "text-ivory" : "text-stone hover:text-mist"
                                }`}
                              >
                                {ORDER_STATUS[status]}
                              </button>
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => void setStatus(order.id, "void")}
                            className="text-left text-[10px] tracking-[0.22em] text-stone hover:text-mist"
                          >
                            VOID
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-5 font-serif text-xl italic text-ivory">{money(order.total)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
