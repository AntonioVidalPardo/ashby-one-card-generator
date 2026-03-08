import { describe, it, expect } from "vitest";
import { eventConfig } from "../config/eventConfig";

const { upload } = eventConfig;

/**
 * Mirrors the validateFile logic from PhotoUpload.tsx for testability.
 * This tests the validation rules without needing to render a component.
 */
function validateFile(file: File): string | null {
  const isAcceptedType = upload.acceptedTypes.includes(file.type.toLowerCase());
  const name = file.name.toLowerCase();
  const isHEICByName = name.endsWith(".heic") || name.endsWith(".heif");

  if (!isAcceptedType && !isHEICByName) {
    return "Please upload a JPG, PNG, WebP, or HEIC image.";
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > upload.maxFileSizeMB) {
    return `Photo must be under ${upload.maxFileSizeMB}MB.`;
  }

  return null;
}

describe("validateFile", () => {
  it("accepts JPEG files", () => {
    const file = new File(["data"], "photo.jpg", { type: "image/jpeg" });
    expect(validateFile(file)).toBeNull();
  });

  it("accepts PNG files", () => {
    const file = new File(["data"], "photo.png", { type: "image/png" });
    expect(validateFile(file)).toBeNull();
  });

  it("accepts WebP files", () => {
    const file = new File(["data"], "photo.webp", { type: "image/webp" });
    expect(validateFile(file)).toBeNull();
  });

  it("accepts HEIC files by MIME type", () => {
    const file = new File(["data"], "photo.heic", { type: "image/heic" });
    expect(validateFile(file)).toBeNull();
  });

  it("accepts HEIC files by extension when MIME is empty", () => {
    const file = new File(["data"], "IMG_001.HEIC", { type: "" });
    expect(validateFile(file)).toBeNull();
  });

  it("accepts HEIF files by extension", () => {
    const file = new File(["data"], "photo.heif", { type: "" });
    expect(validateFile(file)).toBeNull();
  });

  it("rejects unsupported file types", () => {
    const file = new File(["data"], "document.pdf", { type: "application/pdf" });
    expect(validateFile(file)).toBe("Please upload a JPG, PNG, WebP, or HEIC image.");
  });

  it("rejects GIF files", () => {
    const file = new File(["data"], "animation.gif", { type: "image/gif" });
    expect(validateFile(file)).toBe("Please upload a JPG, PNG, WebP, or HEIC image.");
  });

  it("rejects files that exceed the size limit", () => {
    // Create a file that exceeds maxFileSizeMB
    const sizeBytes = (upload.maxFileSizeMB + 1) * 1024 * 1024;
    const file = new File([new ArrayBuffer(sizeBytes)], "large.jpg", {
      type: "image/jpeg",
    });
    expect(validateFile(file)).toBe(`Photo must be under ${upload.maxFileSizeMB}MB.`);
  });

  it("accepts files at exactly the size limit", () => {
    // Create a file at exactly maxFileSizeMB
    const sizeBytes = upload.maxFileSizeMB * 1024 * 1024;
    const file = new File([new ArrayBuffer(sizeBytes)], "exact.jpg", {
      type: "image/jpeg",
    });
    expect(validateFile(file)).toBeNull();
  });

  it("checks type before size (type error takes priority)", () => {
    const sizeBytes = (upload.maxFileSizeMB + 1) * 1024 * 1024;
    const file = new File([new ArrayBuffer(sizeBytes)], "big.pdf", {
      type: "application/pdf",
    });
    expect(validateFile(file)).toBe("Please upload a JPG, PNG, WebP, or HEIC image.");
  });
});
