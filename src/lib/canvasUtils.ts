import type { PhotoFrameConfig } from "../types";

/**
 * Gets a 2D rendering context from a canvas, throwing a descriptive
 * error instead of returning null.
 */
export function getContext2D(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error(
      "Canvas 2D context unavailable. This may happen on devices with too many active canvases.",
    );
  }
  return ctx;
}

/**
 * Computes the inner (photo) dimensions of a frame, excluding the border.
 */
export function getInnerFrameDimensions(frame: PhotoFrameConfig): {
  innerWidth: number;
  innerHeight: number;
} {
  return {
    innerWidth: frame.width - 2 * frame.borderWidth,
    innerHeight: frame.height - 2 * frame.borderWidth,
  };
}

/**
 * Releases the bitmap memory of a canvas element.
 * Setting dimensions to 0 forces the browser to free the backing store.
 */
export function releaseCanvas(canvas: HTMLCanvasElement): void {
  canvas.width = 0;
  canvas.height = 0;
}
