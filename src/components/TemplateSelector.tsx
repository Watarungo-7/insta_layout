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
          className={`relative h-14 w-14 overflow-hidden rounded-xl border-2 p-1.5 transition-all active:scale-95 ${
            selectedId === t.id
              ? "border-[var(--pink)] bg-[var(--pink-subtle)]"
              : "border-transparent bg-gray-50 hover:bg-gray-100"
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
                fill={selectedId === t.id ? "rgba(232,99,138,0.2)" : "rgba(0,0,0,0.06)"}
                stroke={selectedId === t.id ? "rgba(232,99,138,0.6)" : "rgba(0,0,0,0.12)"}
                strokeWidth={1.5}
              />
            ))}
          </svg>
        </button>
      ))}
    </div>
  );
}
