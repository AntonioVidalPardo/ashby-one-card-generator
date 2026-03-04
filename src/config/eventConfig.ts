import type { EventConfig } from "../types";

/**
 * Central configuration for the Ashby One card generator.
 *
 * Photo frame coordinates measured from the original 3240×3240 reference
 * image (Attendee_v1.png) and divided by 3 for the 1080×1080 canvas.
 * Fine-tune these values or replace with Figma exports when available.
 */
export const eventConfig: EventConfig = {
  output: {
    width: 1080,
    height: 1080,
    filename: "ashby-one-card.png",
  },
  photoFrame: {
    x: 564,
    y: 585,
    width: 447,
    height: 417,
    borderWidth: 19,
    borderRadius: 21.7,
    borderColor: "#FFFFFF",
  },
  duotone: {
    gradient: {
      topRight: "#FED8E5",
      bottomLeft: "#3022C8",
    },
    contrast: 1.3,
  },
  templateSrc: "/template-bg.png",
  showcasePhotos: [
    "/showcase/1.jpg",
    "/showcase/2.jpg",
    "/showcase/3.jpg",
    "/showcase/4.jpg",
    "/showcase/5.jpg",
  ],
  upload: {
    maxFileSizeMB: 15,
    maxDimensionPx: 2048,
    minDimensionPx: 400,
    acceptedTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ],
  },
};
