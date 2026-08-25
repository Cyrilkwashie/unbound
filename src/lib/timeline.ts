import { rangeOpacity } from "@/lib/math";
import { HERO_TIMELINE } from "@/lib/frames";

export type OverlayState = {
  brand: number;
  follow: number;
  move: number;
  rules: number;
  peak: number;
  collection: number;
  canvasScale: number;
  canvasBlur: number;
  vignette: number;
  exitFade: number;
};

export const overlayFromProgress = (progress: number): OverlayState => {
  const t = HERO_TIMELINE;

  return {
    brand: rangeOpacity(
      progress,
      t.brandReveal.inStart,
      t.brandReveal.inEnd,
      t.brandReveal.outStart,
      t.brandReveal.outEnd
    ),
    follow: rangeOpacity(
      progress,
      t.lineFollow.inStart,
      t.lineFollow.inEnd,
      t.lineFollow.outStart,
      t.lineFollow.outEnd
    ),
    move: rangeOpacity(
      progress,
      t.lineMove.inStart,
      t.lineMove.inEnd,
      t.lineMove.outStart,
      t.lineMove.outEnd
    ),
    rules: rangeOpacity(
      progress,
      t.lineRules.inStart,
      t.lineRules.inEnd,
      t.lineRules.outStart,
      t.lineRules.outEnd
    ),
    peak: rangeOpacity(
      progress,
      t.peakQuiet.inStart,
      t.peakQuiet.inEnd,
      t.peakQuiet.outStart,
      t.peakQuiet.outEnd
    ),
    collection: rangeOpacity(
      progress,
      t.collectionMsg.inStart,
      t.collectionMsg.inEnd,
      t.collectionMsg.outStart,
      t.collectionMsg.outEnd
    ),
    canvasScale: 1.045 - Math.min(progress, 0.18) * (0.045 / 0.18),
    canvasBlur: progress < 0.08 ? (1 - progress / 0.08) * 6 : 0,
    vignette: 0.28 + progress * 0.18,
    exitFade: progress > 0.9 ? (progress - 0.9) / 0.1 : 0,
  };
};
