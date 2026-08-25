"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";
import { useLenis } from "@/context/LenisContext";
import { clamp } from "@/lib/math";

export const sectionProgress = (section: HTMLElement) => {
  const rect = section.getBoundingClientRect();
  const total = section.offsetHeight - window.innerHeight;
  if (total <= 0) return 0;
  return clamp(-rect.top / total, 0, 1);
};

export const useSectionProgress = (
  sectionRef: RefObject<HTMLElement | null>,
  onProgress: (progress: number) => void
) => {
  const lenis = useLenis();
  const callbackRef = useRef(onProgress);
  callbackRef.current = onProgress;

  useEffect(() => {
    const update = () => {
      if (!sectionRef.current) return;
      callbackRef.current(sectionProgress(sectionRef.current));
    };

    update();
    window.addEventListener("resize", update);

    if (lenis) {
      lenis.on("scroll", update);
      return () => {
        lenis.off("scroll", update);
        window.removeEventListener("resize", update);
      };
    }

    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [lenis, sectionRef]);
};
