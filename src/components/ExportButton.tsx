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

  const openInstagramApp = () => {
    // Try deep link to Instagram app
    // On iOS: instagram:// opens the app
    // Fallback after timeout = app not installed → open web
    const timeout = setTimeout(() => {
      window.open("https://www.instagram.com/", "_blank");
    }, 1500);

    const handleBlur = () => {
      // If window loses focus, the app opened successfully
      clearTimeout(timeout);
      window.removeEventListener("blur", handleBlur);
    };
    window.addEventListener("blur", handleBlur);

    window.location.href = "instagram://";
  };

  const handlePostToFeed = async () => {
    if (!canvasRef.current) return;
    // Save image first so it's in camera roll
    const ext = format === "png" ? "png" : "jpg";
    await downloadCanvas(canvasRef.current, `insta_${mode}.${ext}`, format);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    // Then open Instagram
    openInstagramApp();
  };

  const handlePostToStory = async () => {
    if (!canvasRef.current) return;
    const ext = format === "png" ? "png" : "jpg";
    await downloadCanvas(canvasRef.current, `insta_${mode}.${ext}`, format);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);

    // Try story camera deep link, fallback to generic
    const timeout = setTimeout(() => {
      window.location.href = "instagram://";
    }, 1500);

    const handleBlur = () => {
      clearTimeout(timeout);
      window.removeEventListener("blur", handleBlur);
    };
    window.addEventListener("blur", handleBlur);

    window.location.href = "instagram://story-camera";
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

      {/* Instagram actions */}
      <div className="flex gap-2">
        <button
          onClick={handlePostToFeed}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
        >
          <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor"/>
          </svg>
          フィード投稿
        </button>
        <button
          onClick={handlePostToStory}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
        >
          <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 2"/>
            <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
          ストーリー投稿
        </button>
      </div>
    </div>
  );
}
