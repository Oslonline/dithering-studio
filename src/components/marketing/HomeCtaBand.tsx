"use client";

import { useTranslation } from "react-i18next";
import { Link } from "../../lib/nextRouterCompat";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

export default function HomeCtaBand() {
  const { t, i18n } = useTranslation();
  const lang = normalizeLang(i18n.language);

  return (
    <section className="w-full max-w-3xl rounded-lg border border-neutral-800 bg-neutral-900/40 p-8 text-center">
      <h2 className="font-anton text-xl tracking-tight sm:text-2xl">{t("home.ctaBand.title")}</h2>
      <p className="mx-auto mt-2 max-w-lg text-[11px] leading-relaxed text-gray-500 sm:text-[12px]">
        {t("home.ctaBand.subtitle")}
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row sm:flex-wrap">
        <Link to={withLangPrefix("/Dithering/Image", lang)} className="clean-btn clean-btn-primary px-6 py-2.5 text-[11px]">
          {t("home.ctaBand.tool")}
        </Link>
        <Link to={withLangPrefix("/Education", lang)} className="clean-btn px-6 py-2.5 text-[11px]">
          {t("home.ctaBand.learn")}
        </Link>
        <Link to={withLangPrefix("/Education/Algorithms", lang)} className="clean-btn px-6 py-2.5 text-[11px]">
          {t("home.ctaBand.algorithms")}
        </Link>
      </div>
    </section>
  );
}
