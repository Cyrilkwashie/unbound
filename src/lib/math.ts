export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export const lerp = (start: number, end: number, t: number) =>
  start + (end - start) * t;

export const mapRange = (
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) => {
  if (inMax === inMin) return outMin;
  const t = clamp((value - inMin) / (inMax - inMin), 0, 1);
  return lerp(outMin, outMax, t);
};

export const progressToFrame = (
  progress: number,
  frameCount: number,
  frameStart = 1
) => {
  const index = Math.round(clamp(progress, 0, 1) * (frameCount - 1));
  return frameStart + index;
};

/**
 * Fade a value in and out across a progress window.
 * Flat 1 between inEnd and outStart.
 */
export const rangeOpacity = (
  progress: number,
  inStart: number,
  inEnd: number,
  outStart: number,
  outEnd: number
) => {
  if (progress < inStart) return 0;
  if (progress < inEnd) {
    return inEnd === inStart ? 1 : (progress - inStart) / (inEnd - inStart);
  }
  if (progress < outStart) return 1;
  if (progress < outEnd) {
    return outEnd === outStart
      ? 0
      : 1 - (progress - outStart) / (outEnd - outStart);
  }
  return 0;
};
