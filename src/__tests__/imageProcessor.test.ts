import { describe, it, expect } from "vitest";
import { hexToRGB, isHEIC, centerCrop } from "../lib/imageProcessor";

describe("hexToRGB", () => {
  it("parses a 6-digit hex color with hash", () => {
    expect(hexToRGB("#3022C8")).toEqual({ r: 48, g: 34, b: 200 });
  });

  it("parses a 6-digit hex color without hash", () => {
    expect(hexToRGB("FED8E5")).toEqual({ r: 254, g: 216, b: 229 });
  });

  it("parses black", () => {
    expect(hexToRGB("#000000")).toEqual({ r: 0, g: 0, b: 0 });
  });

  it("parses white", () => {
    expect(hexToRGB("#FFFFFF")).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("parses lowercase hex", () => {
    expect(hexToRGB("#ff0000")).toEqual({ r: 255, g: 0, b: 0 });
  });
});

describe("isHEIC", () => {
  it("detects HEIC by MIME type", () => {
    const file = new File([], "photo.jpg", { type: "image/heic" });
    expect(isHEIC(file)).toBe(true);
  });

  it("detects HEIF by MIME type", () => {
    const file = new File([], "photo.jpg", { type: "image/heif" });
    expect(isHEIC(file)).toBe(true);
  });

  it("detects HEIC by file extension when MIME is empty", () => {
    const file = new File([], "IMG_001.HEIC", { type: "" });
    expect(isHEIC(file)).toBe(true);
  });

  it("detects HEIF by file extension", () => {
    const file = new File([], "photo.heif", { type: "" });
    expect(isHEIC(file)).toBe(true);
  });

  it("returns false for JPEG", () => {
    const file = new File([], "photo.jpg", { type: "image/jpeg" });
    expect(isHEIC(file)).toBe(false);
  });

  it("returns false for PNG", () => {
    const file = new File([], "photo.png", { type: "image/png" });
    expect(isHEIC(file)).toBe(false);
  });

  it("is case-insensitive on MIME type", () => {
    const file = new File([], "photo.jpg", { type: "IMAGE/HEIC" });
    expect(isHEIC(file)).toBe(true);
  });
});

describe("centerCrop", () => {
  function makeCanvas(w: number, h: number): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    return canvas;
  }

  it("crops a wider source to target dimensions", () => {
    const source = makeCanvas(800, 400); // 2:1 aspect
    const result = centerCrop(source, 200, 200); // 1:1 target
    expect(result.width).toBe(200);
    expect(result.height).toBe(200);
  });

  it("crops a taller source to target dimensions", () => {
    const source = makeCanvas(400, 800); // 1:2 aspect
    const result = centerCrop(source, 200, 200); // 1:1 target
    expect(result.width).toBe(200);
    expect(result.height).toBe(200);
  });

  it("handles source matching target aspect ratio", () => {
    const source = makeCanvas(600, 400); // 3:2 aspect
    const result = centerCrop(source, 300, 200); // same 3:2 aspect
    expect(result.width).toBe(300);
    expect(result.height).toBe(200);
  });

  it("handles square source to non-square target", () => {
    const source = makeCanvas(500, 500);
    const result = centerCrop(source, 300, 200);
    expect(result.width).toBe(300);
    expect(result.height).toBe(200);
  });
});
