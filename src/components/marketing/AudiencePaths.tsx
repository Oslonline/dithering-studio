"use client";

import { useTranslation } from "react-i18next";
import { Link } from "../../lib/nextRouterCompat";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

export default function AudiencePaths() {
  const { t, i18n } = useTranslation();
  const lang = normalizeLang(i18n.language);

  const paths = [
    {
      title: t("education.paths.beginner.title", { defaultValue: "Beginner" }),
      body: t("education.paths.beginner.body", {
        defaultValue: "Core definitions, the two algorithm families, and a short FAQ—no math required.",
      }),
      cta: t("education.paths.beginner.cta", { defaultValue: "Start with Basics" }),
      href: withLangPrefix("/Education/Basics", lang),
      primary: true,
    },
    {
      title: t("education.paths.creator.title", { defaultValue: "Practical creator" }),
      body: t("education.paths.creator.body", {
        defaultValue: "Recipes for gradients, retro looks, and video—threshold, serpentine, and palette tips.",
      }),
      cta: t("education.paths.creator.cta", { defaultValue: "Go to Practice" }),
      href: withLangPrefix("/Education/Practice", lang),
      primary: false,
    },
    {
      title: t("education.paths.technical.title", { defaultValue: "Technical explorer" }),
      body: t("education.paths.technical.body", {
        defaultValue: "Per-algorithm reference, kernels, complexity notes, and deep links into the workspace.",
      }),
      cta: t("education.paths.technical.cta", { defaultValue: "Algorithm reference" }),
      href: withLangPrefix("/Education/Algorithms", lang),
      primary: false,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-anton text-xl tracking-tight text-gray-100">
          {t("education.paths.title", { defaultValue: "Choose your path" })}
        </h2>
        <p className="text-[12px] leading-relaxed text-gray-400">
          {t("education.paths.subtitle", {
            defaultValue: "Three entry points depending on how deep you want to go on the first visit.",
          })}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {paths.map((path) => (
          <div key={path.href} className="flex flex-col rounded-lg border border-neutral-800 bg-neutral-900/20 p-4">
            <h3 className="text-[12px] font-medium tracking-wide text-gray-200">{path.title}</h3>
            <p className="mt-2 flex-1 text-[12px] leading-relaxed text-gray-400">{path.body}</p>
            <Link
              to={path.href}
              className={`clean-btn mt-4 justify-center py-2 text-[11px] ${path.primary ? "clean-btn-primary" : ""}`}
            >
              {path.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
