import { useCallback, useEffect, useRef, useState } from "react";
import { eventConfig } from "../config/eventConfig";
import { processPhoto } from "../lib/imageProcessor";
import { loadTemplateImage, renderCard } from "../lib/cardRenderer";
import type { UploadState } from "../types";
import PhotoUpload from "./PhotoUpload";
import CardPreview from "./CardPreview";
import DownloadButton from "./DownloadButton";

/**
 * Fetches an image URL and returns it as a File object
 * so it can be processed through the standard pipeline.
 */
async function fetchAsFile(url: string): Promise<File> {
  const response = await fetch(url);
  const blob = await response.blob();
  const filename = url.split("/").pop() ?? "photo.jpg";
  return new File([blob], filename, { type: blob.type });
}

export default function CardGenerator() {
  const templateRef = useRef<HTMLImageElement | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [renderedCard, setRenderedCard] = useState<HTMLCanvasElement | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  // Showcase cycling state
  const [showcaseCards, setShowcaseCards] = useState<HTMLCanvasElement[]>([]);
  const [showcaseIndex, setShowcaseIndex] = useState(0);

  // Preload template image on mount
  useEffect(() => {
    loadTemplateImage(eventConfig.templateSrc)
      .then((img) => {
        templateRef.current = img;
      })
      .catch(() => {
        setError("Failed to load card template. Please refresh the page.");
      });
  }, []);

  // Process showcase photos on mount
  useEffect(() => {
    let cancelled = false;

    async function loadShowcase() {
      const template = await loadTemplateImage(eventConfig.templateSrc);
      const { photoFrame, duotone, output, upload, showcasePhotos } =
        eventConfig;
      const innerW = photoFrame.width - 2 * photoFrame.borderWidth;
      const innerH = photoFrame.height - 2 * photoFrame.borderWidth;

      const cards: HTMLCanvasElement[] = [];

      for (const photoUrl of showcasePhotos) {
        if (cancelled) return;
        try {
          const file = await fetchAsFile(photoUrl);
          const { canvas: processedPhoto } = await processPhoto(
            file,
            innerW,
            innerH,
            upload.maxDimensionPx,
            duotone,
          );
          const card = renderCard(
            template,
            processedPhoto,
            output.width,
            output.height,
            photoFrame,
          );
          cards.push(card);
        } catch {
          // Skip showcase photos that fail to load (e.g. missing files)
        }
      }

      if (!cancelled && cards.length > 0) {
        setShowcaseCards(cards);
      }
    }

    loadShowcase();
    return () => {
      cancelled = true;
    };
  }, []);

  // Cycle through showcase cards every second (only while idle)
  useEffect(() => {
    if (uploadState !== "idle" || showcaseCards.length === 0) return;

    const interval = setInterval(() => {
      setShowcaseIndex((prev) => (prev + 1) % showcaseCards.length);
    }, 1000);

    return () => clearInterval(interval);
  }, [uploadState, showcaseCards.length]);

  const handlePhotoSelected = useCallback(async (file: File) => {
    setUploadState("processing");
    setError(null);
    setWarning(null);

    try {
      const { photoFrame, duotone, output, upload } = eventConfig;
      const innerW = photoFrame.width - 2 * photoFrame.borderWidth;
      const innerH = photoFrame.height - 2 * photoFrame.borderWidth;

      const { canvas: processedPhoto, originalWidth, originalHeight } =
        await processPhoto(file, innerW, innerH, upload.maxDimensionPx, duotone);

      // Check for low resolution
      const minDim = Math.min(originalWidth, originalHeight);
      if (minDim < upload.minDimensionPx) {
        setWarning(
          `Your photo is ${originalWidth}×${originalHeight}px — it may appear blurry. We recommend at least ${upload.minDimensionPx}×${upload.minDimensionPx}px.`,
        );
      }

      // Render card
      const template = templateRef.current;
      if (!template) {
        throw new Error("Template not loaded");
      }

      const card = renderCard(
        template,
        processedPhoto,
        output.width,
        output.height,
        photoFrame,
      );

      setRenderedCard(card);
      setUploadState("done");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";

      // Provide a user-friendly message for HEIC conversion failures
      if (message.includes("heic") || message.includes("HEIC")) {
        setError(
          "Could not process this photo. Try a JPG or PNG instead.",
        );
      } else {
        setError(
          "Something went wrong generating your card. Please try again.",
        );
      }
      setUploadState("error");
    }
  }, []);

  const handleReset = useCallback(() => {
    setUploadState("idle");
    setRenderedCard(null);
    setError(null);
    setWarning(null);
  }, []);

  // Show the user's card if uploaded, otherwise cycle showcase cards
  const displayCard =
    renderedCard ?? (showcaseCards.length > 0 ? showcaseCards[showcaseIndex] ?? null : null);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      {/* Header */}
      <div className="mb-10 text-center lg:mb-14">
        <h1 className="mb-3 font-display text-[36px] font-black uppercase leading-[1.05] tracking-[-0.02em] text-[#0E0C29] sm:text-[48px] md:text-[56px] lg:text-[68px]">
          Create your<br />Ashby One card
        </h1>
        <p className="text-base text-text-secondary sm:text-lg">
          Upload your photo and download your personalized attendee card.
        </p>
      </div>

      {/* Main content — two columns on desktop */}
      <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
        {/* Left: Card Preview with tilt */}
        <div className="mx-auto flex w-full max-w-[460px] items-center justify-center py-6 lg:mx-0">
          <div className="card-tilt w-full">
            <CardPreview
              renderedCard={displayCard}
              templateSrc={eventConfig.templateSrc}
            />
          </div>
        </div>

        {/* Right: Upload controls */}
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="mb-1 text-xl font-bold text-[#0E0C29]">
              Upload your best headshot!
            </h2>
            <p className="mb-5 text-[15px] text-text-muted">
              It will be cropped and tinted to create your personal card.
            </p>
            <PhotoUpload
              state={uploadState}
              onPhotoSelected={handlePhotoSelected}
              onReset={handleReset}
              error={error}
              warning={warning}
            />
          </div>

          <DownloadButton renderedCard={renderedCard} />
        </div>
      </div>
    </div>
  );
}
