"use client";

import { useTranslation } from "react-i18next";
import { LuCrop } from "react-icons/lu";

interface CropToggleButtonProps {
  active: boolean;
  onToggle: () => void;
  mode?: "image" | "video";
}

export default function CropToggleButton({ active, onToggle, mode = "image" }: CropToggleButtonProps) {
  const { t } = useTranslation();
  const labelKey = mode === "video" ? "tool.cropVideo" : "tool.cropImage";

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`clean-btn pointer-events-auto bg-neutral-900/90 p-2 hover:bg-neutral-800/90 ${
        active ? "ring-1 ring-blue-500/50" : ""
      }`}
      title={active ? t("tool.cropExit") : t(labelKey)}
      aria-label={active ? t("tool.cropExit") : t(labelKey)}
      aria-pressed={active}
    >
      <LuCrop size={14} />
    </button>
  );
}
