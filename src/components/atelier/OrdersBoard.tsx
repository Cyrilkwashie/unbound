"use client";

import { FormEvent, useState } from "react";
import {
  ORDER_STATUS,
  formatPlaced,
  money,
  type AtelierOrder,
  type OrderStatus,
} from "@/lib/atelier-books";
import type { CatalogProduct } from "@/lib/products";

type OrdersBoardProps = {
  orders: AtelierOrder[];
  products: CatalogProduct[];
};

export const OrdersBoard = ({ orders, products }: OrdersBoardProps) => {
  const [rows, setRows] = useState(orders);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const selected = products.find((item) => item.id === productId);

  const record = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/atelier/sale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({
        productId: form.get("productId"),
        client: form.get("client"),
        total: form.get("total"),
        status: form.get("status"),
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
  };

  return (
    <div>
      <form className="max-w-xl border-b border-ivory/10 pb-16" onSubmit={record}>
        <p className="text-[10px] tracking-[0.32em] text-mist">RECORD A SALE</p>
        <p className="mt-4 max-w-md text-sm leading-7 text-mist">
          A ticket written here hits The Till and The List. Use it for studio sales,
          drops, and anything that did not come through the bag.
        </p>

        <label className="mt-10 block text-[10px] tracking-[0.32em] text-mist" htmlFor="sale-piece">
          PIECE
        </label>
        <select
          id="sale-piece"
          name="productId"
          value={productId}
          onChange={(event) => setProductId(event.target.value)}
          className="mt-4 w-full appearance-none border-b border-ivory/20 bg-transparent pb-3 text-sm tracking-[0.08em] text-ivory outline-none"
        >
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.look} — {product.name}
            </option>
          ))}
        </select>

        <label className="mt-10 block text-[10px] tracking-[0.32em] text-mist" htmlFor="sale-client">
          CLIENT
        </label>
        <input
          id="sale-client"
          name="client"
          required
          placeholder="A. MOREAU"
          className="mt-4 w-full border-b border-ivory/20 bg-transparent pb-3 text-sm tracking-[0.12em] text-ivory outline-none"
        />

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <label className="mt-10 block text-[10px] tracking-[0.32em] text-mist" htmlFor="sale-total">
              TOTAL
            </label>
            <input
              id="sale-total"
              name="total"
              type="number"
              min="0"
              step="1"
              key={selected?.id ?? "none"}
              defaultValue={selected?.price ?? 0}
              className="mt-4 w-full border-b border-ivory/20 bg-transparent pb-3 text-sm text-ivory outline-none"
            />
          </div>
          <div>
            <label className="mt-10 block text-[10px] tracking-[0.32em] text-mist" htmlFor="sale-status">
              STATUS
            </label>
            <select
              id="sale-status"
              name="status"
              defaultValue="paid"
              className="mt-4 w-full appearance-none border-b border-ivory/20 bg-transparent pb-3 text-sm tracking-[0.08em] text-ivory outline-none"
            >
              <option value="paid">PAID</option>
              <option value="cutting">CUTTING</option>
              <option value="sent">SENT</option>
            </select>
          </div>
        </div>

        {error ? <p className="mt-6 text-sm leading-7 text-mist">{error}</p> : null}

        <button
          type="submit"
          disabled={busy || products.length === 0}
          className="mt-12 inline-flex items-center gap-3 text-[10px] tracking-[0.28em] text-ivory disabled:text-mist"
          data-cursor="VIEW"
        >
          {busy ? "WRITING" : "WRITE THE TICKET"}
          <span className="block h-px w-8 bg-ivory/70" />
        </button>
      </form>

      <div className="mt-16 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left">
          <thead>
            <tr className="border-b border-ivory/10 text-[10px] tracking-[0.28em] text-mist">
              <th className="py-4 pr-4 font-normal">TICKET</th>
              <th className="py-4 pr-4 font-normal">DATE</th>
              <th className="py-4 pr-4 font-normal">PIECE</th>
              <th className="py-4 pr-4 font-normal">CLIENT</th>
              <th className="py-4 pr-4 font-normal">STATUS</th>
              <th className="py-4 font-normal">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((order) => (
              <tr key={order.id} className="border-b border-ivory/10">
                <td className="py-5 pr-4 text-[11px] tracking-[0.18em] text-mist">{order.id}</td>
                <td className="py-5 pr-4 text-[11px] tracking-[0.16em] text-mist">
                  {formatPlaced(order.placedAt)}
                </td>
                <td className="py-5 pr-4 font-display text-[12px] tracking-[0.12em] text-ivory">
                  {order.piece}
                </td>
                <td className="py-5 pr-4 text-[11px] tracking-[0.18em] text-mist">{order.client}</td>
                <td className="py-5 pr-4">
                  <div className="flex flex-wrap gap-3">
                    {(Object.keys(ORDER_STATUS) as OrderStatus[]).map((status) => (
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
                </td>
                <td className="py-5 font-serif text-xl italic text-ivory">{money(order.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
