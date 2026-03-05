import { useCallback, useState } from "react";
import { downloadCard } from "../lib/downloadCard";

interface DownloadButtonProps {
  renderedCard: HTMLCanvasElement | null;
  filename: string;
}

export default function DownloadButton({ renderedCard, filename }: DownloadButtonProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!renderedCard) return;
    setIsDownloading(true);
    try {
      await downloadCard(renderedCard, filename);
    } catch {
      // Silently fail — the blob generation is unlikely to error
    } finally {
      setIsDownloading(false);
    }
  }, [renderedCard, filename]);

  const disabled = !renderedCard || isDownloading;

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={disabled}
      className={`inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-6 text-[15px] font-semibold text-white transition-all ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : "hover:bg-primary-hover active:scale-[0.97]"
      }`}
    >
      {isDownloading ? (
        <>
          <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Preparing...
        </>
      ) : (
        "Download your card"
      )}
    </button>
  );
}
