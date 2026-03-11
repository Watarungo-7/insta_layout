"use client";

import Link from "next/link";
import { PRESETS } from "../lib/constants";
import { LayoutMode } from "../lib/types";

const modeIcons: Record<LayoutMode, string> = {
  story: "9:16",
  feed: "1:1",
  carousel: "1:1 ×N",
};

export default function ModeSelector() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {Object.values(PRESETS).map((preset) => (
        <Link
          key={preset.mode}
          href={`/editor?mode=${preset.mode}`}
          className="group rounded-2xl border border-gray-800 bg-gray-900 p-6 transition-all hover:border-blue-500 hover:bg-gray-800"
        >
          <div className="mb-4 flex h-20 items-center justify-center rounded-xl bg-gray-800 text-2xl font-bold text-gray-400 transition-colors group-hover:bg-gray-700 group-hover:text-blue-400">
            {modeIcons[preset.mode]}
          </div>
          <h2 className="mb-2 text-lg font-semibold text-white">
            {preset.label}
          </h2>
          <p className="text-sm text-gray-400">{preset.description}</p>
        </Link>
      ))}
    </div>
  );
}
