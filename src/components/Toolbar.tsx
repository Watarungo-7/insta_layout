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
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-gray-900 p-4">
      {/* Slot selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-300">画像:</span>
        {Array.from({ length: totalSlots }, (_, i) => (
          <button
            key={i}
            onClick={() => onSlotSelect(i)}
            className={`h-8 w-8 rounded-lg text-sm font-medium transition-colors ${
              selectedSlot === i
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:text-white"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {hasImage && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">
              ズーム: {crop.scale.toFixed(1)}x
            </label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={crop.scale}
              onChange={(e) =>
                onCropChange({ ...crop, scale: parseFloat(e.target.value) })
              }
              className="w-full accent-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">
              横位置
            </label>
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
              className="w-full accent-blue-500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">
              縦位置
            </label>
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
              className="w-full accent-blue-500"
            />
          </div>
        </>
      )}

      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-300">形式:</span>
        <button
          onClick={() => onFormatChange("png")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            format === "png"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          PNG
        </button>
        <button
          onClick={() => onFormatChange("jpeg")}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            format === "jpeg"
              ? "bg-blue-600 text-white"
              : "bg-gray-800 text-gray-400 hover:text-white"
          }`}
        >
          JPG
        </button>
      </div>
    </div>
  );
}
