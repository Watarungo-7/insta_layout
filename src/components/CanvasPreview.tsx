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
      dragState.current = {
        slotIndex: slot,
        startX: e.clientX,
        startY: e.clientY,
        startOffsetX: crop.offsetX,
        startOffsetY: crop.offsetY,
        moved: false,
      };

      // Only capture pointer for mouse — let touch scroll through by default
      if (e.pointerType === "mouse") {
        canvas.setPointerCapture(e.pointerId);
      }
    },
    [ref, preset, template, crops]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const ds = dragState.current;
      const canvas = ref.current;
      if (!ds || !canvas) return;

      const dx = e.clientX - ds.startX;
      const dy = e.clientY - ds.startY;

      // For touch: if vertical movement dominates, let the browser scroll
      if (!ds.moved && e.pointerType === "touch") {
        if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx) * 1.5) {
          // Vertical scroll intent — abort drag entirely
          dragState.current = null;
          return;
        }
      }

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        ds.moved = true;
      }

      if (!ds.moved) return;

      // Once we commit to a crop drag, capture the pointer to prevent scroll
      if (e.pointerType === "touch") {
        try {
          canvas.setPointerCapture(e.pointerId);
        } catch {
          // ignore if already captured
        }
      }

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

    // Only handle tap (not drag) for slot selection / swap
    if (!ds.moved) {
      const slot = ds.slotIndex;
      if (swapSource === null) {
        // First tap: select this slot
        onSlotSelect(slot);
      } else if (swapSource === slot) {
        // Tapped same slot again: cancel swap mode
        setSwapSource(null);
        onSlotSelect(slot);
      } else {
        // Second tap on different slot: swap!
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
        className="relative"
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
          className="cursor-grab rounded-lg shadow-lg active:cursor-grabbing"
        />
        {/* Selected slot highlight */}
        {template.regions[selectedSlot] && (
          <div
            className="pointer-events-none absolute border-2 border-blue-500/70"
            style={{
              left: `${template.regions[selectedSlot][0] * displayWidth}px`,
              top: `${template.regions[selectedSlot][1] * displayHeight}px`,
              width: `${template.regions[selectedSlot][2] * displayWidth}px`,
              height: `${template.regions[selectedSlot][3] * displayHeight}px`,
            }}
          />
        )}
        {/* Swap source highlight */}
        {swapSource !== null && template.regions[swapSource] && (
          <div
            className="pointer-events-none absolute border-2 border-dashed border-yellow-400/80"
            style={{
              left: `${template.regions[swapSource][0] * displayWidth}px`,
              top: `${template.regions[swapSource][1] * displayHeight}px`,
              width: `${template.regions[swapSource][2] * displayWidth}px`,
              height: `${template.regions[swapSource][3] * displayHeight}px`,
            }}
          >
            <span className="absolute left-1 top-1 rounded bg-yellow-400/90 px-1.5 py-0.5 text-xs font-bold text-black">
              入替元
            </span>
          </div>
        )}
      </div>

      {/* Swap mode button */}
      {hasMultipleImages && (
        <button
          onClick={handleSwapModeToggle}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
            swapSource !== null
              ? "bg-yellow-500 text-black hover:bg-yellow-400"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
          }`}
        >
          {swapSource !== null
            ? `画像 ${swapSource + 1} の入替先をタップ（キャンセル）`
            : "画像を入れ替え"}
        </button>
      )}
    </div>
  );
}
