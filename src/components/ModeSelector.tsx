"use client";

import Link from "next/link";
import { PRESETS } from "../lib/constants";

export default function ModeSelector() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {Object.values(PRESETS).map((preset) => (
        <Link
          key={preset.mode}
          href={`/editor?mode=${preset.mode}`}
          className="group rounded-2xl bg-white p-5 shadow-sm transition-all hover:shadow-md active:scale-[0.97]"
        >
          <div className="mb-3 flex h-16 items-center justify-center rounded-xl bg-[var(--pink-subtle)]">
            <span className="text-lg font-bold text-[var(--pink)] transition-colors">
              {preset.aspectRatio}
            </span>
          </div>
          <h2 className="mb-0.5 text-sm font-semibold text-gray-900">
            {preset.label}
          </h2>
          <p className="text-[11px] leading-relaxed text-gray-400">{preset.description}</p>
        </Link>
      ))}
    </div>
  );
}
