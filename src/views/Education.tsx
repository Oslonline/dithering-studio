"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "../lib/nextRouterCompat";
import Header from "../components/ui/Header";
import MediaComparison from "../components/ui/MediaComparison";
import EducationHero from "../components/marketing/EducationHero";
import AudiencePaths from "../components/marketing/AudiencePaths";
import PatternComparison from "../components/marketing/PatternComparison";
import ExternalReads from "../components/marketing/ExternalReads";
import SAMPLE_IMAGE_SRC from "../assets/base-sample.webp";
import { findAlgorithm, algorithms } from "../utils/algorithms";
import { normalizeLang, withLangPrefix } from "../utils/localePath";

const getRandomInt = (min: number, max: number) => {
  const mn = Math.ceil(min);
  const mx = Math.floor(max);
  return Math.floor(Math.random() * (mx - mn + 1)) + mn;
};

const pickRandomAlgorithmId = (): number => {
  const candidates = algorithms.filter((a) => a.id !== 26);
  const idx = Math.floor(Math.random() * Math.max(1, candidates.length));
  return candidates[idx]?.id ?? 1;
};

const RandomDitherPreview: React.FC = () => {
  const { t } = useTranslation();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewDims, setPreviewDims] = useState<{ width: number; height: number } | null>(null);

  const settings = useMemo(() => {
    const pattern = pickRandomAlgorithmId();
    const meta = findAlgorithm(pattern);
    const supportsSerp = meta?.supportsSerpentine ?? true;
    return {
      pattern,
      threshold: getRandomInt(72, 184),
      serpentine: supportsSerp ? Math.random() > 0.35 : false,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setError(null);
    setPreviewDims(null);

    const img = new Image();
    img.src = SAMPLE_IMAGE_SRC.src;
    img.onload = () => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;

      const targetW = 420;
      const aspect = img.height / img.width || 1;
      const width = Math.max(1, Math.round(Math.min(targetW, img.width)));
      const height = Math.max(1, Math.round(width * aspect));

      setPreviewDims({ width, height });

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) {
        setError("canvas");
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const src = ctx.getImageData(0, 0, width, height);

      try {
        const algo = findAlgorithm(settings.pattern);
        if (!algo) {
          setReady(true);
          return;
        }

        const srcData = new Uint8ClampedArray(src.data);
        const res = algo.run({
          srcData,
          width,
          height,
          params: {
            pattern: settings.pattern,
            threshold: settings.threshold,
            invert: false,
            serpentine: settings.serpentine,
            serpentinePattern: "standard",
            errorDiffusionStrength: 100,
            isErrorDiffusion: algo.category === "Error Diffusion",
            asciiRamp: "@%#*+=-:. ",
          } as any,
        });

        const out = res instanceof ImageData ? res : new ImageData(width, height);
        if (!(res instanceof ImageData)) out.data.set(res);
        ctx.putImageData(out, 0, 0);
        setReady(true);
      } catch (e: any) {
        console.error("[Education] preview dither failed", e);
        setError(e?.message || "dither");
      }
    };
    img.onerror = () => {
      if (!cancelled) setError("load");
    };

    return () => {
      cancelled = true;
    };
  }, [settings.pattern, settings.threshold, settings.serpentine]);

  return (
    <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] font-medium tracking-wide text-gray-200">{t("education.preview.title")}</p>
          <p className="font-mono text-[10px] text-gray-500">{t("education.preview.hint")}</p>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <div
            className="relative w-full overflow-hidden rounded-md border border-neutral-800 bg-neutral-950"
            style={previewDims ? { aspectRatio: `${previewDims.width} / ${previewDims.height}` } : undefined}
          >
            <canvas ref={canvasRef} className="pixelated relative z-0 block h-full w-full" aria-label={t("tool.ariaDitheredImagePreview")} />
            <div className="pointer-events-auto absolute inset-0 z-10">
              <MediaComparison beforeImage={SAMPLE_IMAGE_SRC.src} />
            </div>
          </div>

          {!ready && !error && (
            <p className="mt-2 text-center text-[10px] text-gray-500">{t("education.preview.loading")}</p>
          )}
          {error && <p className="mt-2 text-center text-[10px] text-gray-500">{t("education.preview.fallback")}</p>}
        </div>
      </div>
    </div>
  );
};

