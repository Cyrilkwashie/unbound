"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { useFrameSequence } from "@/context/FrameSequenceContext";

const LenisContext = createContext<Lenis | null>(null);

export const SmoothScrollProvider = ({ children }: { children: ReactNode }) => {
  const { isReady, reducedMotion } = useFrameSequence();
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (!isReady || reducedMotion) return;

    const instance = new Lenis({
      autoRaf: true,
      duration: 12 / 10,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.15,
    });

    setLenis(instance);

    return () => {
      instance.destroy();
      setLenis(null);
    };
  }, [isReady, reducedMotion]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
};

export const useLenis = () => useContext(LenisContext);
