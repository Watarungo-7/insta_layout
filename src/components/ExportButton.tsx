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
  const [sharing, setSharing] = useState(false);

  const handleExport = async () => {
    if (!canvasRef.current) return;
    const ext = format === "png" ? "png" : "jpg";
    await downloadCanvas(canvasRef.current, `insta_${mode}.${ext}`, format);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const getCanvasBlob = (): Promise<Blob | null> => {
    if (!canvasRef.current) return Promise.resolve(null);
    const mimeType = format === "png" ? "image/png" : "image/jpeg";
    return new Promise((resolve) =>
      canvasRef.current!.toBlob(resolve, mimeType, 0.95)
    );
  };

  const handleShareToInstagram = async () => {
    if (!canvasRef.current) return;
    setSharing(true);

    try {
      const blob = await getCanvasBlob();
      if (!blob) return;

      const ext = format === "png" ? "png" : "jpg";
      const mimeType = format === "png" ? "image/png" : "image/jpeg";
      const file = new File([blob], `insta_${mode}.${ext}`, { type: mimeType });

      // Web Share API — passes the image file directly to selected app
      // When user picks Instagram/Instagram Stories, the image is pre-loaded
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        return;
      }

      // Fallback: save image + open Instagram
      await handleExport();
      window.location.href = "instagram://";
      setTimeout(() => {
        // If still here after 2s, app probably not installed
        window.open("https://www.instagram.com/", "_blank");
      }, 2000);
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        // Share failed — fallback to save
        await handleExport();
      }
    } finally {
      setSharing(false);
    }
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

      {/* Instagram share — uses OS share sheet which allows picking Instagram/Stories directly */}
      <button
        onClick={handleShareToInstagram}
        disabled={sharing}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:shadow-md active:scale-[0.98] disabled:opacity-50"
      >
        <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/>
          <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
        </svg>
        {sharing ? "準備中..." : "Instagramに投稿"}
      </button>
      <p className="text-center text-[10px] leading-relaxed text-gray-400">
        シェアシートからInstagramまたは<br />ストーリーズを選んで投稿できます
      </p>
    </div>
  );
}
