import { useCallback, useRef, useState } from "react";
import type { UploadState } from "../types";
import { eventConfig } from "../config/eventConfig";

interface PhotoUploadProps {
  state: UploadState;
  onPhotoSelected: (file: File) => void;
  onReset: () => void;
  error: string | null;
  warning: string | null;
}

const { upload } = eventConfig;

function validateFile(file: File): string | null {
  // Check type — handle the case where HEIC files may report as ""
  const isAcceptedType = upload.acceptedTypes.includes(file.type.toLowerCase());
  const name = file.name.toLowerCase();
  const isHEICByName = name.endsWith(".heic") || name.endsWith(".heif");

  if (!isAcceptedType && !isHEICByName) {
    return "Please upload a JPG, PNG, WebP, or HEIC image.";
  }

  // Check size
  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > upload.maxFileSizeMB) {
    return `Photo must be under ${upload.maxFileSizeMB}MB.`;
  }

  return null;
}

export default function PhotoUpload({
  state,
  onPhotoSelected,
  onReset,
  error,
  warning,
}: PhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      const err = validateFile(file);
      if (err) {
        setValidationError(err);
        return;
      }
      setValidationError(null);
      onPhotoSelected(file);
    },
    [onPhotoSelected],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      // Reset input so the same file can be re-selected
      if (inputRef.current) inputRef.current.value = "";
    },
    [handleFile],
  );

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const displayError = validationError || error;

  // Processing state
  if (state === "processing") {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface px-6 py-10">
        <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-text-secondary">
          Processing your photo...
        </p>
      </div>
    );
  }

  // Done state — photo already uploaded
  if (state === "done") {
    return (
      <div className="flex flex-col items-center gap-3">
        {warning && (
          <div className="w-full rounded-lg border border-warning-border bg-warning-bg px-4 py-3 text-sm text-warning-text">
            {warning}
          </div>
        )}
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center rounded-md border border-primary-border bg-primary-light px-5 text-[15px] font-medium text-primary transition-colors hover:bg-primary-light-hover"
        >
          Change photo
        </button>
      </div>
    );
  }

  // Idle / error state — show drop zone
  return (
    <div className="flex flex-col gap-3">
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${
          isDragOver
            ? "border-primary bg-primary-light"
            : "border-border bg-surface hover:border-primary hover:bg-[#FAFAFF]"
        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`}
      >
        {/* Upload icon */}
        <svg
          className="mb-3 h-10 w-10 text-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
          />
        </svg>
        <p className="mb-1 text-base font-medium text-text-secondary">
          Drag and drop your photo here
        </p>
        <p className="text-sm text-text-muted">
          or click to browse &middot; JPG, PNG, WebP, HEIC
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.heic,.heif"
        onChange={handleInputChange}
        className="hidden"
        aria-label="Upload photo"
      />

      {displayError && (
        <div className="rounded-lg border border-error-border bg-error-bg px-4 py-3 text-sm text-error">
          {displayError}
        </div>
      )}
    </div>
  );
}
