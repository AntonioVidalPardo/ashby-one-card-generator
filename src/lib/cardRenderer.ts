import type { PhotoFrameConfig } from "../types";
import { getContext2D } from "./canvasUtils";

/**
 * Draws a rounded rectangle path on a canvas context.
 */
function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
): void {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

/**
 * Loads an image from a URL. Used for loading the template background.
 */
export function loadTemplateImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load template image"));
    img.src = src;
  });
}

/**
 * Renders the final card onto a canvas.
 *
 * Pipeline:
 * 1. Draw the template background (covers the full 1080×1080 canvas)
 * 2. Clip and draw the user's processed photo inside the frame area
 * 3. Draw the white border on top
 *
 * The user's photo + border completely covers the sample photo in the
 * template, so no manual cleanup of the template is needed.
 */
export function renderCard(
  templateImage: HTMLImageElement,
  processedPhoto: HTMLCanvasElement,
  outputWidth: number,
  outputHeight: number,
  frame: PhotoFrameConfig,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const ctx = getContext2D(canvas);

  // 1. Draw template background
  ctx.drawImage(templateImage, 0, 0, outputWidth, outputHeight);

  // 2. Draw user photo inside the frame (inside the border)
  const innerX = frame.x + frame.borderWidth;
  const innerY = frame.y + frame.borderWidth;
  const innerW = frame.width - 2 * frame.borderWidth;
  const innerH = frame.height - 2 * frame.borderWidth;

  // Clip to rounded rect if borderRadius > 0
  if (frame.borderRadius > 0) {
    ctx.save();
    const innerRadius = Math.max(0, frame.borderRadius - frame.borderWidth);
    roundedRectPath(ctx, innerX, innerY, innerW, innerH, innerRadius);
    ctx.clip();
    ctx.drawImage(processedPhoto, innerX, innerY, innerW, innerH);
    ctx.restore();
  } else {
    ctx.drawImage(processedPhoto, innerX, innerY, innerW, innerH);
  }

  // 3. Draw white border
  ctx.strokeStyle = frame.borderColor;
  ctx.lineWidth = frame.borderWidth;

  if (frame.borderRadius > 0) {
    // Offset stroke inward by half the line width so it aligns with the frame edge
    const halfBorder = frame.borderWidth / 2;
    roundedRectPath(
      ctx,
      frame.x + halfBorder,
      frame.y + halfBorder,
      frame.width - frame.borderWidth,
      frame.height - frame.borderWidth,
      frame.borderRadius,
    );
    ctx.stroke();
  } else {
    ctx.strokeRect(
      frame.x + frame.borderWidth / 2,
      frame.y + frame.borderWidth / 2,
      frame.width - frame.borderWidth,
      frame.height - frame.borderWidth,
    );
  }

  return canvas;
}
