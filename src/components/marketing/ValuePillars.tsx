"use client";

import { useTranslation } from "react-i18next";

export default function ValuePillars() {
  const { t } = useTranslation();

  const pillars = [
    { title: t("home.why.title"), body: t("home.why.body") },
    { title: t("home.who.title"), body: t("home.who.body") },
    { title: t("home.privacy.title"), body: t("home.privacy.body") },
    {
      title: t("home.learnBuiltIn.title", { defaultValue: "Learn built in" }),
      body: t("home.learnBuiltIn.body", {
        defaultValue:
          "Basics, practice recipes, and per-algorithm reference live inside the app — understand the pattern before you export.",
      }),
    },
  ];

  return (
    <section className="w-full max-w-6xl" aria-labelledby="value-pillars-heading">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,11rem)_1fr] lg:gap-16 xl:grid-cols-[minmax(0,14rem)_1fr]">
        <div className="lg:sticky lg:top-[calc(var(--site-header-height)+1.5rem)] lg:self-start">
          <h2 id="value-pillars-heading" className="mt-2 font-anton text-xl tracking-tight sm:text-2xl">
            {t("home.value.title")}
          </h2>
          <p className="mt-3 text-[11px] leading-relaxed text-gray-500 sm:text-[12px] md:text-[13px]">
            {t("home.value.subtitle")}
          </p>
        </div>

        <ol className="divide-y divide-neutral-800/80">
          {pillars.map((pillar, index) => (
            <li key={pillar.title} className="grid gap-4 py-8 sm:grid-cols-[3rem_1fr] sm:gap-6 sm:py-10">
              <span className="font-mono text-[11px] leading-none text-gray-600 tabular-nums sm:pt-0.5">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="space-y-2">
                <h3 className="text-[13px] font-medium tracking-wide text-gray-100 sm:text-[14px]">{pillar.title}</h3>
                <p className="max-w-2xl text-[11px] leading-relaxed text-gray-500 sm:text-[12px] md:text-[13px]">
                  {pillar.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
