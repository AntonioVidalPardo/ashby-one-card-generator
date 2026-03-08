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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!renderedCard || !canvasRef.current) return;

    const displayCanvas = canvasRef.current;
    displayCanvas.width = renderedCard.width;
    displayCanvas.height = renderedCard.height;
    const ctx = displayCanvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(renderedCard, 0, 0);
    }
  }, [renderedCard]);

  return (
    <div
      className="overflow-hidden rounded-[2%] shadow-card"
      aria-label="Card preview"
    >
      {renderedCard ? (
        <canvas
          ref={canvasRef}
          className="h-auto w-full rounded-[2%]"
        />
      ) : (
        <img
          src={templateSrc}
          alt="Card preview — upload a photo to personalize"
          className="h-auto w-full rounded-[2%]"
        />
      )}
    </div>
  );
}
