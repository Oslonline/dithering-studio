"use client";

import { useTranslation } from "react-i18next";
import { LuSquareSplitHorizontal } from "react-icons/lu";

interface CompareToggleButtonProps {
  active: boolean;
  onToggle: () => void;
}

export default function CompareToggleButton({ active, onToggle }: CompareToggleButtonProps) {
  const { t } = useTranslation();

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`clean-btn pointer-events-auto absolute left-full top-0 z-30 ml-2 bg-neutral-900/90 p-2 hover:bg-neutral-800/90 ${
        active ? "ring-1 ring-blue-500/50" : ""
      }`}
      title={active ? t("tool.showDitheredOnly") : t("tool.compareBeforeAfter")}
      aria-label={active ? t("tool.hideComparison") : t("tool.compare")}
      aria-pressed={active}
    >
      <LuSquareSplitHorizontal size={14} />
    </button>
  );
}
