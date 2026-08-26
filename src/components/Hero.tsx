"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollFrameSequence } from "@/components/ScrollFrameSequence";
import { useFrameSequence } from "@/context/FrameSequenceContext";
import { useSectionProgress } from "@/hooks/useSectionProgress";
import { HERO_SCROLL_VH } from "@/lib/frames";
import { overlayFromProgress } from "@/lib/timeline";

export const Hero = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const followRef = useRef<HTMLParagraphElement>(null);
  const moveRef = useRef<HTMLParagraphElement>(null);
  const rulesRef = useRef<HTMLParagraphElement>(null);
  const peakRef = useRef<HTMLParagraphElement>(null);
  const collectionRef = useRef<HTMLDivElement>(null);
  const frameWrapRef = useRef<HTMLDivElement>(null);
  const exitRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const { controller, reducedMotion } = useFrameSequence();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  const apply = useCallback(
    (progress: number) => {
      const overlay = overlayFromProgress(progress);
      if (!reducedMotion) {
        controller?.setProgress(progress);
        controller?.setViewScale(overlay.canvasScale);
      }

      if (brandRef.current) {
        brandRef.current.style.opacity = String(overlay.brand);
        brandRef.current.style.transform = `translate3d(0, ${progress * -48}px, 0) scale(${1 - progress * 0.06})`;
      }
      if (followRef.current) followRef.current.style.opacity = String(overlay.follow);
      if (moveRef.current) moveRef.current.style.opacity = String(overlay.move);
      if (rulesRef.current) rulesRef.current.style.opacity = String(overlay.rules);
      if (peakRef.current) peakRef.current.style.opacity = String(overlay.peak);
      if (collectionRef.current) {
        collectionRef.current.style.opacity = String(overlay.collection);
        collectionRef.current.style.transform = `translate3d(0, ${12 - overlay.collection * 12}px, 0)`;
      }
      if (frameWrapRef.current) {
        frameWrapRef.current.style.filter = overlay.canvasBlur
          ? `blur(${overlay.canvasBlur}px)`
          : "none";
      }
      if (exitRef.current) exitRef.current.style.opacity = String(overlay.exitFade * 0.88);
      if (barRef.current) barRef.current.style.transform = `scaleY(${progress})`;
    },
    [controller, reducedMotion]
  );

  useSectionProgress(sectionRef, apply);

  const height = isMobile ? HERO_SCROLL_VH.mobile : HERO_SCROLL_VH.desktop;

  if (reducedMotion) {
    return (
      <section id="top" className="relative h-[100svh] overflow-hidden bg-void-0">
        <ScrollFrameSequence className="h-full w-full" />
        <div className="vignette absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void-0/50 via-transparent to-void-0/75" />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center">
          <p className="mb-7 font-sans text-[10px] tracking-[0.48em] text-mist">
            EST. 2026 — COLLECTION 001
          </p>
          <h1 className="font-display text-[clamp(3.2rem,14vw,11rem)] font-light leading-[0.86] tracking-[0.16em] text-ivory">
            UNBOUND
          </h1>
          <p className="mt-10 font-sans text-[11px] tracking-[0.22em] text-ivory/80">
            NOT HERE TO FOLLOW.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative bg-void-0"
      style={{ height: `${height}vh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div ref={frameWrapRef} className="absolute inset-0">
          <ScrollFrameSequence className="h-full w-full" />
        </div>

        <div className="vignette absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void-0/55 via-transparent to-void-0/70" />

        <div
          ref={brandRef}
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center will-change-transform"
        >
          <p className="mb-7 font-sans text-[10px] tracking-[0.48em] text-mist">
            EST. 2026 — COLLECTION 001
          </p>
          <h1 className="font-display text-[clamp(3.2rem,14vw,11rem)] font-light leading-[0.86] tracking-[0.16em] text-ivory">
            UNBOUND
          </h1>
          <div className="editorial-line mt-10 w-24" />
        </div>

        <p
          ref={followRef}
          className="absolute bottom-[12%] left-[6%] z-10 max-w-[14rem] font-sans text-[11px] leading-6 tracking-[0.22em] text-ivory/90 opacity-0 md:bottom-[14%] md:left-[8%] md:max-w-none md:text-[12px]"
        >
          UNBOUND / NOT HERE TO FOLLOW.
        </p>

        <p
          ref={moveRef}
          className="absolute right-[7%] top-[22%] z-10 font-serif text-[clamp(1.6rem,4vw,3.4rem)] italic leading-none tracking-[0.04em] text-ivory/90 opacity-0"
        >
          MOVE WITHOUT LIMITS.
        </p>

        <p
          ref={rulesRef}
          className="absolute bottom-[18%] right-[7%] z-10 max-w-[12rem] text-right font-sans text-[11px] leading-6 tracking-[0.2em] text-ivory/80 opacity-0 md:max-w-none"
        >
          WEAR YOUR OWN RULES.
        </p>

        <p
          ref={peakRef}
          className="absolute bottom-[10%] left-1/2 z-10 -translate-x-1/2 font-sans text-[10px] tracking-[0.42em] text-mist opacity-0"
        >
          LOOK 01 — VOID
        </p>

        <div
          ref={collectionRef}
          className="absolute inset-x-0 bottom-[14%] z-10 flex flex-col items-center gap-4 opacity-0"
        >
          <p className="font-sans text-[10px] tracking-[0.4em] text-mist">NOW AVAILABLE</p>
          <p className="font-display text-[clamp(1.4rem,4vw,2.4rem)] tracking-[0.18em] text-ivory">
            COLLECTION 001
          </p>
        </div>

        <div ref={exitRef} className="absolute inset-0 z-20 bg-void-0 opacity-0" />

        <div className="absolute right-5 top-1/2 z-10 hidden h-24 w-px -translate-y-1/2 overflow-hidden bg-ivory/15 md:right-8 md:block">
          <div
            ref={barRef}
            className="h-full w-full origin-top bg-ivory"
            style={{ transform: "scaleY(0)" }}
          />
        </div>
      </div>
    </section>
  );
};
