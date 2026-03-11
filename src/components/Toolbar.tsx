"use client";

import { CropState } from "../lib/types";

interface ToolbarProps {
  selectedSlot: number;
  totalSlots: number;
  crop: CropState;
  onCropChange: (crop: CropState) => void;
  onSlotSelect: (index: number) => void;
  format: "png" | "jpeg";
  onFormatChange: (format: "png" | "jpeg") => void;
  hasImage: boolean;
}

export default function Toolbar({
  selectedSlot,
  totalSlots,
  crop,
  onCropChange,
  onSlotSelect,
  format,
  onFormatChange,
  hasImage,
}: ToolbarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
      {/* Slot selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-400">画像</span>
        <div className="flex gap-1.5">
          {Array.from({ length: totalSlots }, (_, i) => (
            <button
              key={i}
              onClick={() => onSlotSelect(i)}
              className={`h-8 w-8 rounded-full text-xs font-medium transition-all ${
                selectedSlot === i
                  ? "bg-white text-black shadow-sm"
                  : "bg-white/[0.06] text-gray-400 hover:bg-white/10 hover:text-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {hasImage && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs text-gray-400">ズーム</label>
              <span className="text-xs tabular-nums text-gray-500">
                {crop.scale.toFixed(1)}x
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={crop.scale}
              onChange={(e) =>
                onCropChange({ ...crop, scale: parseFloat(e.target.value) })
              }
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400">横位置</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={crop.offsetX}
              onChange={(e) =>
                onCropChange({
                  ...crop,
                  offsetX: parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs text-gray-400">縦位置</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={crop.offsetY}
              onChange={(e) =>
                onCropChange({
                  ...crop,
                  offsetY: parseFloat(e.target.value),
                })
              }
              className="w-full"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-gray-400">形式</span>
        <div className="flex overflow-hidden rounded-full border border-white/[0.08] bg-white/[0.03]">
          <button
            onClick={() => onFormatChange("png")}
            className={`px-3.5 py-1 text-xs font-medium transition-all ${
              format === "png"
                ? "bg-white text-black"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            PNG
          </button>
          <button
            onClick={() => onFormatChange("jpeg")}
            className={`px-3.5 py-1 text-xs font-medium transition-all ${
              format === "jpeg"
                ? "bg-white text-black"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            JPG
          </button>
        </div>
      </div>
    </div>
  );
}
