"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useBag } from "@/context/BagContext";
import { QtyControl } from "@/components/QtyControl";

export const BagDrawer = () => {
  const { items, isOpen, closeBag, setQty, removeItem } = useBag();
  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            type="button"
            aria-label="Close bag"
            className="fixed inset-0 z-[65] bg-void-0/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeBag}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[66] flex h-full w-full max-w-md flex-col bg-void-1 px-7 py-8"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            aria-label="Shopping bag"
          >
            <div className="flex items-center justify-between">
              <p className="text-[11px] tracking-[0.32em] text-ivory">BAG</p>
              <button
                type="button"
                onClick={closeBag}
                className="text-[10px] tracking-[0.28em] text-mist"
                data-cursor="VIEW"
              >
                CLOSE
              </button>
            </div>

            <div className="mt-12 flex-1 overflow-auto">
              {items.length === 0 ? (
                <p className="font-serif text-2xl italic text-ivory/80">Your bag is empty.</p>
              ) : (
                <ul className="flex flex-col gap-8">
                  {items.map((item) => (
                    <li
                      key={`${item.id}-${item.color}-${item.size}`}
                      className="border-b border-ivory/10 pb-6"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-[11px] tracking-[0.22em] text-ivory">{item.name}</p>
                          <p className="mt-2 text-[10px] tracking-[0.18em] text-mist">
                            {item.color} / {item.size}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(item)}
                          className="text-[10px] tracking-[0.22em] text-mist"
                          data-cursor="VIEW"
                        >
                          DROP
                        </button>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <QtyControl
                          value={item.qty}
                          min={1}
                          max={20}
                          label={`${item.name} ${item.size}`}
                          onChange={(next) => setQty(item, next)}
                        />
                        <p className="font-serif italic text-ivory">${item.price * item.qty}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-ivory/10 pt-6">
              <div className="flex items-center justify-between text-[11px] tracking-[0.22em]">
                <span className="text-mist">TOTAL</span>
                <span className="text-ivory">${total}</span>
              </div>
              <button
                type="button"
                disabled={items.length === 0}
                className="mt-6 w-full border border-ivory/30 py-4 text-[11px] tracking-[0.32em] text-ivory transition-colors duration-500 enabled:hover:bg-ivory enabled:hover:text-void-0 disabled:opacity-30"
                data-cursor="SHOP"
              >
                CHECKOUT
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
