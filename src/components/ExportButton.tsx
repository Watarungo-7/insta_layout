"use client";

import { downloadCanvas, downloadMultipleCanvases } from "../lib/exportCanvas";
import { LayoutMode } from "../lib/types";

interface ExportButtonProps {
  mode: LayoutMode;
  format: "png" | "jpeg";
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  carouselCanvasRefs?: React.MutableRefObject<HTMLCanvasElement[]>;
  slideCount?: number;
}

export default function ExportButton({
  mode,
  format,
  canvasRef,
  carouselCanvasRefs,
  slideCount,
}: ExportButtonProps) {
  const handleExport = () => {
    const ext = format === "png" ? "png" : "jpg";

    if (mode === "carousel" && carouselCanvasRefs && slideCount) {
      const canvases = carouselCanvasRefs.current.slice(0, slideCount);
      downloadMultipleCanvases(canvases, "carousel", format);
    } else if (canvasRef?.current) {
      downloadCanvas(canvasRef.current, `${mode}.${ext}`, format);
    }
  };

  return (
    <button
      onClick={handleExport}
      className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
    >
      {mode === "carousel"
        ? `${slideCount}枚を書き出し (${format.toUpperCase()})`
        : `書き出し (${format.toUpperCase()})`}
    </button>
  );
}
