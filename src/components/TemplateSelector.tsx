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
    <div className="flex flex-wrap gap-3">
      {templates.map((t) => (
        <button
          key={t.id}
          onClick={() => onSelect(t)}
          className={`relative h-16 w-16 overflow-hidden rounded-lg border-2 p-1 transition-all ${
            selectedId === t.id
              ? "border-blue-500 bg-gray-800"
              : "border-gray-700 bg-gray-900 hover:border-gray-500"
          }`}
          title={t.label}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full">
            {t.regions.map((r, i) => (
              <rect
                key={i}
                x={r[0] * 100 + 1}
                y={r[1] * 100 + 1}
                width={r[2] * 100 - 2}
                height={r[3] * 100 - 2}
                rx={3}
                className={
                  selectedId === t.id
                    ? "fill-blue-500/40 stroke-blue-400"
                    : "fill-gray-700 stroke-gray-500"
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
