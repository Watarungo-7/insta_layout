"use client";

import { useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LayoutMode, CropState } from "../../lib/types";
import { PRESETS, DEFAULT_CAROUSEL_SLIDES } from "../../lib/constants";
import { useImageLoader } from "../../hooks/useImageLoader";
import DropZone from "../../components/DropZone";
import CanvasPreview from "../../components/CanvasPreview";
import CarouselPreview from "../../components/CarouselPreview";
import Toolbar from "../../components/Toolbar";
import ExportButton from "../../components/ExportButton";

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = (searchParams.get("mode") as LayoutMode) || "feed";
  const preset = PRESETS[mode] || PRESETS.feed;

  const [file, setFile] = useState<File | null>(null);
  const image = useImageLoader(file);
  const [crop, setCrop] = useState<CropState>({
    scale: 1,
    offsetX: 0.5,
    offsetY: 0.5,
  });
  const [slideCount, setSlideCount] = useState(DEFAULT_CAROUSEL_SLIDES);
  const [format, setFormat] = useState<"png" | "jpeg">("png");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const carouselCanvasRefs = useRef<HTMLCanvasElement[]>([]);

  const handleReset = () => {
    setFile(null);
    setCrop({ scale: 1, offsetX: 0.5, offsetY: 0.5 });
  };

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-8">
      <div className="mb-6 flex w-full max-w-4xl items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-gray-400 transition-colors hover:text-white"
        >
          &larr; モード選択に戻る
        </button>
        <h1 className="text-xl font-semibold text-white">
          {preset.label}
          <span className="ml-2 text-sm font-normal text-gray-500">
            {preset.aspectRatio}
          </span>
        </h1>
        {image && (
          <button
            onClick={handleReset}
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            画像を変更
          </button>
        )}
        {!image && <div />}
      </div>

      <div className="flex w-full max-w-4xl flex-col gap-6">
        {!image ? (
          <DropZone onImageSelected={setFile} />
        ) : (
          <>
            {mode === "carousel" ? (
              <CarouselPreview
                image={image}
                slideCount={slideCount}
                crop={crop}
                canvasRefs={carouselCanvasRefs}
              />
            ) : (
              <CanvasPreview
                image={image}
                preset={preset}
                crop={crop}
                canvasRef={canvasRef}
              />
            )}

            <Toolbar
              mode={mode}
              crop={crop}
              onCropChange={setCrop}
              slideCount={slideCount}
              onSlideCountChange={setSlideCount}
              format={format}
              onFormatChange={setFormat}
            />

            <ExportButton
              mode={mode}
              format={format}
              canvasRef={canvasRef}
              carouselCanvasRefs={carouselCanvasRefs}
              slideCount={slideCount}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default function EditorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-gray-400">
          読み込み中...
        </div>
      }
    >
      <EditorContent />
    </Suspense>
  );
}
