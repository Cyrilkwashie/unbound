/**
 * UNBOUND — campaign frame sequence configuration.
 *
 * Frames live in /public/frames and must keep their original filenames.
 * Update FRAME_PREFIX / FRAME_COUNT / FRAME_DIGITS / FRAME_EXTENSION
 * if a new video extract is dropped in.
 */

export const FRAME_PREFIX =
  "/frames/Fashion_model_turning_toward_camera_202608250251.mp4_frame_";
export const FRAME_COUNT = 240;
export const FRAME_DIGITS = 5;
export const FRAME_EXTENSION = ".jpg";
export const FRAME_START = 1;

export const getFrameSrc = (frameNumber: number) =>
  `${FRAME_PREFIX}${String(frameNumber).padStart(FRAME_DIGITS, "0")}${FRAME_EXTENSION}`;

/** Sticky hero scroll length in viewport heights. */
export const HERO_SCROLL_VH = {
  mobile: 320,
  desktop: 420,
} as const;

/**
 * Hero copy windows, mapped to scroll progress 0 → 1.
 * Adjust these tuples to retiming editorial text against the film.
 */
export const HERO_TIMELINE = {
  brandReveal: { inStart: 0, inEnd: 0, outStart: 0.045, outEnd: 0.12 },
  lineFollow: { inStart: 0.11, inEnd: 0.16, outStart: 0.22, outEnd: 0.28 },
  lineMove: { inStart: 0.28, inEnd: 0.34, outStart: 0.46, outEnd: 0.54 },
  lineRules: { inStart: 0.36, inEnd: 0.42, outStart: 0.5, outEnd: 0.58 },
  peakQuiet: { inStart: 0.52, inEnd: 0.58, outStart: 0.66, outEnd: 0.72 },
  collectionMsg: { inStart: 0.72, inEnd: 0.78, outStart: 0.9, outEnd: 0.97 },
} as const;

export const FEATURED_FRAMES = {
  loadingBackdrop: 1,
  reducedMotion: 118,
  baggyTees: 52,
  hoodies: 128,
  cargo: 196,
  product: 96,
  editorial: 164,
} as const;
