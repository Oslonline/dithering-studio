"use client";

import { useTranslation } from "react-i18next";

interface ToolCanvasHintsProps {
  mediaActive?: boolean;
}

export default function ToolCanvasHints({ mediaActive = false }: ToolCanvasHintsProps) {
  const { t } = useTranslation();

  return (
    <div className="pointer-events-none fixed bottom-2 left-2 z-40 hidden select-none font-mono text-[9px] leading-snug tracking-wide text-gray-600 md:block">
      <div>{t("tool.performance.dragToZoom")}</div>
      <div>
        {mediaActive
          ? t("tool.canvasViewport.keyboardHint")
          : t("tool.keyboardHintFocus")}
      </div>
      <div>{t("tool.performance.localProcessing")}</div>
    </div>
  );
}
