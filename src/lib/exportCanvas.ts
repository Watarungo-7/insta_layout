import { EXPORT_QUALITY } from "./constants";

export function downloadCanvas(
  canvas: HTMLCanvasElement,
  fileName: string,
  format: "png" | "jpeg" = "png"
): void {
  const mimeType = format === "png" ? "image/png" : "image/jpeg";
  const quality = format === "jpeg" ? EXPORT_QUALITY : undefined;

  canvas.toBlob(
    (blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    },
    mimeType,
    quality
  );
}
