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
          <h1 className="font-anton text-3xl leading-tight text-gray-100 md:text-4xl">{t("education.title")}</h1>
          <p className="text-[12px] leading-relaxed text-gray-400">
            {t("education.hero.subtitle", {
              defaultValue:
                "Understand ordered matrices, error diffusion, and palettes—then apply what you learn in the tool with companion examples.",
            })}
          </p>
          <div className="flex flex-wrap gap-2">
            <Link to={withLangPrefix("/Education/Basics", lang)} className="clean-btn clean-btn-primary px-4 py-2 text-[11px]">
              {t("education.hero.ctaBasics", { defaultValue: "Start with Basics" })}
            </Link>
            <Link to={withLangPrefix("/Education/Algorithms", lang)} className="clean-btn px-4 py-2 text-[11px]">
              {t("education.hero.ctaAlgorithms", { defaultValue: "Explore algorithms" })}
            </Link>
            <Link to={withLangPrefix("/Dithering/Image", lang)} className="clean-btn px-4 py-2 text-[11px] text-gray-400">
              {t("education.hero.ctaTool", { defaultValue: "Open the tool" })}
            </Link>
          </div>
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
