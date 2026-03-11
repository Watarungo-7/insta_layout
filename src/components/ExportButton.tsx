"use client";

import { downloadCanvas } from "../lib/exportCanvas";
import { LayoutMode } from "../lib/types";

interface ExportButtonProps {
  mode: LayoutMode;
  format: "png" | "jpeg";
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function ExportButton({
  mode,
  format,
  canvasRef,
}: ExportButtonProps) {
  const handleExport = async () => {
    if (!canvasRef.current) return;
    const ext = format === "png" ? "png" : "jpg";
    await downloadCanvas(canvasRef.current, `insta_${mode}.${ext}`, format);
  };

  return (
    <button
      onClick={handleExport}
      className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700"
    >
      画像をダウンロード ({format.toUpperCase()})
    </button>
  );
}
