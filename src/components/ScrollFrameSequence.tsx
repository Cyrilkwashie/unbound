"use client";

import { useEffect, useRef } from "react";
import { useFrameSequence } from "@/context/FrameSequenceContext";
import { FEATURED_FRAMES } from "@/lib/frames";

type ScrollFrameSequenceProps = {
  className?: string;
};

export const ScrollFrameSequence = ({ className }: ScrollFrameSequenceProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { controller, reducedMotion } = useFrameSequence();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!controller || !canvas) return;
    controller.attach(canvas);
    if (reducedMotion) {
      controller.showStaticFrame(FEATURED_FRAMES.reducedMotion);
    }
    return () => controller.detach();
  }, [controller, reducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      className={`block h-full w-full ${className ?? ""}`}
      role="img"
      aria-label="UNBOUND campaign sequence of a model turning toward the camera"
    />
  );
};
