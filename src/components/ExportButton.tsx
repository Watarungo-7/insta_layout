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
      className="w-full rounded-2xl bg-white px-6 py-3.5 text-sm font-semibold text-black transition-all hover:bg-gray-100 active:scale-[0.98]"
    >
      保存する
    </button>
  );
}
