"use client";

import { useTranslation } from "react-i18next";
import { Link } from "../../lib/nextRouterCompat";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

interface PatternComparisonProps {
  minimal?: boolean;
}

export default function PatternComparison({ minimal = false }: PatternComparisonProps) {
  const { t, i18n } = useTranslation();
  const lang = normalizeLang(i18n.language);
  const algoBase = withLangPrefix("/Education/Algorithms", lang);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-4">
        <div className="mb-3 flex h-24 items-center justify-center rounded-md border border-dashed border-neutral-700 bg-[repeating-linear-gradient(45deg,#1a1a1a_0,#1a1a1a_2px,#252525_2px,#252525_4px)] font-mono text-[9px] text-gray-600">
          ░▒▓█
        </div>
        <h3 className="text-[12px] font-medium tracking-wide text-gray-200">
          {t("education.visual.orderedLabel", { defaultValue: "Ordered (Bayer)" })}
        </h3>
        <p className="mt-2 text-[12px] leading-relaxed text-gray-400">
          {t("education.visual.orderedHint", {
            defaultValue: "Repeating matrix—fast, crisp, pixel-friendly grid.",
          })}
        </p>
        {!minimal && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to={`${algoBase}?algo=2`} className="clean-btn px-3 py-1.5 text-[11px]">
              {t("education.visual.seeOrdered", { defaultValue: "See Bayer 4×4" })}
            </Link>
            <Link to={withLangPrefix("/Dithering/Image", lang)} className="clean-btn px-3 py-1.5 text-[11px]">
              {t("education.families.tryInTool", { defaultValue: "Try in tool" })}
            </Link>
          </div>
        )}
        {minimal && (
          <p className="mt-3 text-[11px]">
            <Link to={`${algoBase}?algo=2`} className="text-gray-400 underline decoration-gray-700 hover:text-gray-200">
              {t("education.visual.seeOrdered", { defaultValue: "Bayer 4×4 reference" })}
            </Link>
          </p>
        )}
      </div>
      <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-4">
        <div className="mb-3 flex h-24 items-center justify-center rounded-md border border-dashed border-neutral-700 bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-950 font-mono text-[9px] text-gray-600">
          ·:·:·:·
        </div>
        <h3 className="text-[12px] font-medium tracking-wide text-gray-200">
          {t("education.visual.errorLabel", { defaultValue: "Error diffusion (Floyd–Steinberg)" })}
        </h3>
        <p className="mt-2 text-[12px] leading-relaxed text-gray-400">
          {t("education.visual.errorHint", {
            defaultValue: "Error spread to neighbors—often smoother gradients.",
          })}
        </p>
        {!minimal && (
          <div className="mt-3 flex flex-wrap gap-2">
            <Link to={`${algoBase}?algo=1`} className="clean-btn px-3 py-1.5 text-[11px]">
              {t("education.visual.seeError", { defaultValue: "See Floyd–Steinberg" })}
            </Link>
            <Link to={withLangPrefix("/Dithering/Image", lang)} className="clean-btn px-3 py-1.5 text-[11px]">
              {t("education.families.tryInTool", { defaultValue: "Try in tool" })}
            </Link>
          </div>
        )}
        {minimal && (
          <p className="mt-3 text-[11px]">
            <Link to={`${algoBase}?algo=1`} className="text-gray-400 underline decoration-gray-700 hover:text-gray-200">
              {t("education.visual.seeError", { defaultValue: "Floyd–Steinberg reference" })}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
