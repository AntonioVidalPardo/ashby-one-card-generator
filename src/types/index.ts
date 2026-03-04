export interface PhotoFrameConfig {
  /** X position of the frame (including border) on the 1080×1080 canvas */
  x: number;
  /** Y position of the frame (including border) on the 1080×1080 canvas */
  y: number;
  /** Total width of the frame including border */
  width: number;
  /** Total height of the frame including border */
  height: number;
  /** White border thickness in pixels */
  borderWidth: number;
  /** Corner radius of the frame (0 for square corners) */
  borderRadius: number;
  /** Border color */
  borderColor: string;
}

export interface DuotoneConfig {
  /** Diagonal gradient applied to the image (bottom-left → top-right) */
  gradient: {
    /** Color at the top-right corner */
    topRight: string;
    /** Color at the bottom-left corner */
    bottomLeft: string;
  };
  /** Contrast boost (1.0 = unchanged, >1.0 = punchier). Default: 1.0 */
  contrast?: number;
}

export interface OutputConfig {
  width: number;
  height: number;
  filename: string;
}

export interface UploadConfig {
  maxFileSizeMB: number;
  maxDimensionPx: number;
  minDimensionPx: number;
  acceptedTypes: string[];
}

export interface EventConfig {
  output: OutputConfig;
  photoFrame: PhotoFrameConfig;
  duotone: DuotoneConfig;
  templateSrc: string;
  /** Showcase photos to cycle through before the user uploads their own */
  showcasePhotos: string[];
  upload: UploadConfig;
}

export type UploadState = "idle" | "processing" | "done" | "error";
