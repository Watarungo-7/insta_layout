import { LayoutPreset, LayoutTemplate } from "./types";

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
    label: "フィード (1:1)",
    description: "1:1 正方形 (1080×1080)",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
  },
  post: {
    mode: "post",
    label: "フィード (3:4)",
    description: "3:4 縦長投稿 (1080×1440)",
    width: 1080,
    height: 1440,
    aspectRatio: "3:4",
  },
};

export const STORY_TEMPLATES: LayoutTemplate[] = [
  {
    id: "story-2-h",
    label: "2分割 横",
    slots: 2,
    regions: [
      [0, 0, 1, 0.5],
      [0, 0.5, 1, 0.5],
    ],
  },
  {
    id: "story-2-v",
    label: "2分割 縦",
    slots: 2,
    regions: [
      [0, 0, 0.5, 1],
      [0.5, 0, 0.5, 1],
    ],
  },
  {
    id: "story-3-h",
    label: "3分割 横",
    slots: 3,
    regions: [
      [0, 0, 1, 1 / 3],
      [0, 1 / 3, 1, 1 / 3],
      [0, 2 / 3, 1, 1 / 3],
    ],
  },
  {
    id: "story-3-v",
    label: "3分割 縦",
    slots: 3,
    regions: [
      [0, 0, 1 / 3, 1],
      [1 / 3, 0, 1 / 3, 1],
      [2 / 3, 0, 1 / 3, 1],
    ],
  },
  {
    id: "story-3-top1-bottom2",
    label: "1+2分割",
    slots: 3,
    regions: [
      [0, 0, 1, 0.5],
      [0, 0.5, 0.5, 0.5],
      [0.5, 0.5, 0.5, 0.5],
    ],
  },
  {
    id: "story-4-grid",
    label: "4分割",
    slots: 4,
    regions: [
      [0, 0, 0.5, 0.5],
      [0.5, 0, 0.5, 0.5],
      [0, 0.5, 0.5, 0.5],
      [0.5, 0.5, 0.5, 0.5],
    ],
  },
];

export const FEED_TEMPLATES: LayoutTemplate[] = [
  {
    id: "feed-2-h",
    label: "2分割 横",
    slots: 2,
    regions: [
      [0, 0, 1, 0.5],
      [0, 0.5, 1, 0.5],
    ],
  },
  {
    id: "feed-2-v",
    label: "2分割 縦",
    slots: 2,
    regions: [
      [0, 0, 0.5, 1],
      [0.5, 0, 0.5, 1],
    ],
  },
  {
    id: "feed-3-v",
    label: "3分割 縦",
    slots: 3,
    regions: [
      [0, 0, 1 / 3, 1],
      [1 / 3, 0, 1 / 3, 1],
      [2 / 3, 0, 1 / 3, 1],
    ],
  },
  {
    id: "feed-4-grid",
    label: "4分割",
    slots: 4,
    regions: [
      [0, 0, 0.5, 0.5],
      [0.5, 0, 0.5, 0.5],
      [0, 0.5, 0.5, 0.5],
      [0.5, 0.5, 0.5, 0.5],
    ],
  },
];

export const POST_TEMPLATES: LayoutTemplate[] = [
  {
    id: "post-2-h",
    label: "2分割 横",
    slots: 2,
    regions: [
      [0, 0, 1, 0.5],
      [0, 0.5, 1, 0.5],
    ],
  },
  {
    id: "post-2-v",
    label: "2分割 縦",
    slots: 2,
    regions: [
      [0, 0, 0.5, 1],
      [0.5, 0, 0.5, 1],
    ],
  },
  {
    id: "post-3-h",
    label: "3分割 横",
    slots: 3,
    regions: [
      [0, 0, 1, 1 / 3],
      [0, 1 / 3, 1, 1 / 3],
      [0, 2 / 3, 1, 1 / 3],
    ],
  },
  {
    id: "post-3-v",
    label: "3分割 縦",
    slots: 3,
    regions: [
      [0, 0, 1 / 3, 1],
      [1 / 3, 0, 1 / 3, 1],
      [2 / 3, 0, 1 / 3, 1],
    ],
  },
  {
    id: "post-3-top1-bottom2",
    label: "1+2分割",
    slots: 3,
    regions: [
      [0, 0, 1, 0.5],
      [0, 0.5, 0.5, 0.5],
      [0.5, 0.5, 0.5, 0.5],
    ],
  },
  {
    id: "post-4-grid",
    label: "4分割",
    slots: 4,
    regions: [
      [0, 0, 0.5, 0.5],
      [0.5, 0, 0.5, 0.5],
      [0, 0.5, 0.5, 0.5],
      [0.5, 0.5, 0.5, 0.5],
    ],
  },
];

export const TEMPLATES_BY_MODE: Record<string, LayoutTemplate[]> = {
  story: STORY_TEMPLATES,
  feed: FEED_TEMPLATES,
  post: POST_TEMPLATES,
};

export const EXPORT_QUALITY = 0.92;
export const GAP_PX = 4;
