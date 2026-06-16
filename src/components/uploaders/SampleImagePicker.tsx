"use client";

import { useTranslation } from "react-i18next";
import { TOOL_SAMPLE_IMAGES } from "../../lib/tool/sampleImages";

interface SampleImagePickerProps {
  onSelect: (src: string, name: string) => void;
  disabled?: boolean;
}

export default function SampleImagePicker({ onSelect, disabled = false }: SampleImagePickerProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-800" />
        <span className="font-mono text-[9px] uppercase tracking-widest text-gray-600">
          {t("tool.samples.orTry", { defaultValue: "Or try a sample" })}
        </span>
        <div className="h-px flex-1 bg-neutral-800" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {TOOL_SAMPLE_IMAGES.map((sample) => (
          <button
            key={sample.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(sample.src, sample.name)}
            className="group overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/50 transition hover:border-blue-600/60 hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-950">
              <img
                src={sample.src}
                alt=""
                className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.03]"
                loading="lazy"
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
