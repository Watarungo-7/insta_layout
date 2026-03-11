"use client";

import { useState, useEffect } from "react";

export function useMultiImageLoader(
  files: File[]
): (HTMLImageElement | null)[] {
  const [images, setImages] = useState<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    if (files.length === 0) {
      setImages([]);
      return;
    }

    const loaded: (HTMLImageElement | null)[] = new Array(files.length).fill(
      null
    );
    let cancelled = false;

    files.forEach((file, i) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        if (cancelled) return;
        loaded[i] = img;
        setImages([...loaded]);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
      };
      img.src = url;
    });

    return () => {
      cancelled = true;
    };
  }, [files]);

  return images;
}
