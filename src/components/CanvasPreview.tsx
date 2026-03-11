"use client";

import { useRef, useCallback } from "react";
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
  onReplaceImage,
}: CanvasPreviewProps) {
  const internalRef = useRef<HTMLCanvasElement>(null);
  const ref = externalRef || internalRef;

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

      const slot = hitTestSlot(e.clientX, e.clientY, canvas, preset, template);
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

      onSlotSelect(slot);
      canvas.setPointerCapture(e.pointerId);
    },
    [ref, preset, template, crops, onSlotSelect]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      const ds = dragState.current;
      const canvas = ref.current;
      if (!ds || !canvas) return;

      const dx = e.clientX - ds.startX;
      const dy = e.clientY - ds.startY;

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
    dragState.current = null;
  }, []);

  const aspectRatio = preset.width / preset.height;
  const maxDisplayHeight = preset.mode === "story" ? 500 : 400;
  const displayHeight = maxDisplayHeight;
  const displayWidth = displayHeight * aspectRatio;

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
            touchAction: "none",
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
      </div>

      {/* Replace button */}
      {images[selectedSlot] && (
        <button
          onClick={() => onReplaceImage(selectedSlot)}
          className="rounded-lg bg-gray-800 px-4 py-1.5 text-sm text-gray-300 transition-colors hover:bg-gray-700 hover:text-white"
        >
          画像 {selectedSlot + 1} を入れ替え
        </button>
      )}
    </div>
  );
}
