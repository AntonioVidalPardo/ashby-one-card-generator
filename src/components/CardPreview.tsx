import { useEffect, useRef } from "react";

interface CardPreviewProps {
  /** The rendered card canvas, or null if no card has been generated yet */
  renderedCard: HTMLCanvasElement | null;
  /** The template image src to show as placeholder before upload */
  templateSrc: string;
}

export default function CardPreview({
  renderedCard,
  templateSrc,
}: CardPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous content
    container.innerHTML = "";

    if (renderedCard) {
      // Show the rendered card canvas
      const displayCanvas = document.createElement("canvas");
      displayCanvas.width = renderedCard.width;
      displayCanvas.height = renderedCard.height;
      displayCanvas.className = "h-auto w-full rounded-[2%]";
      const ctx = displayCanvas.getContext("2d")!;
      ctx.drawImage(renderedCard, 0, 0);
      container.appendChild(displayCanvas);
    } else {
      // Show the template as a placeholder
      const img = document.createElement("img");
      img.src = templateSrc;
      img.alt = "Card preview — upload a photo to personalize";
      img.className = "h-auto w-full rounded-[2%]";
      container.appendChild(img);
    }
  }, [renderedCard, templateSrc]);

  return (
    <div
      ref={containerRef}
      className="overflow-hidden rounded-[2%] shadow-card"
      aria-label="Card preview"
    />
  );
}
