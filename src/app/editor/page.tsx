"use client";

import { useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LayoutMode, LayoutTemplate, CropState } from "../../lib/types";
import { PRESETS, TEMPLATES_BY_MODE } from "../../lib/constants";
import { useMultiImageLoader } from "../../hooks/useImageLoader";
import DropZone from "../../components/DropZone";
import CanvasPreview from "../../components/CanvasPreview";
import TemplateSelector from "../../components/TemplateSelector";
import Toolbar from "../../components/Toolbar";
import ExportButton from "../../components/ExportButton";

function EditorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = (searchParams.get("mode") as LayoutMode) || "feed";
  const preset = PRESETS[mode] || PRESETS.feed;
  const templates = TEMPLATES_BY_MODE[mode] || TEMPLATES_BY_MODE.feed;

  const [template, setTemplate] = useState<LayoutTemplate>(templates[0]);
  const [files, setFiles] = useState<File[]>([]);
  const images = useMultiImageLoader(files);
  const [crops, setCrops] = useState<CropState[]>([]);
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [format, setFormat] = useState<"png" | "jpeg">("png");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleTemplateChange = useCallback(
    (t: LayoutTemplate) => {
      setTemplate(t);
      // Reset files and crops if slot count changes
      if (t.slots !== template.slots) {
        setFiles([]);
        setCrops([]);
        setSelectedSlot(0);
      }
    },
    [template.slots]
  );

  const handleImagesSelected = useCallback(
    (newFiles: File[]) => {
      setFiles((prev) => {
        const updated = [...prev, ...newFiles].slice(0, template.slots);
        return updated;
      });
      setCrops((prev) => {
        const updated = [...prev];
        for (let i = prev.length; i < prev.length + newFiles.length; i++) {
          updated.push({ scale: 1, offsetX: 0.5, offsetY: 0.5 });
        }
        return updated.slice(0, template.slots);
      });
    },
    [template.slots]
  );

  const handleCropChange = useCallback(
    (crop: CropState) => {
      setCrops((prev) => {
        const updated = [...prev];
        updated[selectedSlot] = crop;
        return updated;
      });
    },
    [selectedSlot]
  );

  const handleReset = () => {
    setFiles([]);
    setCrops([]);
    setSelectedSlot(0);
  };

  const currentCrop = crops[selectedSlot] || {
    scale: 1,
    offsetX: 0.5,
    offsetY: 0.5,
  };

  return (
    <div className="flex min-h-screen flex-col items-center px-4 py-8">
      <div className="mb-6 flex w-full max-w-4xl items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="text-sm text-gray-400 transition-colors hover:text-white"
        >
          &larr; 戻る
        </button>
        <h1 className="text-xl font-semibold text-white">
          {preset.label}
          <span className="ml-2 text-sm font-normal text-gray-500">
            {preset.aspectRatio}
          </span>
        </h1>
        {files.length > 0 ? (
          <button
            onClick={handleReset}
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            リセット
          </button>
        ) : (
          <div />
        )}
      </div>

      <div className="flex w-full max-w-4xl flex-col gap-5">
        {/* Template selector */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900 p-4">
          <p className="mb-3 text-sm font-medium text-gray-300">
            レイアウト
          </p>
          <TemplateSelector
            templates={templates}
            selectedId={template.id}
            onSelect={handleTemplateChange}
          />
        </div>

        {/* Canvas preview */}
        <CanvasPreview
          images={images}
          preset={preset}
          template={template}
          crops={crops}
          canvasRef={canvasRef}
        />

        {/* Drop zone for adding images */}
        <DropZone
          onImagesSelected={handleImagesSelected}
          maxImages={template.slots}
          currentCount={files.length}
        />

        {/* Image thumbnails */}
        {files.length > 0 && (
          <div className="flex gap-2">
            {files.map((file, i) => (
              <button
                key={i}
                onClick={() => setSelectedSlot(i)}
                className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 transition-all ${
                  selectedSlot === i
                    ? "border-blue-500"
                    : "border-gray-700 hover:border-gray-500"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(file)}
                  alt={`画像 ${i + 1}`}
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-0 right-0 rounded-tl bg-black/70 px-1 text-xs text-white">
                  {i + 1}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <Toolbar
          selectedSlot={selectedSlot}
          totalSlots={template.slots}
          crop={currentCrop}
          onCropChange={handleCropChange}
          onSlotSelect={setSelectedSlot}
          format={format}
          onFormatChange={setFormat}
          hasImage={!!images[selectedSlot]}
        />

        {/* Export */}
        <ExportButton mode={mode} format={format} canvasRef={canvasRef} />
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
