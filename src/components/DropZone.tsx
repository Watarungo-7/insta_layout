"use client";

import { useState, useRef, useCallback } from "react";

interface DropZoneProps {
  onImagesSelected: (files: File[]) => void;
  maxImages: number;
  currentCount: number;
}

export default function DropZone({
  onImagesSelected,
  maxImages,
  currentCount,
}: DropZoneProps) {
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const remaining = maxImages - currentCount;

  const handleFiles = useCallback(
    (fileList: FileList) => {
      const files = Array.from(fileList)
        .filter((f) => f.type.startsWith("image/"))
        .slice(0, remaining);
      if (files.length > 0) {
        onImagesSelected(files);
      }
    },
    [onImagesSelected, remaining]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) handleFiles(e.target.files);
    },
    [handleFiles]
  );

  if (remaining <= 0) return null;

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => {
        e.preventDefault();
        setDragActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragActive(false);
      }}
      onClick={() => inputRef.current?.click()}
      className={`flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-4 transition-all active:scale-[0.98] ${
        dragActive
          ? "border-[var(--pink)] bg-[var(--pink-bg)]"
          : "border-gray-200 bg-white hover:border-[var(--pink-light)] hover:bg-[var(--pink-subtle)]"
      }`}
    >
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--pink-bg)]">
        <svg
          className="h-5 w-5 text-[var(--pink)]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 4v16m8-8H4"
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-gray-600">
        画像を追加
      </p>
      <p className="text-[11px] text-gray-400">
        残り {remaining} 枚
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleChange}
        className="hidden"
      />
    </div>
  );
}
