"use client";

import { useTranslation } from "react-i18next";
import type { UploadedImage } from "./ImagesPanel";

interface FloatingImagesStripProps {
  images: UploadedImage[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

export default function FloatingImagesStrip({ images, activeId, onSelect, onRemove }: FloatingImagesStripProps) {
  const { t } = useTranslation();

  if (images.length <= 1) return null;

  return (
    <div
      className="pointer-events-none absolute bottom-4 left-1/2 z-30 max-w-[min(92vw,36rem)] -translate-x-1/2"
      role="listbox"
      aria-label={t("tool.imagesPanel.title")}
    >
      <div className="pointer-events-auto flex items-center gap-2 overflow-x-auto rounded-xl border border-neutral-800/90 bg-[#111]/95 px-2 py-2 shadow-lg backdrop-blur-sm">
        {images.map((img) => {
          const active = img.id === activeId;
          return (
            <div key={img.id} className="group relative shrink-0">
              <button
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => onSelect(img.id)}
                className={`block overflow-hidden rounded-md border-2 transition ${
                  active ? "border-blue-500 ring-1 ring-blue-500/40" : "border-neutral-700 hover:border-neutral-500"
                }`}
                title={img.name || t("tool.imagesPanel.image")}
              >
                <img src={img.url} alt="" className="h-14 w-14 object-cover sm:h-16 sm:w-16" />
              </button>
              <button
                type="button"
                onClick={() => onRemove(img.id)}
                className="absolute -top-1.5 -right-1.5 hidden h-5 w-5 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-[10px] text-gray-400 hover:border-red-800 hover:text-red-300 group-hover:flex"
                aria-label={t("tool.imagesPanel.remove")}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
