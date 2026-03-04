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
  templateSrc: `${import.meta.env.BASE_URL}template-bg.png`,
  showcasePhotos: [
    `${import.meta.env.BASE_URL}showcase/1.jpg`,
    `${import.meta.env.BASE_URL}showcase/2.jpg`,
    `${import.meta.env.BASE_URL}showcase/3.jpg`,
    `${import.meta.env.BASE_URL}showcase/4.jpg`,
    `${import.meta.env.BASE_URL}showcase/5.jpg`,
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
