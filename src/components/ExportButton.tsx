"use client";

import { useState } from "react";
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
  const [saved, setSaved] = useState(false);

  const handleExport = async () => {
    if (!canvasRef.current) return;
    const ext = format === "png" ? "png" : "jpg";
    await downloadCanvas(canvasRef.current, `insta_${mode}.${ext}`, format);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleShareInstagram = async () => {
    if (!canvasRef.current) return;

    const mimeType = format === "png" ? "image/png" : "image/jpeg";

    // Try Web Share API (works on mobile Safari/Chrome)
    if (navigator.share && navigator.canShare) {
      try {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvasRef.current!.toBlob(resolve, mimeType, 0.95)
        );
        if (!blob) return;

        const ext = format === "png" ? "png" : "jpg";
        const file = new File([blob], `insta_${mode}.${ext}`, { type: mimeType });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
          });
          return;
        }
      } catch (e) {
        // User cancelled or share failed — fall through
        if ((e as Error).name === "AbortError") return;
      }
    }

    // Fallback: save image first, then open Instagram
    await handleExport();
    window.open("https://www.instagram.com/", "_blank");
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Save button */}
      <button
        onClick={handleExport}
        className="w-full rounded-2xl px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg active:scale-[0.98]"
        style={{ background: "var(--pink)" }}
      >
        {saved ? "保存しました" : "保存する"}
      </button>

      {/* Instagram share */}
      <button
        onClick={handleShareInstagram}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
        </svg>
        Instagramに投稿
      </button>
    </div>
  );
}
