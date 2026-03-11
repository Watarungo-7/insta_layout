export type LayoutMode = "story" | "feed" | "carousel";

export interface LayoutPreset {
  mode: LayoutMode;
  label: string;
  description: string;
  width: number;
  height: number;
  aspectRatio: string;
}

export interface CropState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface CarouselState {
  slideCount: number;
}
