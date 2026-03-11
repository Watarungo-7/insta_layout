"use client";

import { LayoutTemplate } from "../lib/types";

interface TemplateSelectorProps {
  templates: LayoutTemplate[];
  selectedId: string;
  onSelect: (template: LayoutTemplate) => void;
}

export default function TemplateSelector({
  templates,
  selectedId,
  onSelect,
}: TemplateSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {templates.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t)}
          className={`relative h-14 w-14 overflow-hidden rounded-xl border-2 p-1.5 transition-all ${
            selectedId === t.id
              ? "border-white/50 bg-white/10"
              : "border-transparent bg-white/[0.04] hover:bg-white/[0.08]"
          }`}
          title={t.label}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full">
            {t.regions.map((r, i) => (
              <rect
                key={i}
                x={r[0] * 100 + 1.5}
                y={r[1] * 100 + 1.5}
                width={r[2] * 100 - 3}
                height={r[3] * 100 - 3}
                rx={4}
                className={
                  selectedId === t.id
                    ? "fill-white/25 stroke-white/50"
                    : "fill-white/8 stroke-white/20"
                }
                strokeWidth={1.5}
              />
            ))}
          </svg>
        </button>
      ))}
    </div>
  );
}
