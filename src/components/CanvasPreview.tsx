"use client";

import { useRef, useCallback, useState } from "react";
import { useCollageRenderer } from "../hooks/useCanvasRenderer";
import { LayoutPreset, LayoutTemplate, CropState } from "../lib/types";
import { GAP_PX } from "../lib/constants";

interface CanvasPreviewProps {
  images: (HTMLImageElement | null)[];
  preset: LayoutPreset;
  template: LayoutTemplate;
  crops: CropState[];
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
  selectedSlot: number;
  onSlotSelect: (index: number) => void;
  onCropChange: (index: number, crop: CropState) => void;
  onSwapSlots: (a: number, b: number) => void;
  onReplaceImage: (slotIndex: number) => void;
  onDeleteImage?: (slotIndex: number) => void;
}

function hitTestSlot(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
  preset: LayoutPreset,
  template: LayoutTemplate
): number {
  const rect = canvas.getBoundingClientRect();
  const scaleX = preset.width / rect.width;
  const scaleY = preset.height / rect.height;
  const cx = (clientX - rect.left) * scaleX;
  const cy = (clientY - rect.top) * scaleY;
  const gap = GAP_PX;

  for (let i = 0; i < template.regions.length; i++) {
    const r = template.regions[i];
    const x = r[0] * preset.width + gap / 2;
    const y = r[1] * preset.height + gap / 2;
    const w = r[2] * preset.width - gap;
    const h = r[3] * preset.height - gap;
    if (cx >= x && cx <= x + w && cy >= y && cy <= y + h) {
      return i;
    }
  }
  return -1;
}

