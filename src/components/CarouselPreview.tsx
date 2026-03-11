"use client";

import { useRef, useEffect, useCallback } from "react";
import { renderCarouselSlide } from "../hooks/useCanvasRenderer";
import { CropState } from "../lib/types";
import { PRESETS } from "../lib/constants";

interface CarouselPreviewProps {
  image: HTMLImageElement;
  slideCount: number;
  crop: CropState;
  canvasRefs: React.MutableRefObject<HTMLCanvasElement[]>;
}

export default function CarouselPreview({
  image,
  slideCount,
  crop,
  canvasRefs,
}: CarouselPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const preset = PRESETS.carousel;

  const setCanvasRef = useCallback(
    (el: HTMLCanvasElement | null, index: number) => {
      if (el) {
        canvasRefs.current[index] = el;
      }
    },
    [canvasRefs]
  );

  useEffect(() => {
    for (let i = 0; i < slideCount; i++) {
      const canvas = canvasRefs.current[i];
      if (canvas) {
        renderCarouselSlide(
          canvas,
          image,
          i,
          slideCount,
          preset.width,
          preset.height,
          crop
        );
      }
    }
  }, [image, slideCount, crop, preset, canvasRefs]);

  const displaySize = 200;

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={containerRef}
        className="flex gap-2 overflow-x-auto rounded-lg p-2"
        style={{ maxWidth: "100%", scrollSnapType: "x mandatory" }}
      >
        {Array.from({ length: slideCount }, (_, i) => (
          <div
            key={i}
            className="relative flex-shrink-0"
            style={{ scrollSnapAlign: "start" }}
          >
            <canvas
              ref={(el) => setCanvasRef(el, i)}
              style={{
                width: `${displaySize}px`,
                height: `${displaySize}px`,
              }}
              className="rounded-lg shadow-lg"
            />
            <span className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
              {i + 1}/{slideCount}
            </span>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500">
        横スクロールでプレビュー確認
      </p>
    </div>
  );
}
