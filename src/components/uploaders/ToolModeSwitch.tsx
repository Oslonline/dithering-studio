"use client";

import { useTranslation } from "react-i18next";

interface ToolModeSwitchProps {
  videoMode: boolean;
  onSelectImage: () => void;
  onSelectVideo: () => void;
}

export default function ToolModeSwitch({ videoMode, onSelectImage, onSelectVideo }: ToolModeSwitchProps) {
  const { t } = useTranslation();
  const segmentClass = (active: boolean) =>
    `flex-1 rounded px-3 py-2.5 text-[11px] font-medium tracking-wide transition-all ${
      active ? "bg-blue-600/90 text-white shadow-sm" : "text-gray-400 hover:text-gray-200"
    }`;

  return (
    <div
      className="flex w-full gap-0.5 rounded-md border border-neutral-800 bg-neutral-900/40 p-0.5"
      role="group"
      aria-label={t("tool.modeSwitchLabel", { defaultValue: "Media mode" })}
    >
      <button
        type="button"
        onClick={onSelectImage}
        className={segmentClass(!videoMode)}
        aria-pressed={!videoMode}
      >
        {t("tool.imageMode")}
      </button>
      <button
        type="button"
        onClick={onSelectVideo}
        className={segmentClass(videoMode)}
        aria-pressed={videoMode}
      >
        {t("tool.videoMode")}
      </button>
    </div>
  );
}
