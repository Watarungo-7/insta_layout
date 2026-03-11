import { EXPORT_QUALITY } from "./constants";

function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: "png" | "jpeg"
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const mimeType = format === "png" ? "image/png" : "image/jpeg";
    const quality = format === "jpeg" ? EXPORT_QUALITY : undefined;
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob"));
      },
      mimeType,
      quality
    );
  });
}

export async function downloadCanvas(
  canvas: HTMLCanvasElement,
  fileName: string,
  format: "png" | "jpeg" = "png"
): Promise<void> {
  const mimeType = format === "png" ? "image/png" : "image/jpeg";
  const blob = await canvasToBlob(canvas, format);
  const file = new File([blob], fileName, { type: mimeType });

  // Use Web Share API if available (iOS Safari) — shows "Save Image" option
  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (e) {
      // User cancelled share sheet — that's fine, don't fallback
      if (e instanceof Error && e.name === "AbortError") return;
    }
  }

  // Fallback: traditional download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
