"use client";

import { useEffect, useRef } from "react";
import { useIsTouch } from "@/hooks/useIsTouch";
import { lerp } from "@/lib/math";

export const CustomCursor = () => {
  const isTouch = useIsTouch();
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0, scale: 1, tScale: 1 });

  useEffect(() => {
    if (isTouch) return;
    document.documentElement.classList.add("has-custom-cursor");

    const cursor = cursorRef.current;
    const label = labelRef.current;
    if (!cursor || !label) return;

    let raf = 0;

    const tick = () => {
      pos.current.x = lerp(pos.current.x, pos.current.tx, 0.18);
      pos.current.y = lerp(pos.current.y, pos.current.ty, 0.18);
      pos.current.scale = lerp(pos.current.scale, pos.current.tScale, 0.14);
      cursor.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0) translate(-50%, -50%) scale(${pos.current.scale})`;
      raf = requestAnimationFrame(tick);
    };

    const onMove = (event: MouseEvent) => {
      pos.current.tx = event.clientX;
      pos.current.ty = event.clientY;
    };

    const onOver = (event: MouseEvent) => {
      const target = (event.target as HTMLElement | null)?.closest("[data-cursor]");
      const text = target?.getAttribute("data-cursor") ?? "";
      const grow = (event.target as HTMLElement | null)?.closest("[data-cursor-grow]");
      label.textContent = text;
      cursor.dataset.active = text ? "true" : "false";
      pos.current.tScale = text ? 1 : grow ? 1.65 : 1;
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    raf = requestAnimationFrame(tick);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, [isTouch]);

  if (isTouch) return null;

  return (
    <div
      ref={cursorRef}
      data-active="false"
      className="pointer-events-none fixed left-0 top-0 z-[90] flex h-3 w-3 items-center justify-center rounded-full mix-blend-difference group"
      aria-hidden="true"
    >
      <span className="absolute inset-0 rounded-full bg-ivory transition-opacity duration-300 group-data-[active=true]:opacity-0" />
      <span className="flex h-[4.4rem] w-[4.4rem] items-center justify-center rounded-full border border-ivory/70 text-[8px] tracking-[0.28em] text-ivory opacity-0 transition-opacity duration-300 group-data-[active=true]:opacity-100">
        <span ref={labelRef} />
      </span>
    </div>
  );
};
