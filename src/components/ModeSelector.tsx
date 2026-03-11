"use client";

import Link from "next/link";
import { PRESETS } from "../lib/constants";

export default function ModeSelector() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {Object.values(PRESETS).map((preset) => (
        <Link
          key={preset.mode}
          href={`/editor?mode=${preset.mode}`}
          className="group rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 transition-all hover:border-white/15 hover:bg-white/[0.06] active:scale-[0.98]"
        >
          <div className="mb-3 flex h-20 items-center justify-center rounded-xl bg-white/[0.04]">
            <span className="text-xl font-bold text-gray-500 transition-colors group-hover:text-white/70">
              {preset.aspectRatio}
            </span>
          </div>
          <h2 className="mb-1 text-base font-semibold text-white">
            {preset.label}
          </h2>
          <p className="text-xs text-gray-500">{preset.description}</p>
        </Link>
      ))}
    </div>
  );
}
