"use client";

import { useState } from "react";
import { downloadCanvas } from "../lib/exportCanvas";
import { LayoutMode } from "../lib/types";

interface ExportButtonProps {
  mode: LayoutMode;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export default function ExportButton({
  mode,
  canvasRef,
}: ExportButtonProps) {
  const [saved, setSaved] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [format, setFormat] = useState<"png" | "jpeg">("jpeg");

  const handleExport = async () => {
    if (!canvasRef.current) return;
    const ext = format === "png" ? "png" : "jpg";
    await downloadCanvas(canvasRef.current, `insta_${mode}.${ext}`, format);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleShareToInstagram = async () => {
    if (!canvasRef.current) return;
    setSharing(true);

    try {
      const canvas = canvasRef.current;
      const mimeType = format === "png" ? "image/png" : "image/jpeg";
      const ext = format === "png" ? "png" : "jpg";

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, mimeType, 0.95)
      );
      if (!blob) return;

      const file = new File([blob], `insta_${mode}.${ext}`, { type: mimeType });

      // Try Web Share API (works on mobile browsers)
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "Instagram投稿用画像",
        });
        return;
      }

      // Fallback: download image, then try to open Instagram
      await handleExport();

      // Try Instagram deep link with a short delay
      const timeout = setTimeout(() => {
        // If we're still here, the app didn't open — open web Instagram
        window.open("https://www.instagram.com/", "_blank");
      }, 1500);

      // Try opening Instagram app
      const link = document.createElement("a");
      link.href = "instagram://app";
      link.click();

      // If the app opens, page will blur — cancel the web fallback
      const onBlur = () => {
        clearTimeout(timeout);
        window.removeEventListener("blur", onBlur);
      };
      window.addEventListener("blur", onBlur);

      // Clean up listener after timeout
      setTimeout(() => window.removeEventListener("blur", onBlur), 2000);
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        await handleExport();
      }
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Format toggle */}
      <div className="flex items-center justify-center gap-2">
        <div className="flex overflow-hidden rounded-full bg-gray-100">
          <button
            onClick={() => setFormat("jpeg")}
            className={`px-4 py-1.5 text-xs font-medium transition-all ${
              format === "jpeg"
                ? "bg-[var(--pink)] text-white shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            JPG
          </button>
          <button
            onClick={() => setFormat("png")}
            className={`px-4 py-1.5 text-xs font-medium transition-all ${
              format === "png"
                ? "bg-[var(--pink)] text-white shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            PNG
          </button>
        </div>
      </div>

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
