"use client";

import { useTranslation } from "react-i18next";
import { Link } from "../../lib/nextRouterCompat";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

export default function LearningPathPreview() {
  const { t, i18n } = useTranslation();
  const lang = normalizeLang(i18n.language);

  const paths = [
    {
      title: t("home.learn.basics.title"),
      body: t("home.learn.basics.body"),
      href: withLangPrefix("/Education/Basics", lang),
      primary: true,
    },
    {
      title: t("home.learn.practice.title"),
      body: t("home.learn.practice.body"),
      href: withLangPrefix("/Education/Practice", lang),
      primary: false,
    },
    {
      title: t("home.learn.reference.title"),
      body: t("home.learn.reference.body"),
      href: withLangPrefix("/Education/Algorithms", lang),
      primary: false,
    },
  ];

  return (
    <section className="w-full max-w-5xl space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="font-anton text-xl tracking-tight sm:text-2xl">{t("home.learn.title")}</h2>
        <p className="mx-auto max-w-2xl text-[11px] leading-relaxed text-gray-500 sm:text-[12px] md:text-[13px]">
          {t("home.learn.subtitle")}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {paths.map((path) => (
          <div key={path.href} className="flex flex-col rounded-lg border border-neutral-800 bg-neutral-900/40 p-5">
            <h3 className="text-[12px] font-medium tracking-wide text-gray-200">{path.title}</h3>
            <p className="mt-2 flex-1 text-[11px] leading-relaxed text-gray-500">{path.body}</p>
            <Link
              to={path.href}
              className={`clean-btn mt-4 justify-center py-2 text-[11px] ${path.primary ? "clean-btn-primary" : ""}`}
            >
              {t("home.learn.cta")}
            </Link>
          </div>
        ))}
      </div>
      <p className="text-center">
        <Link
          to={withLangPrefix("/Education", lang)}
          className="text-[11px] text-gray-500 underline decoration-gray-700 hover:text-gray-300"
        >
          {t("home.learn.hub")}
        </Link>
      </p>
    </section>
  );
}
