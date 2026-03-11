"use client";

import { useRef } from "react";
import { useCollageRenderer } from "../hooks/useCanvasRenderer";
import { LayoutPreset, LayoutTemplate, CropState } from "../lib/types";

interface CanvasPreviewProps {
  images: (HTMLImageElement | null)[];
  preset: LayoutPreset;
  template: LayoutTemplate;
  crops: CropState[];
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

export default function CanvasPreview({
  images,
  preset,
  template,
  crops,
  canvasRef: externalRef,
}: CanvasPreviewProps) {
  const internalRef = useRef<HTMLCanvasElement>(null);
  const ref = externalRef || internalRef;

  useCollageRenderer(ref, images, preset, template, crops);

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
