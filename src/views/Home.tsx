"use client";

import React from "react";
import InfiniteImageScroll from "../components/ui/InfiniteImageScroll";
import SiteFooter from "../components/ui/SiteFooter";
import SectionDivider from "../components/marketing/SectionDivider";
import ProofStats from "../components/marketing/ProofStats";
import MediaProcessingShowcase from "../components/marketing/MediaProcessingShowcase";
import ValuePillars from "../components/marketing/ValuePillars";
import FeatureGrid from "../components/marketing/FeatureGrid";
import GalleryTeaser from "../components/marketing/GalleryTeaser";
import LearningPathPreview from "../components/marketing/LearningPathPreview";
import HomeCtaBand from "../components/marketing/HomeCtaBand";
import Header from "../components/ui/Header";
import { Link } from "../lib/nextRouterCompat";
import { useTranslation } from "react-i18next";
import { normalizeLang, withLangPrefix } from "../utils/localePath";
import { algorithms } from "../utils/algorithms";
import type { GalleryItemPublic } from "../lib/gallery/types";

interface HomeProps {
  galleryItems?: GalleryItemPublic[];
}

const Home: React.FC<HomeProps> = ({ galleryItems = [] }) => {
  const { t, i18n } = useTranslation();
  const activeLang = normalizeLang(i18n.language);
  const algorithmCount = algorithms.length;

  const algorithmGroups = React.useMemo(() => {
    const byCategory = new Map<string, { category: string; items: { id: number; name: string }[] }>();
    const order: string[] = [];
    for (const algo of algorithms) {
      if (!byCategory.has(algo.category)) {
        byCategory.set(algo.category, { category: algo.category, items: [] });
        order.push(algo.category);
      }
      byCategory.get(algo.category)!.items.push({ id: algo.id, name: algo.name });
    }
    return order.map((c) => byCategory.get(c)!).filter(Boolean);
  }, []);

  return (
    <div className="relative flex min-h-dvh flex-col bg-neutral-950 text-neutral-50">
      <Header activeNav="home" />
      <div id="main-content" className="flex flex-1 flex-col">
        <section
          data-hero
          className="relative box-border flex h-[calc(100dvh-var(--site-header-height))] min-h-[calc(100dvh-var(--site-header-height))] w-full items-center justify-center overflow-hidden px-4 py-4 sm:px-6 sm:py-5 md:px-10 lg:px-16 xl:px-20"
        >
          <div className="mx-auto flex w-full flex-col items-center justify-center gap-4 sm:gap-5 lg:gap-6">
            <div className="w-[80%] max-w-3xl shrink-0 space-y-3 text-center sm:space-y-4">
              <h1 className="font-anton text-[2.5rem] leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl xl:text-[4.25rem]">
                {t("hero.title")}
              </h1>
              <p className="mx-auto max-w-2xl text-[11px] leading-relaxed text-gray-400 sm:text-[12px] md:text-[13px] lg:text-[14px]">
                {t("hero.subtitle")}
              </p>
            </div>

            <div className="min-h-0 w-full max-w-6xl shrink rounded-lg border border-neutral-800/60 bg-neutral-900/40 p-3 shadow-[0_0_0_1px_#181818,0_4px_18px_-6px_rgba(0,0,0,0.6)] backdrop-blur-sm sm:p-4 lg:w-[70vw] lg:max-w-[70vw]">
              <div className="h-[clamp(9rem,22dvh,13rem)] overflow-hidden sm:h-[clamp(9.5rem,24dvh,14rem)] xl:h-[clamp(10.5rem,26dvh,16rem)] 2xl:h-[clamp(11.5rem,28dvh,18rem)]">
                <InfiniteImageScroll variant="hero" />
              </div>
              <p className="mt-2 text-center text-[10px] tracking-wide text-gray-500 sm:mt-2.5">
                {t("hero.liveGenerated")}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-3 text-[11px] sm:gap-4 sm:text-xs md:text-[13px]">
              <Link
                to={withLangPrefix("/Dithering/Image", activeLang)}
                className="clean-btn clean-btn-primary px-8 py-3 text-base"
              >
                {t("hero.cta")}
              </Link>
              {galleryItems.length > 0 && (
                <Link
                  to={withLangPrefix("/Gallery", activeLang)}
                  className="text-xs text-gray-500 underline decoration-gray-700 transition-colors hover:text-gray-300 hover:decoration-gray-500"
                >
                  {t("home.gallery.browse")}
                </Link>
              )}
            </div>
          </div>
        </section>

        <div className="px-6 md:px-10 lg:px-16 xl:px-24 2xl:px-32">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-24 pb-28 pt-16">
            <SectionDivider />
            <ProofStats algorithmCount={algorithmCount} />

            <SectionDivider />
            <MediaProcessingShowcase />

            <SectionDivider />
            <ValuePillars />

            <SectionDivider />
            <FeatureGrid />

            {galleryItems.length > 0 && (
              <>
                <SectionDivider />
                <GalleryTeaser items={galleryItems} />
              </>
            )}

            <SectionDivider />
            <LearningPathPreview />

            <SectionDivider />
            <section className="w-full max-w-5xl space-y-10">
              <h2 className="font-anton text-center text-xl tracking-tight sm:text-2xl">{t("howItWorks.title")}</h2>
              <ol className="mx-auto max-w-3xl list-inside list-decimal space-y-2 text-[11px] text-gray-400 sm:text-[12px] md:text-[13px]">
                <li>{t("howItWorks.step1")}</li>
                <li>{t("howItWorks.step2")}</li>
                <li>{t("howItWorks.step3")}</li>
                <li>{t("howItWorks.step4")}</li>
                <li>{t("howItWorks.step5")}</li>
              </ol>
            </section>

            <SectionDivider />
            <section className="w-full max-w-6xl space-y-12">
              <h2 className="font-anton text-center text-xl tracking-tight sm:text-2xl">{t("algorithmExplorer.title")}</h2>
              <p className="mx-auto max-w-xl text-center text-[11px] leading-relaxed text-gray-500 sm:text-[12px] md:text-[13px]">
                {t("algorithmExplorer.subtitle")}
              </p>
              <div className="space-y-12">
                {algorithmGroups.map((group) => (
                  <div key={group.category} className="space-y-4">
                    <h4 className="text-center font-mono text-[10px] tracking-wide text-gray-400 uppercase">
                      {t(`home.algorithmCategory.${group.category.toLowerCase().replace(/\s+/g, "")}`, {
                        defaultValue: group.category,
                      })}
                    </h4>
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
                      {group.items.map((a) => (
                        <Link
                          key={a.id}
                          to={`${withLangPrefix("/Education/Algorithms", activeLang)}?algo=${a.id}`}
                          className="group relative min-w-[140px] overflow-hidden rounded-md border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-center text-[10px] text-gray-300/85 transition will-change-transform hover:-translate-y-0.5 hover:border-blue-600/70 hover:bg-neutral-800/50 hover:text-gray-100 focus-visible:shadow-[var(--focus-ring)] sm:text-[11px] md:text-[12px]"
                          title={t("home.algorithmTileTitle", { name: a.name })}
                        >
                          <span className="relative z-10 truncate">{a.name}</span>
                          <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mx-auto max-w-2xl text-center text-[11px] leading-relaxed text-gray-500 sm:text-[12px] md:text-[13px]">
                {t("algorithmExplorer.deepLink")}
              </p>
            </section>

            <SectionDivider />
            <section className="w-full max-w-5xl space-y-6">
              <h2 className="font-anton text-center text-xl tracking-tight sm:text-2xl">{t("about.title")}</h2>
              <div className="mx-auto max-w-3xl space-y-4 text-[11px] leading-relaxed text-gray-400 sm:text-[12px] md:text-[13px]">
                <p>
                  <span className="text-gray-200">{t("about.brandName")}</span> {t("about.intro")}
                </p>
                <p>
                  {t("about.privacy1")}{" "}
                  <a
                    href="https://github.com/Oslonline/dithering-studio"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-200 underline decoration-neutral-600 hover:decoration-neutral-400"
                  >
                    {t("about.openSource")}
                  </a>
                  , {t("about.privacy2")}
                </p>
                <p>{t("about.features")}</p>
                <p>
                  {t("about.inspiration1")}{" "}
                  <a
                    href="https://ditherit.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-200 underline decoration-neutral-600 hover:decoration-neutral-400"
                  >
                    Dither It
                  </a>{" "}
                  {t("about.inspiration2")}{" "}
                  <a
                    href="https://studioaaa.com/product/dither-boy/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-200 underline decoration-neutral-600 hover:decoration-neutral-400"
                  >
                    Dither Boy
                  </a>
                  , {t("about.inspiration3")}
                </p>
                <p>{t("about.support")}</p>
              </div>
            </section>

            <HomeCtaBand />
          </div>
          <SiteFooter />
        </div>
      </div>
    </div>
  );
};

export default Home;
