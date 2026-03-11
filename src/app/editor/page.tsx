"use client";

import { useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { LayoutMode, LayoutTemplate, CropState } from "../../lib/types";
import { PRESETS, TEMPLATES_BY_MODE } from "../../lib/constants";
import { useMultiImageLoader } from "../../hooks/useImageLoader";
import DropZone from "../../components/DropZone";
import CanvasPreview from "../../components/CanvasPreview";
import TemplateSelector from "../../components/TemplateSelector";
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

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleTemplateChange = useCallback(
    (t: LayoutTemplate) => {
      setTemplate(t);
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

  const handleCropChangeByIndex = useCallback(
    (index: number, crop: CropState) => {
      setCrops((prev) => {
        const updated = [...prev];
        updated[index] = crop;
        return updated;
      });
    },
    []
  );

  const handleSwapSlots = useCallback(
    (a: number, b: number) => {
      setFiles((prev) => {
        const updated = [...prev];
        [updated[a], updated[b]] = [updated[b], updated[a]];
        return updated;
      });
      setCrops((prev) => {
        const updated = [...prev];
        [updated[a], updated[b]] = [updated[b], updated[a]];
        return updated;
      });
    },
    []
  );

  const handleReplaceImage = useCallback(
    (slotIndex: number) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          setFiles((prev) => {
            const updated = [...prev];
            updated[slotIndex] = file;
            return updated;
          });
          setCrops((prev) => {
            const updated = [...prev];
            updated[slotIndex] = { scale: 1, offsetX: 0.5, offsetY: 0.5 };
            return updated;
          });
        }
      };
      input.click();
    },
    []
  );

  const handleDeleteImage = useCallback(
    (slotIndex: number) => {
      setFiles((prev) => {
        const updated = [...prev];
        updated.splice(slotIndex, 1);
        return updated;
      });
      setCrops((prev) => {
        const updated = [...prev];
        updated.splice(slotIndex, 1);
        return updated;
      });
      setSelectedSlot((prev) => (prev >= slotIndex && prev > 0 ? prev - 1 : prev));
    },
    []
  );

  const handleReset = () => {
    setFiles([]);
    setCrops([]);
    setSelectedSlot(0);
  };

  return (
    <div className="flex min-h-screen flex-col items-center px-4 pb-12 pt-6">
      {/* Header */}
      <div className="mb-5 flex w-full max-w-lg items-center justify-between">
        <button
          onClick={() => router.push("/")}
          className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <h1 className="text-sm font-semibold text-gray-900">
            {preset.label}
          </h1>
          <span className="text-[10px] text-gray-500">
            {preset.aspectRatio}
          </span>
        </div>
        {files.length > 0 ? (
          <button
            onClick={handleReset}
            className="rounded-full px-3 py-1 text-xs text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            リセット
          </button>
        ) : (
          <div className="w-14" />
        )}
      </div>

      <div className="flex w-full max-w-lg flex-col gap-4">
        {/* Template selector */}
        <div className="rounded-2xl bg-white p-3.5 shadow-sm">
          <p className="mb-2.5 text-xs font-medium text-gray-400">レイアウト</p>
          <TemplateSelector
            templates={templates}
            selectedId={template.id}
            onSelect={handleTemplateChange}
          />
        </div>

        {/* Canvas */}
        <CanvasPreview
          images={images}
          preset={preset}
          template={template}
          crops={crops}
          canvasRef={canvasRef}
          selectedSlot={selectedSlot}
          onSlotSelect={setSelectedSlot}
          onCropChange={handleCropChangeByIndex}
          onSwapSlots={handleSwapSlots}
          onReplaceImage={handleReplaceImage}
          onDeleteImage={handleDeleteImage}
        />

        {/* Drop zone */}
        <DropZone
          onImagesSelected={handleImagesSelected}
          maxImages={template.slots}
          currentCount={files.length}
        />

        {/* Export */}
        <ExportButton mode={mode} canvasRef={canvasRef} />
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
