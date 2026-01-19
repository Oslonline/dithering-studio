import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Header from "../../components/ui/Header";
import {
  generateHreflangTags,
  generateOpenGraphLocaleAlternates,
  getCanonicalUrlWithLang,
  getOgUrl,
  getOpenGraphLocale,
  getSocialImageUrl,
} from "../../utils/seo";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

const EDUCATION_BASICS_PATH = "/Education/Basics";

const EducationBasics: React.FC = () => {
  const { t, i18n } = useTranslation();
  const activeLang = normalizeLang(i18n.language);

  const pageTitle = t("education.basics.seo.title", {
    defaultValue: "Dithering Basics | Definition, Bayer Matrix & Error Diffusion",
  });
  const pageDescription = t("education.basics.seo.description", {
    defaultValue:
      "Dithering basics: definition, how dithering reduces banding, and how ordered dithering (Bayer matrix) differs from error diffusion (Floyd–Steinberg).",
  });

  return (
    <>
      <Helmet>
        <html lang={i18n.language} />
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />

        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getOgUrl(EDUCATION_BASICS_PATH, i18n.language)} />
        <meta property="og:image" content={getSocialImageUrl()} />
        <meta property="og:locale" content={getOpenGraphLocale(i18n.language)} />
        {generateOpenGraphLocaleAlternates(i18n.language)}

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={getSocialImageUrl()} />

        <link
          rel="canonical"
          href={getCanonicalUrlWithLang(EDUCATION_BASICS_PATH, i18n.language)}
        />
        {generateHreflangTags(EDUCATION_BASICS_PATH)}
      </Helmet>

      <div className="flex h-screen w-full flex-col overflow-hidden">
        <Header page="education" />

        <main id="main-content" className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl px-6 py-12">
            <header className="space-y-4">
              <h1 className="font-anton text-3xl leading-tight text-gray-100">
                {t("education.basics.title", { defaultValue: "Basics" })}
              </h1>
              <p className="text-[12px] leading-relaxed text-gray-400">
                {t("education.basics.lead", {
                  defaultValue:
                    "A quick, clean foundation: what dithering is, what problems it solves, and how the two main families behave.",
                })}
              </p>
            </header>

            <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-neutral-800/70 to-transparent" />

            <section className="space-y-10">
              <section className="space-y-3">
                <h2 className="font-anton text-xl tracking-tight text-gray-100">
                  {t("education.whatIs.title", { defaultValue: "What is dithering? (Definition)" })}
                </h2>
                <p className="text-[12px] leading-relaxed text-gray-400">
                  <strong className="font-semibold text-gray-200">
                    {t("education.strong.dithering", { defaultValue: "Dithering" })}
                  </strong>{" "}
                  {t("education.basics.whatIs.bodyTail", {
                    defaultValue:
                      "is a technique that simulates extra tones by arranging pixels into patterns. In graphics, dithering is commonly used after quantization (reducing colors or grayscale levels) to reduce banding and create a deliberate dither effect.",
                  })}
                </p>
                <ul className="list-disc space-y-1 pl-5 text-[12px] text-gray-400">
                  <li>{t("education.whatIs.point1", { defaultValue: "Reduces visible banding in gradients" })}</li>
                  <li>{t("education.whatIs.point2", { defaultValue: "Makes limited palettes look richer (color dithering)" })}</li>
                  <li>{t("education.whatIs.point3", { defaultValue: "Creates a deliberate retro / pixel art texture" })}</li>
                </ul>
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-5 text-[12px] leading-relaxed text-gray-400">
                  <p>
                    <strong className="font-semibold text-gray-200">
                      {t("education.basics.ditherVsDithering.title", { defaultValue: "Dither vs dithering" })}
                    </strong>
                    {t("education.basics.ditherVsDithering.body", {
                      defaultValue:
                        ": people say “dither” (verb) or “dithering” (noun) for the same idea: using patterns/noise to hide quantization steps. The goal is not to add real detail, but to change how tone steps are perceived.",
                    })}
                  </p>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="font-anton text-xl tracking-tight text-gray-100">
                  {t("education.basics.bandings.title", { defaultValue: "Why dithering reduces banding" })}
                </h2>
                <p className="text-[12px] leading-relaxed text-gray-400">
                  {t("education.basics.bandings.body", {
                    defaultValue:
                      "Banding happens when a smooth gradient is forced into too few levels (for example, 256 → 16 shades). Dithering spreads those missing tones into a pattern so the eye perceives a smoother transition.",
                  })}
                </p>
                <ul className="list-disc space-y-1 pl-5 text-[12px] text-gray-400">
                  <li>
                    {t("education.basics.bandings.point1", {
                      defaultValue:
                        "Quantization reduces available tones/colors; dithering hides the “steps”.",
                    })}
                  </li>
                  <li>
                    {t("education.basics.bandings.point2", {
                      defaultValue:
                        "Different algorithms trade speed, texture, and artifacts.",
                    })}
                  </li>
                </ul>
              </section>

              <section className="space-y-3">
                <h2 className="font-anton text-xl tracking-tight text-gray-100">
                  {t("education.families.title", { defaultValue: "The two main families" })}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-5">
                    <h3 className="text-[12px] tracking-wide text-gray-200">
                      <strong className="font-semibold">
                        {t("education.families.ordered.title", {
                          defaultValue: "Ordered dithering (Bayer matrix)",
                        })}
                      </strong>
                    </h3>
                    <p className="mt-2 text-[12px] leading-relaxed text-gray-400">
                      {t("education.families.ordered.body", {
                        defaultValue:
                          "Ordered dithering compares each pixel’s brightness to a repeating threshold matrix (often a Bayer matrix). It’s extremely fast and deterministic, and its structured pattern can be a feature for pixel art and clean graphic looks.",
                      })}
                    </p>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-[12px] text-gray-400">
                      <li>
                        {t("education.families.ordered.point1", {
                          defaultValue: "Best when you want a predictable repeating pattern.",
                        })}
                      </li>
                      <li>
                        {t("education.families.ordered.point2", {
                          defaultValue: "Common artifact: visible tiles or a “grid” look (matrix size matters).",
                        })}
                      </li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-5">
                    <h3 className="text-[12px] tracking-wide text-gray-200">
                      <strong className="font-semibold">
                        {t("education.families.error.title", {
                          defaultValue: "Error diffusion (Floyd–Steinberg)",
                        })}
                      </strong>
                    </h3>
                    <p className="mt-2 text-[12px] leading-relaxed text-gray-400">
                      {t("education.families.error.body", {
                        defaultValue:
                          "Error diffusion quantizes a pixel to the nearest available tone, then spreads the remaining error to neighboring pixels. Floyd–Steinberg dithering is the classic example and often looks more organic than ordered matrices.",
                      })}
                    </p>
                    <ul className="mt-3 list-disc space-y-1 pl-5 text-[12px] text-gray-400">
                      <li>
                        {t("education.families.error.point1", {
                          defaultValue: "Great for photos and gradients; tends to hide banding well.",
                        })}
                      </li>
                      <li>
                        {t("education.families.error.point2", {
                          defaultValue: "Common artifacts: worms/streaks or directional noise (serpentine helps).",
                        })}
                      </li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="font-anton text-xl tracking-tight text-gray-100">
                  {t("education.basics.whenToUse.title", { defaultValue: "When to use which" })}
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-5">
                    <h3 className="text-[12px] tracking-wide text-gray-200">
                      <strong className="font-semibold">
                        {t("education.basics.whenToUse.ordered", { defaultValue: "Choose ordered dithering when…" })}
                      </strong>
                    </h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-gray-400">
                      <li>{t("education.basics.whenToUse.ordered1", { defaultValue: "You want a clean, repeatable dither pattern (pixel art / UI icons)." })}</li>
                      <li>{t("education.basics.whenToUse.ordered2", { defaultValue: "You need speed or deterministic results." })}</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-5">
                    <h3 className="text-[12px] tracking-wide text-gray-200">
                      <strong className="font-semibold">
                        {t("education.basics.whenToUse.error", { defaultValue: "Choose error diffusion when…" })}
                      </strong>
                    </h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-gray-400">
                      <li>{t("education.basics.whenToUse.error1", { defaultValue: "You’re dithering images or photos and want smoother gradients." })}</li>
                      <li>{t("education.basics.whenToUse.error2", { defaultValue: "You’re trying to hide banding after palette reduction." })}</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="font-anton text-xl tracking-tight text-gray-100">
                  {t("education.basics.history.title", { defaultValue: "A very short history" })}
                </h2>
                <p className="text-[12px] leading-relaxed text-gray-400">
                  {t("education.basics.history.body", {
                    defaultValue:
                      "Dithering shows up anywhere an image must be displayed or printed with fewer tones than it contains. Early computer displays and printers made it essential; today it’s also used as a deliberate artistic texture.",
                  })}
                </p>
                <p className="text-[12px] leading-relaxed text-gray-400">
                  {t("education.basics.history.body2", {
                    defaultValue:
                      "Modern tools let you choose between structured ordered patterns and more organic error diffusion—each with its own tradeoffs in speed, texture, and artifacts.",
                  })}
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="font-anton text-xl tracking-tight text-gray-100">
                  {t("education.basics.keyTerms.title", { defaultValue: "Key terms (quick glossary)" })}
                </h2>
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-5 text-[12px] leading-relaxed text-gray-400">
                  <ul className="list-disc space-y-2 pl-5">
                    <li>
                      <strong className="font-semibold text-gray-200">{t("education.basics.keyTerms.quantization", { defaultValue: "Quantization" })}</strong>
                      {t("education.basics.keyTerms.quantizationTail", { defaultValue: ": reducing the number of available tones or colors." })}
                    </li>
                    <li>
                      <strong className="font-semibold text-gray-200">{t("education.basics.keyTerms.threshold", { defaultValue: "Threshold" })}</strong>
                      {t("education.basics.keyTerms.thresholdTail", { defaultValue: ": a cut point used by many dithering algorithms to decide light/dark output." })}
                    </li>
                    <li>
                      <strong className="font-semibold text-gray-200">{t("education.basics.keyTerms.bayer", { defaultValue: "Bayer matrix" })}</strong>
                      {t("education.basics.keyTerms.bayerTail", { defaultValue: ": a repeating threshold matrix used for ordered dithering." })}
                    </li>
                    <li>
                      <strong className="font-semibold text-gray-200">{t("education.basics.keyTerms.palette", { defaultValue: "Palette" })}</strong>
                      {t("education.basics.keyTerms.paletteTail", { defaultValue: ": a fixed set of colors; color dithering approximates your image using only those colors." })}
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="font-anton text-xl tracking-tight text-gray-100">
                  {t("education.basics.sources.title", { defaultValue: "Sources & further reading" })}
                </h2>
                <ul className="list-disc space-y-1 pl-5 text-[12px] text-gray-400">
                  <li>
                    <a
                      className="text-blue-300 hover:text-blue-200"
                      href="https://en.wikipedia.org/wiki/Dither"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <strong className="font-semibold">{t("education.strong.wikipedia", { defaultValue: "Wikipedia" })}</strong>: Dither
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-blue-300 hover:text-blue-200"
                      href="https://en.wikipedia.org/wiki/Floyd%E2%80%93Steinberg_dithering"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <strong className="font-semibold">Floyd–Steinberg</strong>
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-blue-300 hover:text-blue-200"
                      href="https://en.wikipedia.org/wiki/Ordered_dithering"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <strong className="font-semibold">{t("education.strong.ordered", { defaultValue: "Ordered dithering" })}</strong>
                    </a>
                  </li>
                </ul>
              </section>
            </section>

            <div className="my-12 h-px w-full bg-gradient-to-r from-transparent via-neutral-800/70 to-transparent" />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link
                to={withLangPrefix("/Education", activeLang)}
                className="clean-btn px-4 py-2 text-[11px]"
              >
                {t("education.basics.ctaHome", { defaultValue: "Back to Education" })}
              </Link>
              <Link
                to={withLangPrefix("/Education/Practice", activeLang)}
                className="clean-btn clean-btn-primary px-4 py-2 text-[11px]"
              >
                {t("education.basics.ctaNext", { defaultValue: "Continue to Practice" })}
              </Link>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default EducationBasics;
