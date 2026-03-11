"use client";

import { useRef } from "react";
import { useCanvasRenderer } from "../hooks/useCanvasRenderer";
import { LayoutPreset, CropState } from "../lib/types";

interface CanvasPreviewProps {
  image: HTMLImageElement;
  preset: LayoutPreset;
  crop: CropState;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export default function CanvasPreview({
  image,
  preset,
  crop,
  canvasRef: externalRef,
}: CanvasPreviewProps) {
  const internalRef = useRef<HTMLCanvasElement>(null);
  const ref = externalRef || internalRef;

  useCanvasRenderer(ref, image, preset, crop);

  const aspectRatio = preset.width / preset.height;
  const maxDisplayHeight = preset.mode === "story" ? 500 : 400;
  const displayHeight = maxDisplayHeight;
  const displayWidth = displayHeight * aspectRatio;

  return (
    <div className="flex justify-center">
      <canvas
        ref={ref}
        style={{
          width: `${displayWidth}px`,
          height: `${displayHeight}px`,
        }}
        className="rounded-lg shadow-lg"
      />
    </div>
  );
}
