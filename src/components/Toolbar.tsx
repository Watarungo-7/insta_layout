"use client";

import { CropState, LayoutMode } from "../lib/types";
import {
  MIN_CAROUSEL_SLIDES,
  MAX_CAROUSEL_SLIDES,
} from "../lib/constants";

interface ToolbarProps {
  mode: LayoutMode;
  crop: CropState;
  onCropChange: (crop: CropState) => void;
  slideCount?: number;
  onSlideCountChange?: (count: number) => void;
  format: "png" | "jpeg";
  onFormatChange: (format: "png" | "jpeg") => void;
}

export default function Toolbar({
  mode,
  crop,
  onCropChange,
  slideCount,
  onSlideCountChange,
  format,
  onFormatChange,
}: ToolbarProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-gray-800 bg-gray-900 p-4">
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
            onCropChange({ ...crop, offsetX: parseFloat(e.target.value) })
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
            onCropChange({ ...crop, offsetY: parseFloat(e.target.value) })
          }
          className="w-full accent-blue-500"
        />
      </div>

      {mode === "carousel" && onSlideCountChange && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-300">
            分割枚数: {slideCount}枚
          </label>
          <input
            type="range"
            min={MIN_CAROUSEL_SLIDES}
            max={MAX_CAROUSEL_SLIDES}
            step="1"
            value={slideCount}
            onChange={(e) => onSlideCountChange(parseInt(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
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
