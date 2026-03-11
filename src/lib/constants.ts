import { LayoutPreset } from "./types";

export const PRESETS: Record<string, LayoutPreset> = {
  story: {
    mode: "story",
    label: "ストーリー",
    description: "9:16 縦長フルスクリーン (1080×1920)",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
  },
  feed: {
    mode: "feed",
    label: "フィード投稿",
    description: "1:1 正方形 (1080×1080)",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
  },
  carousel: {
    mode: "carousel",
    label: "カルーセル分割",
    description: "パノラマ画像を複数枚に分割",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
  },
};

export const MAX_CAROUSEL_SLIDES = 10;
export const MIN_CAROUSEL_SLIDES = 2;
export const DEFAULT_CAROUSEL_SLIDES = 3;
export const EXPORT_QUALITY = 0.92;
