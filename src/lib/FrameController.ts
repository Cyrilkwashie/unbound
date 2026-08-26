import {
  FEATURED_FRAMES,
  FRAME_COUNT,
  FRAME_START,
  getFrameSrc,
} from "@/lib/frames";
import { clamp } from "@/lib/math";

type LoadProgressHandler = (loaded: number, total: number) => void;

const isTouchDevice = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
};

const concurrency = () => (isTouchDevice() ? 6 : 12);
const warmAhead = () => (isTouchDevice() ? 18 : 36);

export class FrameController {
  private cache = new Map<number, HTMLImageElement>();
  private inflight = new Map<number, Promise<HTMLImageElement | null>>();
  private failed = new Set<number>();
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private targetFrame = FRAME_START;
  private lastDrawn = -1;
  private drawRaf = 0;
  private nearbyRaf = 0;
  private dpr = 1;
  private viewScale = 1.045;
  private destroyed = false;
  private backgroundTimer: number | null = null;

  attach(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.resize();
    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    const parent = canvas.parentElement ?? canvas;
    this.resizeObserver.observe(parent);
    this.scheduleDraw(true);
  }

  detach() {
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.canvas = null;
    this.ctx = null;
  }

  destroy() {
    this.destroyed = true;
    this.detach();
    if (this.drawRaf) cancelAnimationFrame(this.drawRaf);
    if (this.nearbyRaf) cancelAnimationFrame(this.nearbyRaf);
    if (this.backgroundTimer) window.clearTimeout(this.backgroundTimer);
    this.cache.clear();
    this.inflight.clear();
  }

  setProgress(progress: number) {
    const next =
      FRAME_START + Math.round(clamp(progress, 0, 1) * (FRAME_COUNT - 1));
    this.targetFrame = clamp(next, FRAME_START, FRAME_START + FRAME_COUNT - 1);
    this.scheduleDraw();
    this.scheduleNearby();
    this.scheduleWarm();
  }

  setViewScale(scale: number) {
    if (Math.abs(scale - this.viewScale) < 0.0005) return;
    this.viewScale = scale;
    this.scheduleDraw(true);
  }

  showStaticFrame(frame = FEATURED_FRAMES.reducedMotion) {
    this.targetFrame = clamp(frame, FRAME_START, FRAME_START + FRAME_COUNT - 1);
    void this.loadFrame(this.targetFrame).then(() => this.scheduleDraw(true));
  }

  async preloadEssential(onProgress?: LoadProgressHandler) {
    const frames = this.allFrames();
    let loaded = 0;
    const total = frames.length;
    onProgress?.(0, total);

    await this.mapPool(frames, concurrency(), async (frame) => {
      await this.loadFrame(frame);
      loaded += 1;
      onProgress?.(loaded, total);
    });

    if (this.destroyed) return;
    await this.warmRange(FRAME_START, FRAME_START + warmAhead() - 1);
  }

  startBackgroundFill() {
    const remaining = this.allFrames().filter(
      (frame) => !this.cache.has(frame) && !this.failed.has(frame)
    );
    if (remaining.length === 0) return;
    void this.mapPool(remaining, concurrency(), (frame) => this.loadFrame(frame));
  }

  private allFrames() {
    return Array.from({ length: FRAME_COUNT }, (_, i) => FRAME_START + i);
  }

  private loadFrame(frame: number) {
    if (this.cache.has(frame)) return Promise.resolve(this.cache.get(frame)!);
    if (this.failed.has(frame)) return Promise.resolve(null);
    const existing = this.inflight.get(frame);
    if (existing) return existing;

    const promise = new Promise<HTMLImageElement | null>((resolve) => {
      const img = new Image();
      img.decoding = "async";
      if (frame <= FRAME_START + warmAhead()) img.fetchPriority = "high";
      img.onload = () => {
        this.inflight.delete(frame);
        if (this.destroyed) {
          resolve(null);
          return;
        }
        this.cache.set(frame, img);
        if (frame === this.targetFrame) this.scheduleDraw(true);
        resolve(img);
      };
      img.onerror = () => {
        this.inflight.delete(frame);
        this.failed.add(frame);
        resolve(null);
      };
      img.src = getFrameSrc(frame);
    });

    this.inflight.set(frame, promise);
    return promise;
  }

