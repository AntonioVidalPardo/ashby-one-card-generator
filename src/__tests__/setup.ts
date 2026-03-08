import { vi } from "vitest";

/**
 * Mock CanvasRenderingContext2D for jsdom which doesn't support canvas natively.
 */
function createMockContext(): Partial<CanvasRenderingContext2D> {
  return {
    drawImage: vi.fn(),
    getImageData: vi.fn(() => ({
      data: new Uint8ClampedArray(0),
      width: 0,
      height: 0,
      colorSpace: "srgb" as PredefinedColorSpace,
    })),
    putImageData: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    quadraticCurveTo: vi.fn(),
    closePath: vi.fn(),
    clip: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    stroke: vi.fn(),
    strokeRect: vi.fn(),
    strokeStyle: "",
    lineWidth: 1,
  };
}

// Patch HTMLCanvasElement.prototype.getContext
const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function (contextId: string, ...args: unknown[]) {
  if (contextId === "2d") {
    return createMockContext() as CanvasRenderingContext2D;
  }
  return originalGetContext.call(this, contextId, ...args);
} as typeof HTMLCanvasElement.prototype.getContext;

// Mock canvas.toBlob
HTMLCanvasElement.prototype.toBlob = function (callback: BlobCallback, type?: string) {
  const blob = new Blob(["mock-image-data"], { type: type ?? "image/png" });
  setTimeout(() => callback(blob), 0);
};
