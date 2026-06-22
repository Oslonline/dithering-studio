"use client";

import { useTranslation } from "react-i18next";
import { Link } from "../../lib/nextRouterCompat";
import Header from "../ui/Header";
import SiteFooter from "../ui/SiteFooter";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

export default function EducationArticleShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-50">
      <Header activeNav="education" />
      <main id="main-content" className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 pt-10 md:px-8 md:pt-12">{children}</div>
        <div className="mx-auto w-full max-w-3xl px-4 md:px-8">
          <SiteFooter />
        </div>
      </main>
    </div>
  );
}

export function EducationHubLink() {
  const { t, i18n } = useTranslation();
  const lang = normalizeLang(i18n.language);

  return (
    <Link
      to={withLangPrefix("/Education", lang)}
      className="text-[11px] text-gray-500 underline decoration-gray-700 underline-offset-4 hover:text-gray-300"
    >
      {t("education.guide.hub.back", { defaultValue: "← Education hub" })}
    </Link>
  );
}