  private scheduleNearby() {
    if (this.nearbyRaf) return;
    this.nearbyRaf = requestAnimationFrame(() => {
      this.nearbyRaf = 0;
      const last = FRAME_START + FRAME_COUNT - 1;
      const ahead = isTouchDevice() ? 24 : 40;
      const behind = isTouchDevice() ? 8 : 12;
      const queue: number[] = [];
      for (let d = 0; d <= ahead; d += 1) {
        const frame = this.targetFrame + d;
        if (frame <= last) queue.push(frame);
      }
      for (let d = 1; d <= behind; d += 1) {
        const frame = this.targetFrame - d;
        if (frame >= FRAME_START) queue.push(frame);
      }
      void this.mapPool(queue, concurrency(), (frame) => this.loadFrame(frame));
    });
  }

  private scheduleWarm() {
    void this.warmRange(this.targetFrame, this.targetFrame + warmAhead() - 1);
  }

  private async warmRange(from: number, to: number) {
    const last = FRAME_START + FRAME_COUNT - 1;
    const start = clamp(from, FRAME_START, last);
    const end = clamp(to, FRAME_START, last);
    const frames: number[] = [];
    for (let frame = start; frame <= end; frame += 1) frames.push(frame);
    await this.mapPool(frames, concurrency(), (frame) => this.warm(frame));
  }

  private async warm(frame: number) {
    const img = this.cache.get(frame) ?? (await this.loadFrame(frame));
    if (!img?.decode) return;
    try {
      await img.decode();
    } catch {
      /* still drawable */
    }
  }

  private scheduleDraw(force = false) {
    if (this.drawRaf) {
      if (force) {
        cancelAnimationFrame(this.drawRaf);
      } else {
        return;
      }
    }
    this.drawRaf = requestAnimationFrame(() => {
      this.drawRaf = 0;
      this.draw();
    });
  }

  private resize() {
    if (!this.canvas) return;
    const parent = this.canvas.parentElement ?? this.canvas;
    const width = Math.max(1, parent.clientWidth);
    const height = Math.max(1, parent.clientHeight);
    const cap = isTouchDevice() ? 1.5 : 2;
    this.dpr = Math.min(window.devicePixelRatio || 1, cap);
    this.canvas.width = Math.round(width * this.dpr);
    this.canvas.height = Math.round(height * this.dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.lastDrawn = -1;
    this.scheduleDraw(true);
  }

  private draw() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    if (!ctx || !canvas) return;

    ctx.fillStyle = "#080808";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const image = this.nearestLoaded(this.targetFrame);
    if (!image || !image.width) return;

    const canvasRatio = canvas.width / canvas.height;
    const imageRatio = image.width / image.height;
    let drawWidth = canvas.width;
    let drawHeight = canvas.height;
    let dx = 0;
    let dy = 0;

    if (imageRatio > canvasRatio) {
      drawWidth = canvas.width;
      drawHeight = canvas.width / imageRatio;
      dy = (canvas.height - drawHeight) / 2;
    } else {
      drawHeight = canvas.height;
      drawWidth = canvas.height * imageRatio;
      dx = (canvas.width - drawWidth) / 2;
    }

    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(this.viewScale, this.viewScale);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
    ctx.restore();
    this.lastDrawn = this.targetFrame;
  }

  private nearestLoaded(frame: number) {
    const direct = this.cache.get(frame);
    if (direct) return direct;

    for (let distance = 1; distance < FRAME_COUNT; distance += 1) {
      const ahead = this.cache.get(frame + distance);
      if (ahead) return ahead;
      const behind = this.cache.get(frame - distance);
      if (behind) return behind;
    }
    return null;
  }

  private async mapPool<T>(
    items: T[],
    pool: number,
    worker: (item: T) => Promise<unknown>
  ) {
    let cursor = 0;
    const runners = Array.from({ length: Math.min(pool, items.length) }, async () => {
      while (cursor < items.length && !this.destroyed) {
        const current = items[cursor];
        cursor += 1;
        await worker(current);
      }
    });
    await Promise.all(runners);
  }
}
