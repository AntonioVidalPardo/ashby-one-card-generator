/**
 * Exports a canvas as a PNG and triggers a browser download.
 */
export function downloadCard(
  canvas: HTMLCanvasElement,
  filename: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to generate image"));
          return;
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Small delay before revoking to ensure the download starts
        setTimeout(() => {
          URL.revokeObjectURL(url);
          resolve();
        }, 100);
      },
      "image/png",
    );
  });
}