export default function CanvasPreview({
  images,
  preset,
  template,
  crops,
  canvasRef: externalRef,
  selectedSlot,
  onSlotSelect,
  onCropChange,
  onSwapSlots,
  onReplaceImage,
  onDeleteImage,
}: CanvasPreviewProps) {
  const internalRef = useRef<HTMLCanvasElement>(null);
  const ref = externalRef || internalRef;
  const [swapSource, setSwapSource] = useState<number | null>(null);

  useCollageRenderer(ref, images, preset, template, crops);

  const dragState = useRef<{
    slotIndex: number;
    startX: number;
    startY: number;
    startOffsetX: number;
    startOffsetY: number;
    moved: boolean;
    isCropDrag: boolean;
  } | null>(null);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      const canvas = ref.current;
      if (!canvas) return;

      const slot = hitTestSlot(
        e.clientX,
        e.clientY,
        canvas,
        preset,
        template
      );
      if (slot < 0) return;

      const crop = crops[slot] || { scale: 1, offsetX: 0.5, offsetY: 0.5 };
      const isCropDrag = slot === selectedSlot && images[slot] !== null;

      dragState.current = {
        slotIndex: slot,
        startX: e.clientX,
        startY: e.clientY,
        startOffsetX: crop.offsetX,
        startOffsetY: crop.offsetY,
        moved: false,
        isCropDrag,
      };

      if (isCropDrag) {
        canvas.setPointerCapture(e.pointerId);
      } else if (e.pointerType === "mouse") {
        canvas.setPointerCapture(e.pointerId);
      }
    },
    [ref, preset, template, crops, selectedSlot, images]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const ds = dragState.current;
      const canvas = ref.current;
      if (!ds || !canvas) return;

      const dx = e.clientX - ds.startX;
      const dy = e.clientY - ds.startY;

      if (!ds.isCropDrag) {
        if (e.pointerType === "touch" && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
          dragState.current = null;
        }
        return;
      }

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        ds.moved = true;
      }

      if (!ds.moved) return;

      const rect = canvas.getBoundingClientRect();
      const region = template.regions[ds.slotIndex];
      const slotW = region[2] * rect.width;
      const slotH = region[3] * rect.height;

      const crop = crops[ds.slotIndex] || {
        scale: 1,
        offsetX: 0.5,
        offsetY: 0.5,
      };
      const img = images[ds.slotIndex];
      if (!img) return;

      const baseScale = Math.max(slotW / img.width, slotH / img.height);
      const totalScale = baseScale * crop.scale;
      const overflowX = img.width * totalScale - slotW;
      const overflowY = img.height * totalScale - slotH;

      const newOffsetX =
        overflowX > 0
          ? Math.max(0, Math.min(1, ds.startOffsetX - dx / overflowX))
          : 0.5;
      const newOffsetY =
        overflowY > 0
          ? Math.max(0, Math.min(1, ds.startOffsetY - dy / overflowY))
          : 0.5;

      onCropChange(ds.slotIndex, {
        ...crop,
        offsetX: newOffsetX,
        offsetY: newOffsetY,
      });
    },
    [ref, template, crops, images, onCropChange]
  );

  const handlePointerUp = useCallback(() => {
    const ds = dragState.current;
    if (!ds) return;

    if (!ds.moved) {
      const slot = ds.slotIndex;
      if (swapSource === null) {
        onSlotSelect(slot);
      } else if (swapSource === slot) {
        setSwapSource(null);
        onSlotSelect(slot);
      } else {
        onSwapSlots(swapSource, slot);
        setSwapSource(null);
        onSlotSelect(slot);
      }
    }

    dragState.current = null;
  }, [swapSource, onSlotSelect, onSwapSlots]);

  const handleSwapModeToggle = useCallback(() => {
    if (swapSource !== null) {
      setSwapSource(null);
    } else {
      setSwapSource(selectedSlot);
    }
  }, [swapSource, selectedSlot]);

  const aspectRatio = preset.width / preset.height;
  const maxDisplayHeight = preset.mode === "story" ? 500 : 400;
  const displayHeight = maxDisplayHeight;
  const displayWidth = displayHeight * aspectRatio;

  const hasMultipleImages =
    images.filter((img) => img !== null).length >= 2;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative overflow-hidden rounded-2xl shadow-lg"
        style={{ width: `${displayWidth}px`, height: `${displayHeight}px` }}
      >
        <canvas
          ref={ref}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{
            width: `${displayWidth}px`,
            height: `${displayHeight}px`,
            touchAction: images[selectedSlot] ? "none" : "pan-y",
          }}
          className="cursor-grab active:cursor-grabbing"
        />
        {/* Selected slot highlight */}
        {template.regions[selectedSlot] && (
          <div
            className="pointer-events-none absolute"
            style={{
              left: `${template.regions[selectedSlot][0] * displayWidth}px`,
              top: `${template.regions[selectedSlot][1] * displayHeight}px`,
              width: `${template.regions[selectedSlot][2] * displayWidth}px`,
              height: `${template.regions[selectedSlot][3] * displayHeight}px`,
              border: "2px solid rgba(232,99,138,0.6)",
              borderRadius: "2px",
            }}
          />
        )}
        {/* Swap source highlight */}
        {swapSource !== null && template.regions[swapSource] && (
          <div
            className="pointer-events-none absolute border-2 border-dashed"
            style={{
              left: `${template.regions[swapSource][0] * displayWidth}px`,
              top: `${template.regions[swapSource][1] * displayHeight}px`,
              width: `${template.regions[swapSource][2] * displayWidth}px`,
              height: `${template.regions[swapSource][3] * displayHeight}px`,
              borderColor: "var(--pink)",
            }}
          >
            <span
              className="absolute left-1.5 top-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
              style={{ background: "var(--pink)" }}
            >
              移動元
            </span>
          </div>
        )}
      </div>

      {/* Crop hint */}
      {images[selectedSlot] && !swapSource && (
        <p className="text-[11px] text-gray-400">
          選択中の画像をドラッグで位置調整
        </p>
      )}

      {/* Action bar - Apple style icon buttons */}
      <div className="flex items-center gap-1.5">
        {/* Replace image */}
        {images[selectedSlot] && (
          <button
            onClick={() => onReplaceImage(selectedSlot)}
            className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-xs font-medium text-gray-600 shadow-sm transition-all hover:shadow-md active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            変更
          </button>
        )}

        {/* Swap */}
        {hasMultipleImages && (
          <button
            onClick={handleSwapModeToggle}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-medium shadow-sm transition-all hover:shadow-md active:scale-95 ${
              swapSource !== null
                ? "text-white"
                : "bg-white text-gray-600"
            }`}
            style={swapSource !== null ? { background: "var(--pink)" } : undefined}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            {swapSource !== null ? "タップで入替" : "並び替え"}
          </button>
        )}

        {/* Delete image */}
        {images[selectedSlot] && onDeleteImage && (
          <button
            onClick={() => onDeleteImage(selectedSlot)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm transition-all hover:text-red-400 hover:shadow-md active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
