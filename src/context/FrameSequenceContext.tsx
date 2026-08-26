"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/router";
import { FrameController } from "@/lib/FrameController";

type FrameSequenceContextValue = {
  controller: FrameController | null;
  loadProgress: number;
  isReady: boolean;
  reducedMotion: boolean;
};

const FrameSequenceContext = createContext<FrameSequenceContextValue>({
  controller: null,
  loadProgress: 0,
  isReady: false,
  reducedMotion: false,
});

const MIN_LOADER_MS = 1100;
const LOADER_TIMEOUT_MS = 24000;

export const FrameSequenceProvider = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const isHome = router.pathname === "/";
  const controllerRef = useRef<FrameController | null>(null);
  const [controller, setController] = useState<FrameController | null>(null);
  const [loadProgress, setLoadProgress] = useState(isHome ? 0 : 1);
  const [isReady, setIsReady] = useState(!isHome);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!isHome) {
      setIsReady(true);
      setLoadProgress(1);
      return;
    }

    if (controllerRef.current) {
      setController(controllerRef.current);
      setIsReady(true);
      setLoadProgress(1);
      return;
    }

    const instance = new FrameController();
    controllerRef.current = instance;
    setController(instance);

    const startedAt = performance.now();
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      const elapsed = performance.now() - startedAt;
      const wait = Math.max(0, MIN_LOADER_MS - elapsed);
      window.setTimeout(() => {
        setIsReady(true);
        setLoadProgress(1);
        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          instance.startBackgroundFill();
        }
      }, wait);
    };

    const timeout = window.setTimeout(finish, LOADER_TIMEOUT_MS);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      instance.showStaticFrame();
      setLoadProgress(1);
      finish();
    } else {
      void instance
        .preloadEssential((loaded, total) => {
          setLoadProgress(total === 0 ? 1 : loaded / total);
        })
        .then(finish);
    }

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isHome]);

  useEffect(() => {
    return () => {
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
  }, []);

  const value = useMemo(
    () => ({ controller, loadProgress, isReady, reducedMotion }),
    [controller, loadProgress, isReady, reducedMotion]
  );

  return (
    <FrameSequenceContext.Provider value={value}>
      {children}
    </FrameSequenceContext.Provider>
  );
};

export const useFrameSequence = () => useContext(FrameSequenceContext);
