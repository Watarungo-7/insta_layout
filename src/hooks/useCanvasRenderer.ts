"use client";

import { useEffect, RefObject } from "react";
import { LayoutPreset, CropState } from "../lib/types";

function computeCoverScale(
  imgW: number,
  imgH: number,
  canvasW: number,
  canvasH: number
): number {
  return Math.max(canvasW / imgW, canvasH / imgH);
}

export function useCanvasRenderer(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  image: HTMLImageElement | null,
  preset: LayoutPreset,
  crop: CropState
): void {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = preset.width;
    canvas.height = preset.height;

    const baseScale = computeCoverScale(
      image.width,
      image.height,
      preset.width,
      preset.height
    );
    const totalScale = baseScale * crop.scale;

    const scaledW = image.width * totalScale;
    const scaledH = image.height * totalScale;
    const overflowX = scaledW - preset.width;
    const overflowY = scaledH - preset.height;
    const drawX = -overflowX * crop.offsetX;
    const drawY = -overflowY * crop.offsetY;

    ctx.clearRect(0, 0, preset.width, preset.height);
    ctx.drawImage(image, drawX, drawY, scaledW, scaledH);
  }, [canvasRef, image, preset, crop.scale, crop.offsetX, crop.offsetY]);
}

export function renderCarouselSlide(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  slideIndex: number,
  slideCount: number,
  slideWidth: number,
  slideHeight: number,
  crop: CropState
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  canvas.width = slideWidth;
  canvas.height = slideHeight;

  const totalWidth = slideWidth * slideCount;
  const baseScale = computeCoverScale(
    image.width,
    image.height,
    totalWidth,
    slideHeight
  );
  const totalScale = baseScale * crop.scale;

  const scaledW = image.width * totalScale;
  const scaledH = image.height * totalScale;
  const overflowX = scaledW - totalWidth;
  const overflowY = scaledH - slideHeight;
  const drawX = -overflowX * crop.offsetX - slideIndex * slideWidth;
  const drawY = -overflowY * crop.offsetY;

  ctx.clearRect(0, 0, slideWidth, slideHeight);
  ctx.drawImage(image, drawX, drawY, scaledW, scaledH);
}
