import { describe, it, expect } from "vitest";
import { getContext2D, getInnerFrameDimensions, releaseCanvas } from "../lib/canvasUtils";
import type { PhotoFrameConfig } from "../types";

describe("getContext2D", () => {
  it("returns a 2D rendering context from a valid canvas", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;
    const ctx = getContext2D(canvas);
    expect(ctx).toBeTruthy();
    expect(ctx).toHaveProperty("drawImage");
    expect(ctx).toHaveProperty("getImageData");
  });
});

describe("getInnerFrameDimensions", () => {
  it("subtracts double the border width from width and height", () => {
    const frame: PhotoFrameConfig = {
      x: 100,
      y: 100,
      width: 400,
      height: 300,
      borderWidth: 20,
      borderRadius: 10,
      borderColor: "#FFFFFF",
    };
    const { innerWidth, innerHeight } = getInnerFrameDimensions(frame);
    expect(innerWidth).toBe(360); // 400 - 2*20
    expect(innerHeight).toBe(260); // 300 - 2*20
  });

  it("returns full dimensions when border width is 0", () => {
    const frame: PhotoFrameConfig = {
      x: 0,
      y: 0,
      width: 200,
      height: 150,
      borderWidth: 0,
      borderRadius: 0,
      borderColor: "#000000",
    };
    const { innerWidth, innerHeight } = getInnerFrameDimensions(frame);
    expect(innerWidth).toBe(200);
    expect(innerHeight).toBe(150);
  });
});

describe("releaseCanvas", () => {
  it("sets canvas dimensions to 0 to free memory", () => {
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 300;
    releaseCanvas(canvas);
    expect(canvas.width).toBe(0);
    expect(canvas.height).toBe(0);
  });
});
