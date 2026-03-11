"use client";

import { useEffect, RefObject } from "react";
import { LayoutPreset, LayoutTemplate, CropState } from "../lib/types";
import { GAP_PX } from "../lib/constants";

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  crop: CropState
) {
  const baseScale = Math.max(w / img.width, h / img.height);
  const totalScale = baseScale * crop.scale;
  const scaledW = img.width * totalScale;
  const scaledH = img.height * totalScale;
  const overflowX = scaledW - w;
  const overflowY = scaledH - h;
  const drawX = x - overflowX * crop.offsetX;
  const drawY = y - overflowY * crop.offsetY;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, drawX, drawY, scaledW, scaledH);
  ctx.restore();
}

export function useCollageRenderer(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  images: (HTMLImageElement | null)[],
  preset: LayoutPreset,
  template: LayoutTemplate,
  crops: CropState[]
): void {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = preset.width;
    canvas.height = preset.height;

    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, preset.width, preset.height);

    const gap = GAP_PX;

    template.regions.forEach((region, i) => {
      const img = images[i];
      const crop = crops[i] || { scale: 1, offsetX: 0.5, offsetY: 0.5 };

      const x = region[0] * preset.width + gap / 2;
      const y = region[1] * preset.height + gap / 2;
      const w = region[2] * preset.width - gap;
      const h = region[3] * preset.height - gap;

      if (img) {
        drawImageCover(ctx, img, x, y, w, h, crop);
      } else {
        ctx.fillStyle = "#1f2937";
        ctx.fillRect(x, y, w, h);
        ctx.fillStyle = "#6b7280";
        ctx.font = `${Math.min(w, h) * 0.15}px sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(`${i + 1}`, x + w / 2, y + h / 2);
      }
    });
  }, [canvasRef, images, preset, template, crops]);
}
