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
      className={`flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 transition-all ${
        dragActive
          ? "border-white/40 bg-white/[0.06]"
          : "border-white/10 hover:border-white/25 hover:bg-white/[0.03]"
      }`}
    >
      <svg
        className="mb-2 h-8 w-8 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <p className="mb-0.5 text-sm font-medium text-gray-300">
        タップして画像を追加
      </p>
      <p className="text-xs text-gray-500">
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
