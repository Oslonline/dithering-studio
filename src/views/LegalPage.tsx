"use client";

import { useTranslation } from "react-i18next";
import Header from "../components/ui/Header";
import SiteFooter from "../components/ui/SiteFooter";
import enLegal from "../i18n/locales/en/legal";

type LegalSection = { heading: string; body: string };

interface LegalPageProps {
  pageKey: "terms" | "privacy" | "cookies";
}

export default function LegalPage({ pageKey }: LegalPageProps) {
  const { t } = useTranslation();
  const prefix = `legal.${pageKey}`;

  const sections = t(`${prefix}.sections`, {
    returnObjects: true,
    defaultValue: enLegal[pageKey].sections,
  }) as LegalSection[] | string;

  const sectionList = Array.isArray(sections) && sections.length > 0 ? sections : enLegal[pageKey].sections;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-50">
      <Header />
      <main id="main-content" className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pt-10 md:px-8">
        <header className="mb-8 space-y-2">
          <h1 className="font-anton text-3xl tracking-tight text-gray-100 sm:text-4xl">
            {t(`${prefix}.title`, { defaultValue: pageKey })}
          </h1>
          <p className="text-xs text-gray-500">
            {t(`${prefix}.lastUpdated`, { defaultValue: "Last updated: May 28, 2026" })}
          </p>
        </header>
        <div className="space-y-8 pb-10">
          {sectionList.map((section) => (
            <section key={section.heading} className="space-y-2">
              <h2 className="text-sm font-medium tracking-wide text-gray-200">{section.heading}</h2>
              <p className="text-sm leading-relaxed text-gray-400">{section.body}</p>
            </section>
          ))}
        </div>
        <SiteFooter />
      </main>
    </div>
  );
}
