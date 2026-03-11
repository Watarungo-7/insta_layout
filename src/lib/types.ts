export type LayoutMode = "story" | "feed" | "post";

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

export interface LayoutTemplate {
  id: string;
  label: string;
  slots: number;
  /** Each region is a fraction of the canvas: [x, y, w, h] in 0-1 range */
  regions: [number, number, number, number][];
}
