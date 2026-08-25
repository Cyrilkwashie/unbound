"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/router";
import Lenis from "lenis";
import { useFrameSequence } from "@/context/FrameSequenceContext";

const LenisContext = createContext<Lenis | null>(null);

const pathOf = (url: string) => url.split("#")[0].split("?")[0];

export const SmoothScrollProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const { isReady, reducedMotion } = useFrameSequence();
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const lastPathRef = useRef(pathOf(router.asPath));

  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  useEffect(() => {
    window.history.scrollRestoration = "manual";
  }, []);

  useEffect(() => {
    const toTop = () => {
      const instance = lenisRef.current;
      if (instance) instance.scrollTo(0, { immediate: true, force: true });
      else window.scrollTo(0, 0);
    };

    const onStart = (url: string) => {
      if (pathOf(url) === lastPathRef.current) return;
      toTop();
    };

    const onComplete = (url: string) => {
      const nextPath = pathOf(url);
      const changed = nextPath !== lastPathRef.current;
      lastPathRef.current = nextPath;
      if (changed) toTop();
    };

    router.events.on("routeChangeStart", onStart);
    router.events.on("routeChangeComplete", onComplete);

    return () => {
      router.events.off("routeChangeStart", onStart);
      router.events.off("routeChangeComplete", onComplete);
    };
  }, [router.events]);

  useEffect(() => {
    if (!isReady || reducedMotion) return;

    const instance = new Lenis({
      autoRaf: true,
      duration: 12 / 10,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.15,
      stopInertiaOnNavigate: true,
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
