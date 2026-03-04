import type { DuotoneConfig } from "../types";

/**
 * Detects if a file is HEIC/HEIF format (common on iPhones).
 */
function isHEIC(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type === "image/heic" || type === "image/heif") return true;
  const name = file.name.toLowerCase();
  return name.endsWith(".heic") || name.endsWith(".heif");
}

/**
 * Converts a HEIC/HEIF file to JPEG. Lazy-loads heic2any to keep the
 * initial bundle small for non-iPhone users.
 */
async function convertHEIC(file: File): Promise<Blob> {
  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.9,
  });
  // heic2any can return a single blob or an array
  return Array.isArray(result) ? result[0]! : result;
}

/**
 * Loads a blob into an HTMLImageElement.
 */
function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

/**
 * Resizes an image if either dimension exceeds maxDimension.
 * Returns an offscreen canvas with the resized image.
 */
function resizeIfNeeded(
  img: HTMLImageElement,
  maxDimension: number,
): HTMLCanvasElement {
  let { naturalWidth: w, naturalHeight: h } = img;

  if (w > maxDimension || h > maxDimension) {
    const scale = maxDimension / Math.max(w, h);
    w = Math.round(w * scale);
    h = Math.round(h * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

/**
 * Center-crops an image to fit the target dimensions (cover-fit).
 * The largest centered region matching the target aspect ratio is extracted.
 */
function centerCrop(
  source: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number,
): HTMLCanvasElement {
  const { width: w, height: h } = source;
  const targetAspect = targetWidth / targetHeight;
  const sourceAspect = w / h;

  let sx: number, sy: number, sw: number, sh: number;

  if (sourceAspect > targetAspect) {
    // Source is wider — crop the sides
    sh = h;
    sw = Math.round(h * targetAspect);
    sx = Math.round((w - sw) / 2);
    sy = 0;
  } else {
    // Source is taller — crop top and bottom
    sw = w;
    sh = Math.round(w / targetAspect);
    sx = 0;
    sy = Math.round((h - sh) / 2);
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
  return canvas;
}

/**
 * Parses a hex color string (e.g. "#3022C8") into RGB components.
 */
function hexToRGB(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace("#", "");
  return {
    r: parseInt(cleaned.substring(0, 2), 16),
    g: parseInt(cleaned.substring(2, 4), 16),
    b: parseInt(cleaned.substring(4, 6), 16),
  };
}

/**
 * Applies a gradient duotone effect to the image.
 *
 * Algorithm:
 * 1. Convert each pixel to grayscale (luminance-weighted)
 * 2. Compute the pixel's position along the diagonal gradient (bottom-left → top-right)
 * 3. Interpolate the gradient color at that position
 * 4. Blend between white and the gradient color based on pixel darkness
 *
 * Dark pixels get the gradient color, bright pixels stay white.
 * All facial detail is preserved because every pixel is individually processed.
 */
function applyDuotone(
  source: HTMLCanvasElement,
  config: DuotoneConfig,
): HTMLCanvasElement {
  const { width, height } = source;
  const srcCtx = source.getContext("2d")!;
  const imageData = srcCtx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const colorBL = hexToRGB(config.gradient.bottomLeft);
  const colorTR = hexToRGB(config.gradient.topRight);
  const gamma = 1 / (config.contrast ?? 1.0);

  // The diagonal runs from bottom-left (0,height) to top-right (width,0).
  // For any pixel (x, y), its position along this diagonal is:
  //   t = (x / width + (1 - y / height)) / 2
  // This gives t=0 at bottom-left and t=1 at top-right.

  for (let y = 0; y < height; y++) {
    // Vertical component of the diagonal position (constant per row)
    const yFactor = 1 - y / height;

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      // 1. Grayscale (luminance-weighted)
      const gray =
        0.299 * data[idx]! + 0.587 * data[idx + 1]! + 0.114 * data[idx + 2]!;

      // 2. Darkness: 0 = white pixel, 1 = black pixel (with contrast curve)
      const darkness = Math.pow(1 - gray / 255, gamma);

      // 3. Diagonal gradient position: 0 = bottom-left, 1 = top-right
      const t = (x / width + yFactor) / 2;

      // 4. Interpolate gradient color at this position
      const gr = colorBL.r + (colorTR.r - colorBL.r) * t;
      const gg = colorBL.g + (colorTR.g - colorBL.g) * t;
      const gb = colorBL.b + (colorTR.b - colorBL.b) * t;

      // 5. Blend between white (255) and gradient color based on darkness
      data[idx] = Math.round(255 + (gr - 255) * darkness);
      data[idx + 1] = Math.round(255 + (gg - 255) * darkness);
      data[idx + 2] = Math.round(255 + (gb - 255) * darkness);
      // Alpha stays unchanged
    }
  }

  // Write back to a new canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Full image processing pipeline:
 * 1. HEIC conversion (if needed)
 * 2. Load into image element
 * 3. Resize if too large (prevents mobile memory issues)
 * 4. Center-crop to target dimensions (cover-fit)
 * 5. Apply gradient duotone effect
 *
 * Returns the processed canvas and the original image dimensions (for
 * resolution warnings).
 */
export async function processPhoto(
  file: File,
  targetWidth: number,
  targetHeight: number,
  maxDimension: number,
  duotone: DuotoneConfig,
): Promise<{ canvas: HTMLCanvasElement; originalWidth: number; originalHeight: number }> {
  // 1. HEIC conversion
  const blob = isHEIC(file) ? await convertHEIC(file) : file;

  // 2. Load image
  const img = await loadImage(blob);
  const originalWidth = img.naturalWidth;
  const originalHeight = img.naturalHeight;

  // 3. Resize if needed
  const resized = resizeIfNeeded(img, maxDimension);

  // 4. Center-crop to target dimensions
  const cropped = centerCrop(resized, targetWidth, targetHeight);

  // 5. Apply gradient duotone effect
  const result = applyDuotone(cropped, duotone);

  return { canvas: result, originalWidth, originalHeight };
}
