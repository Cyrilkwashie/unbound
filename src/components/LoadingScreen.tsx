"use client";

import { useEffect } from "react";
import { useFrameSequence } from "@/context/FrameSequenceContext";
import { FEATURED_FRAMES } from "@/lib/frames";
import { CampaignStill } from "@/components/CampaignStill";

export const LoadingScreen = () => {
  const { isReady, loadProgress } = useFrameSequence();
  const percent = Math.min(100, Math.round(loadProgress * 100));

  useEffect(() => {
    document.body.style.overflow = isReady ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isReady]);

  return (
    <div
      className={`fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-void-0 transition-opacity duration-1000 ease-cinematic ${
        isReady ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      aria-hidden={isReady}
      role="status"
      aria-live="polite"
      aria-label={`Loading UNBOUND, ${percent} percent`}
    >
      <CampaignStill
        frame={FEATURED_FRAMES.loadingBackdrop}
        alt=""
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-2xl"
      />
      <div className="absolute inset-0 bg-void-0/55" />

      <div className="relative flex w-[min(86vw,420px)] flex-col items-center gap-10">
        <p className="font-display text-[11px] font-light tracking-[0.48em] text-mist">
          UNBOUND
        </p>
        <h1 className="font-display text-[clamp(2.4rem,8vw,4.4rem)] font-light tracking-[0.18em] text-ivory">
          UNBOUND
        </h1>
        <div className="flex w-full flex-col gap-3">
          <div className="h-px w-full bg-ivory/15">
            <div
              className="h-px bg-ivory transition-[width] duration-300 ease-out"
              style={{ width: `${percent}%` }}
            />
          </div>
          <div className="flex items-center justify-between font-sans text-[10px] tracking-[0.32em] text-mist">
            <span>COLLECTION 001</span>
            <span>{String(percent).padStart(3, "0")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