const Education: React.FC = () => {
  const { t, i18n } = useTranslation();
  const activeLang = normalizeLang(i18n.language);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <Header activeNav="education" />

      <main id="main-content" className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-6 py-10">
          <EducationHero />

          <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-neutral-800/70 to-transparent lg:my-14" />

          <AudiencePaths />

          <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-neutral-800/70 to-transparent lg:my-14" />

          <section className="space-y-8 lg:space-y-10">
            <div className="space-y-2">
              <h2 className="font-anton text-xl tracking-tight text-gray-100">
                {t("education.visual.title", { defaultValue: "See it, don’t just read it" })}
              </h2>
              <p className="text-[12px] leading-relaxed text-gray-400">
                {t("education.visual.subtitle", {
                  defaultValue: "Compare before/after on sample media, then contrast ordered vs error-diffusion textures.",
                })}
              </p>
            </div>

            <div className="space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-wide text-gray-500">
                {t("education.visual.beforeAfter", { defaultValue: "Before / after (live preview)" })}
              </p>
              <RandomDitherPreview />
              <div className="flex flex-wrap gap-2">
                <Link to={withLangPrefix("/Education/Algorithms", activeLang)} className="clean-btn px-4 py-2 text-[11px]">
                  {t("education.cta.exploreAlgorithms")}
                </Link>
                <Link to={withLangPrefix("/Dithering/Video", activeLang)} className="clean-btn px-4 py-2 text-[11px]">
                  {t("education.cta.tryVideo")}
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <p className="font-mono text-[10px] uppercase tracking-wide text-gray-500">
                {t("education.visual.patterns", { defaultValue: "Pattern comparison" })}
              </p>
              <PatternComparison />
            </div>
          </section>

          <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-neutral-800/70 to-transparent lg:my-14" />

          <section className="space-y-8 lg:space-y-12">
            <section className="space-y-3">
              <h2 className="font-anton text-xl tracking-tight text-gray-100">{t("education.whatIs.title")}</h2>
              <p className="text-[12px] leading-relaxed text-gray-400">
                <strong className="font-semibold text-gray-200">{t("education.strong.definition")}</strong>{" "}
                {t("education.whatIs.body")}
              </p>
              <ul className="list-disc space-y-1 pl-5 text-[12px] text-gray-400">
                <li>{t("education.whatIs.point1")}</li>
                <li>{t("education.whatIs.point2")}</li>
                <li>{t("education.whatIs.point3")}</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-anton text-xl tracking-tight text-gray-100">{t("education.families.title")}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-4">
                  <h3 className="text-[12px] font-medium tracking-wide text-gray-200">
                    <strong className="font-semibold">{t("education.families.ordered.title")}</strong>
                  </h3>
                  <p className="mt-2 text-[12px] leading-relaxed text-gray-400">{t("education.families.ordered.body")}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link to={`${withLangPrefix("/Education/Algorithms", activeLang)}?algo=2`} className="clean-btn px-3 py-1.5 text-[11px]">
                      {t("education.families.ordered.cta")}
                    </Link>
                    <Link to={withLangPrefix("/Dithering/Image", activeLang)} className="clean-btn px-3 py-1.5 text-[11px]">
                      {t("education.families.tryInTool")}
                    </Link>
                  </div>
                </div>

                <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-4">
                  <h3 className="text-[12px] font-medium tracking-wide text-gray-200">
                    <strong className="font-semibold">{t("education.families.error.title")}</strong>
                  </h3>
                  <p className="mt-2 text-[12px] leading-relaxed text-gray-400">{t("education.families.error.body")}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link to={`${withLangPrefix("/Education/Algorithms", activeLang)}?algo=1`} className="clean-btn px-3 py-1.5 text-[11px]">
                      {t("education.families.error.cta")}
                    </Link>
                    <Link to={withLangPrefix("/Dithering/Image", activeLang)} className="clean-btn px-3 py-1.5 text-[11px]">
                      {t("education.families.tryInTool")}
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="font-anton text-xl tracking-tight text-gray-100">{t("education.color.title")}</h2>
              <p className="text-[12px] leading-relaxed text-gray-400">{t("education.color.body")}</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-anton text-xl tracking-tight text-gray-100">{t("education.when.title")}</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-4">
                  <h3 className="text-[12px] font-medium tracking-wide text-gray-200">{t("education.when.good.title")}</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-gray-400">
                    <li>{t("education.when.good.1")}</li>
                    <li>{t("education.when.good.2")}</li>
                    <li>{t("education.when.good.3")}</li>
                  </ul>
                </div>
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-4">
                  <h3 className="text-[12px] font-medium tracking-wide text-gray-200">{t("education.when.avoid.title")}</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-gray-400">
                    <li>{t("education.when.avoid.1")}</li>
                    <li>{t("education.when.avoid.2")}</li>
                    <li>{t("education.when.avoid.3")}</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h2 className="font-anton text-xl tracking-tight text-gray-100">{t("education.faq.title")}</h2>
              <div className="space-y-4">
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-4">
                  <h3 className="text-[12px] font-medium tracking-wide text-gray-200">{t("education.faq.q1")}</h3>
                  <p className="mt-2 text-[12px] leading-relaxed text-gray-400">{t("education.faq.a1")}</p>
                </div>
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-4">
                  <h3 className="text-[12px] font-medium tracking-wide text-gray-200">{t("education.faq.q2")}</h3>
                  <p className="mt-2 text-[12px] leading-relaxed text-gray-400">{t("education.faq.a2")}</p>
                </div>
                <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-4">
                  <h3 className="text-[12px] font-medium tracking-wide text-gray-200">{t("education.faq.q3")}</h3>
                  <p className="mt-2 text-[12px] leading-relaxed text-gray-400">{t("education.faq.a3")}</p>
                </div>
              </div>
            </section>
          </section>

          <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-neutral-800/70 to-transparent lg:my-14" />

          <ExternalReads />

          <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-neutral-800/70 to-transparent" />

          <section className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-5">
            <h2 className="font-anton text-xl tracking-tight text-gray-100">{t("education.next.title")}</h2>
            <p className="mt-2 text-[12px] leading-relaxed text-gray-400">
              <strong className="font-semibold text-gray-200">{t("education.strong.tip")}</strong> {t("education.next.body")}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to={withLangPrefix("/Education/Basics", activeLang)} className="clean-btn clean-btn-primary px-4 py-2 text-[11px]">
                {t("education.cta.basics")}
              </Link>
              <Link to={withLangPrefix("/Education/Practice", activeLang)} className="clean-btn px-4 py-2 text-[11px]">
                {t("education.cta.practice")}
              </Link>
              <Link to={withLangPrefix("/Dithering/Image", activeLang)} className="clean-btn px-4 py-2 text-[11px]">
                {t("education.cta.openTool")}
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Education;
