import { useCallback, useEffect, useRef, useState } from "react";
import { eventConfig } from "../config/eventConfig";
import { processPhoto } from "../lib/imageProcessor";
import { loadTemplateImage, renderCard } from "../lib/cardRenderer";
import { getInnerFrameDimensions } from "../lib/canvasUtils";
import type { Edition, UploadState } from "../types";
import EditionToggle from "./EditionToggle";
import PhotoUpload from "./PhotoUpload";
import CardPreview from "./CardPreview";
import DownloadButton from "./DownloadButton";

/**
 * Fetches an image URL and returns it as a File object
 * so it can be processed through the standard pipeline.
 */
async function fetchAsFile(url: string): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status}`);
  }
  const blob = await response.blob();
  const filename = url.split("/").pop() ?? "photo.jpg";
  return new File([blob], filename, { type: blob.type });
}

/** Cached template load promises to avoid duplicate network requests. */
const templatePromises = new Map<string, Promise<HTMLImageElement>>();

function getTemplate(src: string): Promise<HTMLImageElement> {
  let promise = templatePromises.get(src);
  if (!promise) {
    promise = loadTemplateImage(src);
    templatePromises.set(src, promise);
  }
  return promise;
}

export default function CardGenerator() {
  const [edition, setEdition] = useState<Edition>(eventConfig.defaultEdition);

  // Template images keyed by edition
  const templatesRef = useRef<Partial<Record<Edition, HTMLImageElement>>>({});

  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [renderedCard, setRenderedCard] = useState<HTMLCanvasElement | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);

  // Store the processed photo so we can re-render on edition switch
  const processedPhotoRef = useRef<HTMLCanvasElement | null>(null);

  // Cancellation counter for user photo processing
  const processingGenRef = useRef(0);

  // Showcase cycling state — keyed by edition
  const [showcaseCards, setShowcaseCards] = useState<
    Partial<Record<Edition, HTMLCanvasElement[]>>
  >({});
  const [showcaseIndex, setShowcaseIndex] = useState(0);

  // Cache processed showcase photos (duotone is edition-independent)
  const showcasePhotosRef = useRef<HTMLCanvasElement[] | null>(null);

  const editionConfig = eventConfig.editions[edition];
  const { innerWidth: frameInnerW, innerHeight: frameInnerH } =
    getInnerFrameDimensions(eventConfig.photoFrame);

  // Preload both template images on mount
  useEffect(() => {
    for (const [key, config] of Object.entries(eventConfig.editions)) {
      getTemplate(config.templateSrc)
        .then((img) => {
          templatesRef.current[key as Edition] = img;
        })
        .catch(() => {
          // Template load failure is handled when trying to render
        });
    }
  }, []);

  // Process showcase photos for the current edition
  useEffect(() => {
    let cancelled = false;

    async function loadShowcase() {
      // Wait for this edition's template to load
      let template = templatesRef.current[edition];
      if (!template) {
        try {
          template = await getTemplate(
            eventConfig.editions[edition].templateSrc,
          );
          templatesRef.current[edition] = template;
        } catch {
          return;
        }
      }

      const { photoFrame, duotone, output, upload, showcasePhotos } =
        eventConfig;

      // Process showcase photos only once (duotone is the same across editions)
      let processedPhotos = showcasePhotosRef.current;
      if (!processedPhotos) {
        processedPhotos = [];
        for (const photoUrl of showcasePhotos) {
          if (cancelled) return;
          try {
            const file = await fetchAsFile(photoUrl);
            const { canvas: processedPhoto } = await processPhoto(
              file,
              frameInnerW,
              frameInnerH,
              upload.maxDimensionPx,
              duotone,
            );
            processedPhotos.push(processedPhoto);
          } catch {
            // Skip showcase photos that fail to load
          }
        }
        if (cancelled) return;
        showcasePhotosRef.current = processedPhotos;
      }

      // Render each processed photo onto the current edition's template
      const cards: HTMLCanvasElement[] = [];
      for (const processedPhoto of processedPhotos) {
        if (cancelled) return;
        const card = renderCard(
          template,
          processedPhoto,
          output.width,
          output.height,
          photoFrame,
        );
        cards.push(card);
      }

      if (!cancelled && cards.length > 0) {
        setShowcaseCards((prev) => ({ ...prev, [edition]: cards }));
      }
    }

    // Only load if we haven't already cached this edition's showcase
    if (!showcaseCards[edition]) {
      loadShowcase();
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [edition]);

  // Cycle through showcase cards every 2.5 seconds (only while idle)
  const currentShowcaseCards = showcaseCards[edition] ?? [];
  useEffect(() => {
    if (uploadState !== "idle" || currentShowcaseCards.length === 0) return;

    const interval = setInterval(() => {
      setShowcaseIndex((prev) => (prev + 1) % currentShowcaseCards.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [uploadState, currentShowcaseCards.length]);

  // Re-render the user's card when edition changes (if they already uploaded)
  useEffect(() => {
    const processedPhoto = processedPhotoRef.current;
    if (!processedPhoto || uploadState !== "done") return;

    const template = templatesRef.current[edition];
    if (!template) {
      // Template not loaded yet — wait for it
      getTemplate(eventConfig.editions[edition].templateSrc)
        .then((img) => {
          templatesRef.current[edition] = img;
          const card = renderCard(
            img,
            processedPhoto,
            eventConfig.output.width,
            eventConfig.output.height,
            eventConfig.photoFrame,
          );
          setRenderedCard(card);
        })
        .catch(() => {
          setError("Failed to load card template. Please refresh the page.");
        });
      return;
    }

    const card = renderCard(
      template,
      processedPhoto,
      eventConfig.output.width,
      eventConfig.output.height,
      eventConfig.photoFrame,
    );
    setRenderedCard(card);
  }, [edition, uploadState]);

  const handlePhotoSelected = useCallback(
    async (file: File) => {
      // Increment generation counter to cancel any previous in-flight processing
      const gen = ++processingGenRef.current;

      setUploadState("processing");
      setError(null);
      setWarning(null);

      try {
        const { photoFrame, duotone, output, upload } = eventConfig;

        const {
          canvas: processedPhoto,
          originalWidth,
          originalHeight,
        } = await processPhoto(
          file,
          frameInnerW,
          frameInnerH,
          upload.maxDimensionPx,
          duotone,
        );

        // If a newer upload started while we were processing, discard this result
        if (gen !== processingGenRef.current) return;

        // Store for re-rendering on edition switch
        processedPhotoRef.current = processedPhoto;

        // Check for low resolution
        const minDim = Math.min(originalWidth, originalHeight);
        if (minDim < upload.minDimensionPx) {
          setWarning(
            `Your photo is ${originalWidth}×${originalHeight}px — it may appear blurry. We recommend at least ${upload.minDimensionPx}×${upload.minDimensionPx}px.`,
          );
        }

        // Render card with current edition template
        let template = templatesRef.current[edition];
        if (!template) {
          template = await getTemplate(
            eventConfig.editions[edition].templateSrc,
          );
          templatesRef.current[edition] = template;
        }

        // Check again after async template load
        if (gen !== processingGenRef.current) return;

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
        // Discard errors from cancelled processing
        if (gen !== processingGenRef.current) return;

        const message =
          err instanceof Error ? err.message : "An unexpected error occurred";

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
    },
    [edition, frameInnerW, frameInnerH],
  );

  const handleReset = useCallback(() => {
    setUploadState("idle");
    setRenderedCard(null);
    processedPhotoRef.current = null;
    setError(null);
    setWarning(null);
  }, []);

  // Show the user's card if uploaded, otherwise cycle showcase cards
  const displayCard =
    renderedCard ??
    (currentShowcaseCards.length > 0
      ? currentShowcaseCards[showcaseIndex] ?? null
      : null);

  return (
    <div className="mx-auto w-full max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
      {/* Header */}
      <div className="mb-8 text-center lg:mb-10">
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
              templateSrc={editionConfig.templateSrc}
            />
          </div>
        </div>

        {/* Right: Toggle + Upload controls */}
        <div className="flex flex-col gap-6">
          <EditionToggle value={edition} onChange={setEdition} />

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

          <DownloadButton
            renderedCard={renderedCard}
            filename={editionConfig.filename}
          />
        </div>
      </div>
    </div>
  );
}
