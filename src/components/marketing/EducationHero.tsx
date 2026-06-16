"use client";

import { useTranslation } from "react-i18next";
import { Link } from "../../lib/nextRouterCompat";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

export default function EducationHero() {
  const { t, i18n } = useTranslation();
  const lang = normalizeLang(i18n.language);

  return (
    <header className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 md:items-center">
        <div className="space-y-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500">
            {t("education.hero.kicker", { defaultValue: "Learn dithering" })}
          </p>
          <h1 className="font-anton text-3xl leading-tight text-gray-100 md:text-4xl">
            {t("education.guide.pageTitle", { defaultValue: "Understanding dithering" })}
          </h1>
          <p className="text-[12px] leading-relaxed text-gray-400 sm:text-[13px]">
            {t("education.guide.pageLead", {
              defaultValue:
                "Two short chapters on how dithering fakes extra tones, how ordered threshold maps work, and where to experiment in Dithering Studio.",
            })}
          </p>
          <Link
            to={withLangPrefix("/Education/Part-1", lang)}
            className="clean-btn clean-btn-primary px-4 py-2 text-[11px]"
          >
            {t("education.hero.ctaPart1", { defaultValue: "Start with Part 1" })}
          </Link>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-2">
          <img
            src="/education-hero.png"
            alt={t("education.heroImageAlt")}
            className="block h-auto w-full rounded-md"
            loading="lazy"
          />
        </div>
      </div>
    </header>
  );
}
