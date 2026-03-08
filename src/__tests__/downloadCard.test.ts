import { describe, it, expect, vi } from "vitest";
import { downloadCard } from "../lib/downloadCard";

describe("downloadCard", () => {
  it("creates a download link and triggers a click", async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;

    const clickSpy = vi.fn();
    const createElementSpy = vi.spyOn(document, "createElement");
    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");

    // Mock the anchor element
    const mockAnchor = document.createElement("a");
    mockAnchor.click = clickSpy;
    createElementSpy.mockImplementation((tag: string) => {
      if (tag === "a") return mockAnchor;
      return document.createElement(tag);
    });

    await downloadCard(canvas, "test-card.png");

    expect(clickSpy).toHaveBeenCalledOnce();
    expect(mockAnchor.download).toBe("test-card.png");
    expect(appendChildSpy).toHaveBeenCalledWith(mockAnchor);
    expect(removeChildSpy).toHaveBeenCalledWith(mockAnchor);

    createElementSpy.mockRestore();
    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });
});
