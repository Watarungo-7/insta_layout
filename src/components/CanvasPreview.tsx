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
    isCropDrag: boolean; // true = dragging on already-selected slot
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

      // Capture pointer immediately for crop drags (prevents scroll)
      // For non-crop touches, let browser handle scroll
      if (isCropDrag || e.pointerType === "mouse") {
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

      // Non-crop touch drag: don't interfere with scrolling
      if (!ds.isCropDrag && e.pointerType === "touch") {
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
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
        className="relative overflow-hidden rounded-2xl shadow-xl"
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
            touchAction: "pan-y",
          }}
          className="cursor-grab active:cursor-grabbing"
        />
        {/* Selected slot highlight */}
        {template.regions[selectedSlot] && (
          <div
            className="pointer-events-none absolute rounded-sm border-2 border-white/50"
            style={{
              left: `${template.regions[selectedSlot][0] * displayWidth}px`,
              top: `${template.regions[selectedSlot][1] * displayHeight}px`,
              width: `${template.regions[selectedSlot][2] * displayWidth}px`,
              height: `${template.regions[selectedSlot][3] * displayHeight}px`,
              boxShadow: "0 0 0 1px rgba(0,0,0,0.3)",
            }}
          />
        )}
        {/* Swap source highlight */}
        {swapSource !== null && template.regions[swapSource] && (
          <div
            className="pointer-events-none absolute border-2 border-dashed border-amber-300/80"
            style={{
              left: `${template.regions[swapSource][0] * displayWidth}px`,
              top: `${template.regions[swapSource][1] * displayHeight}px`,
              width: `${template.regions[swapSource][2] * displayWidth}px`,
              height: `${template.regions[swapSource][3] * displayHeight}px`,
            }}
          >
            <span className="absolute left-1.5 top-1.5 rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
              移動元
            </span>
          </div>
        )}
      </div>

      {/* Crop hint for selected slot */}
      {images[selectedSlot] && !swapSource && (
        <p className="text-xs text-gray-500">
          選択中の画像をドラッグで位置調整
        </p>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {images[selectedSlot] && (
          <button
            onClick={() => onReplaceImage(selectedSlot)}
            className="rounded-full border border-gray-700 bg-gray-800/80 px-4 py-1.5 text-sm text-gray-300 backdrop-blur transition-colors hover:border-gray-500 hover:text-white"
          >
            画像を変更
          </button>
        )}
        {hasMultipleImages && (
          <button
            onClick={handleSwapModeToggle}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              swapSource !== null
                ? "border border-amber-400 bg-amber-400/20 text-amber-300 hover:bg-amber-400/30"
                : "border border-gray-700 bg-gray-800/80 text-gray-300 backdrop-blur hover:border-gray-500 hover:text-white"
            }`}
          >
            {swapSource !== null ? "タップで入替 / キャンセル" : "並び替え"}
          </button>
        )}
      </div>
    </div>
  );
}
