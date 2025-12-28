import React from "react";
import InfiniteImageScroll from "../components/ui/InfiniteImageScroll";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { generateHreflangTags, getCanonicalUrlWithLang, getOgUrl, getSocialImageUrl } from "../utils/seo";
import { normalizeLang, withLangPrefix } from "../utils/localePath";

const Home: React.FC = () => {
  const { t, i18n } = useTranslation();
  const activeLang = normalizeLang(i18n.language);
  
  return (
    <>
      <Helmet>
        <html lang={i18n.language} />
        <title>Free Online Image & Video Dithering Tool | Floyd Steinberg & More</title>
        <meta name="description" content="Dither images and videos online for free using Floyd Steinberg, Bayer, Atkinson, and more. Create retro pixel art from images or apply 8-bit effects to videos. Fast, privacy-friendly, fully client-side – no uploads or account required." />
        <meta property="og:title" content="Free Online Image & Video Dithering Tool" />
        <meta property="og:description" content="Dither images and videos online for free using Floyd Steinberg, Bayer, Atkinson, and more. Create retro pixel art or apply 8-bit effects to videos." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getOgUrl('/', i18n.language)} />
        <meta property="og:image" content={getSocialImageUrl()} />
        <meta property="og:locale" content={i18n.language} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Online Image & Video Dithering Tool" />
        <meta name="twitter:description" content="Dither images and videos online for free using Floyd Steinberg, Bayer, Atkinson, and more. Create retro pixel art or apply 8-bit effects to videos." />
        <meta name="twitter:image" content={getSocialImageUrl()} />
        <link rel="canonical" href={getCanonicalUrlWithLang('/', i18n.language)} />
        {generateHreflangTags('/')}
      </Helmet>

      <div id="main-content" className="relative flex min-h-screen flex-col bg-neutral-950 px-6 py-6 text-neutral-50 md:px-10 md:py-6 lg:px-16 xl:px-24 2xl:px-32">
        <div className="flex flex-1 items-start justify-center">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-24 pb-28">
            {/* HERO */}
            <section data-hero className="flex min-h-[calc(100dvh-4rem)] w-full max-w-[90rem] flex-col items-center justify-center gap-7 py-6 sm:gap-8 sm:py-8 md:min-h-[calc(100dvh-5rem)]">
              <header className="w-full max-w-4xl space-y-6 text-center">
                <h1 className="font-anton text-[2.85rem] leading-tight tracking-tight sm:text-[3.2rem] md:text-[3.6rem] lg:text-[4.2rem] xl:text-[4.5rem]">{t('hero.title')}</h1>
                <p className="mx-auto max-w-2xl text-[11px] leading-relaxed text-gray-400 sm:text-[12px] md:text-[13px] lg:text-[14px]">{t('hero.subtitle')}</p>
              </header>
              <div className="relative max-h-[380px] w-full max-w-6xl overflow-hidden rounded-lg border border-neutral-800/60 bg-neutral-900/40 p-3 shadow-[0_0_0_1px_#181818,0_4px_18px_-6px_rgba(0,0,0,0.6)] backdrop-blur-sm sm:max-h-[420px] md:max-h-[480px] md:p-4 lg:max-h-[520px]">
                <InfiniteImageScroll />
                <p className="mt-3 text-center text-[10px] tracking-wide text-gray-500">{t('hero.liveGenerated')}</p>
              </div>
              <div className="flex flex-col items-center gap-4 text-[11px] sm:text-xs md:text-[13px]">
                <Link to={withLangPrefix('/Dithering/Image', activeLang)} className="clean-btn clean-btn-primary text-base px-8 py-3">
                  {t('hero.cta')}
                </Link>
                <Link to={withLangPrefix('/Algorithms', activeLang)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors underline decoration-gray-700 hover:decoration-gray-500">
                  {t('hero.algorithmReference')}
                </Link>
              </div>
            </section>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-800/70 to-transparent" />

            {/* FEATURE GRID */}
            <section className="w-full max-w-5xl space-y-10">
              <div className="space-y-2 text-center">
                <h2 className="font-anton text-xl tracking-tight sm:text-2xl">{t('features.title')}</h2>
                <p className="mx-auto max-w-md text-[11px] leading-relaxed text-gray-500 sm:text-[12px] md:text-[13px]">{t('features.subtitle')}</p>
              </div>
              <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
                {[
                  { title: t('features.algorithms'), desc: t('features.algorithmsDesc') },
                  { title: t('features.imageVideo'), desc: t('features.imageVideoDesc') },
                  { title: t('features.palette'), desc: t('features.paletteDesc') },
                  { title: t('features.noAccount'), desc: t('features.noAccountDesc') },
                  { title: t('features.export'), desc: t('features.exportDesc') },
                  { title: t('features.clientSide'), desc: t('features.clientSideDesc') },
                ].map((f, i) => (
                  <div key={i} className="relative flex flex-col gap-2 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/40 p-5 transition-colors hover:border-neutral-700">
                    <span className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-blue-500/60 via-blue-400/30 to-transparent opacity-80" />
                    <h3 className="text-[12px] font-medium tracking-wide text-gray-200">{f.title}</h3>
                    <p className="text-[11px] leading-relaxed text-gray-500">{f.desc}</p>
                  </div>
                ))}
              </div>
            </section>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-800/70 to-transparent" />

            {/* HOW IT WORKS */}
            <section className="w-full max-w-5xl space-y-10">
              <h2 className="font-anton text-center text-xl tracking-tight sm:text-2xl">{t('howItWorks.title')}</h2>
              <ol className="mx-auto max-w-3xl list-inside list-decimal space-y-2 text-[11px] text-gray-400 sm:text-[12px] md:text-[13px]">
                <li>{t('howItWorks.step1')}</li>
                <li>{t('howItWorks.step2')}</li>
                <li>{t('howItWorks.step3')}</li>
                <li>{t('howItWorks.step4')}</li>
                <li>{t('howItWorks.step5')}</li>
              </ol>
            </section>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-800/70 to-transparent" />

            {/* ALGORITHM COVERAGE (deep-link enabled) */}
            <section className="w-full max-w-6xl space-y-12">
              <h2 className="font-anton text-center text-xl tracking-tight sm:text-2xl">{t('algorithmExplorer.title')}</h2>
              <p className="mx-auto max-w-xl text-center text-[11px] leading-relaxed text-gray-500 sm:text-[12px] md:text-[13px]">{t('algorithmExplorer.subtitle')}</p>
              <div className="space-y-12">
                {[
                  {
                    label: "Error Diffusion",
                    items: [
                      { id: 1, name: "Floyd–Steinberg" },
                      { id: 21, name: "Adaptive FS 3×3" },
                      { id: 22, name: "Adaptive FS 7×7" },
                      { id: 3, name: "Atkinson" },
                      { id: 5, name: "Stucki" },
                      { id: 4, name: "Burkes" },
                      { id: 6, name: "Sierra" },
                      { id: 13, name: "Two‑Row Sierra" },
                      { id: 12, name: "Sierra Lite" },
                      { id: 7, name: "Jarvis–Judice–Ninke" },
                      { id: 14, name: "Stevenson–Arce" },
                      { id: 18, name: "Ostromoukhov" },
                      { id: 19, name: "False Floyd–Steinberg" },
                      { id: 27, name: "Riemersma" },
                    ],
                  },
                  {
                    label: "Ordered / Stochastic",
                    items: [
                      { id: 16, name: "Bayer 2×2" },
                      { id: 2, name: "Bayer 4×4" },
                      { id: 8, name: "Bayer 8×8" },
                      { id: 20, name: "Bayer 16×16" },
                      { id: 17, name: "Blue Noise 64×64" },
                    ],
                  },
                  {
                    label: "Other / Experimental",
                    items: [
                      { id: 9, name: "Halftone" },
                      { id: 10, name: "Random Threshold" },
                      { id: 11, name: "Dot Diffusion (Simple)" },
                      { id: 15, name: "Binary Threshold" },
                    ],
                  },
                ].map((group) => (
                  <div key={group.label} className="space-y-4">
                    <h4 className="text-center font-mono text-[10px] tracking-wide text-gray-400 uppercase">{t(`algorithmExplorer.${group.label.replace(/[^a-zA-Z]/g, '').toLowerCase()}`)}</h4>
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
                      {group.items.map((a) => (
                        <Link
                          key={a.id}
                          to={`${withLangPrefix('/Algorithms', activeLang)}?algo=${a.id}`}
                          className="group relative min-w-[140px] overflow-hidden rounded-md border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-center text-[10px] text-gray-300/85 transition will-change-transform hover:-translate-y-0.5 hover:border-blue-600/70 hover:bg-neutral-800/50 hover:text-gray-100 focus-visible:shadow-[var(--focus-ring)] sm:text-[11px] md:text-[12px]"
                          title={`View ${a.name} details`}
                        >
                          <span className="relative z-10 truncate">{a.name}</span>
                          <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mx-auto max-w-2xl text-center text-[11px] leading-relaxed text-gray-500 sm:text-[12px] md:text-[13px]">{t('algorithmExplorer.deepLink')}</p>
            </section>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-800/70 to-transparent" />

            {/* PRIVACY / PHILOSOPHY + OPEN SOURCE */}
            <section className="w-full max-w-5xl space-y-6">
              <h2 className="font-anton text-center text-xl tracking-tight sm:text-2xl">{t('about.title')}</h2>
              <div className="mx-auto max-w-3xl space-y-4 text-[11px] leading-relaxed text-gray-400 sm:text-[12px] md:text-[13px]">
                <p>
                  <span className="text-gray-200">{t('about.brandName')}</span> {t('about.intro')}
                </p>
                <p>
                  {t('about.privacy1')}{" "}
                  <a href="https://github.com/Oslonline/steinberg-image" target="_blank" rel="noopener noreferrer" className="text-gray-200 underline decoration-neutral-600 hover:decoration-neutral-400">
                    {t('about.openSource')}
                  </a>
                  , {t('about.privacy2')}
                </p>
                <p>
                  {t('about.features')}
                </p>
                <p>
                  {t('about.inspiration1')}{" "}
                  <a href="https://ditherit.com/" target="_blank" rel="noopener noreferrer" className="text-gray-200 underline decoration-neutral-600 hover:decoration-neutral-400">
                    Dither It
                  </a>{" "}
                  {t('about.inspiration2')}{" "}
                  <a href="https://studioaaa.com/product/dither-boy/" target="_blank" rel="noopener noreferrer" className="text-gray-200 underline decoration-neutral-600 hover:decoration-neutral-400">
                    Dither Boy
                  </a>
                  , {t('about.inspiration3')}
                </p>
                <p>{t('about.support')}</p>
              </div>
            </section>
          </div>
        </div>
        <footer className="mt-auto flex flex-col gap-10 border-t border-neutral-900 pt-10 pb-12">
          <div className="flex flex-col items-center gap-5">
            <Link to={withLangPrefix('/Dithering/Image', activeLang)} className="clean-btn clean-btn-primary">
              {t('footer.cta')}
            </Link>
            <p className="text-[10px] tracking-wide text-gray-600">{t('footer.tagline')}</p>
          </div>
          <div className="flex flex-col items-center gap-4 text-[10px] text-gray-500 sm:text-[11px] md:text-xs">
            <nav className="flex flex-wrap justify-center gap-6">
              <Link to={withLangPrefix('/Algorithms', activeLang)} className="transition-colors hover:text-gray-300">
                {t('footer.algorithms')}
              </Link>
              <a href="https://github.com/Oslonline/steinberg-image" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-gray-300">
                {t('footer.github')}
              </a>
              <a href="https://github.com/Oslonline/steinberg-image/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-gray-300">
                {t('footer.license')}
              </a>
            </nav>
            <p className="flex items-center gap-1">
              {t('footer.by')}{" "}
              <a className="text-blue-300 duration-100 hover:text-blue-500" href="https://oslo418.com" rel="noopener noreferrer">
                Oslo418
              </a>{" "}
              • Apache 2.0
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
