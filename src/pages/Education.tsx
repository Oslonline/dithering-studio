import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import Header from "../components/ui/Header";
import MediaComparison from "../components/ui/MediaComparison";
import SAMPLE_IMAGE_SRC from "../assets/base-sample.webp";
import { findAlgorithm, algorithms } from "../utils/algorithms";
import { generateHreflangTags, getCanonicalUrlWithLang, getOgUrl, getSocialImageUrl } from "../utils/seo";
import { normalizeLang, withLangPrefix } from "../utils/localePath";

const EDUCATION_PATH = "/Education";

const getRandomInt = (min: number, max: number) => {
  const mn = Math.ceil(min);
  const mx = Math.floor(max);
  return Math.floor(Math.random() * (mx - mn + 1)) + mn;
};

const pickRandomAlgorithmId = (): number => {
  // Avoid Custom Kernel: it can depend on user-provided kernel state.
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
    img.src = SAMPLE_IMAGE_SRC;
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
          <p className="text-[11px] font-medium tracking-wide text-gray-200">{t("education.preview.title", { defaultValue: "A quick example (random settings)" })}</p>
          <p className="font-mono text-[10px] text-gray-500">{t("education.preview.hint", { defaultValue: "Drag the slider" })}</p>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <div
            className="relative w-full overflow-hidden rounded-md border border-neutral-800 bg-neutral-950"
            style={previewDims ? { aspectRatio: `${previewDims.width} / ${previewDims.height}` } : undefined}
          >
            <canvas ref={canvasRef} className="pixelated relative z-0 block h-full w-full" aria-label={t("tool.ariaDitheredImagePreview")} />
            <div className="absolute inset-0 z-10 pointer-events-auto">
              <MediaComparison beforeImage={SAMPLE_IMAGE_SRC} />
            </div>
          </div>

          {!ready && !error && <p className="mt-2 text-center text-[10px] text-gray-500">{t("education.preview.loading", { defaultValue: "Generating preview…" })}</p>}
          {error && <p className="mt-2 text-center text-[10px] text-gray-500">{t("education.preview.fallback", { defaultValue: "Preview unavailable on this device." })}</p>}
        </div>
      </div>
    </div>
  );
};

const Education: React.FC = () => {
  const { t, i18n } = useTranslation();
  const activeLang = normalizeLang(i18n.language);

  const pageTitle = t("education.seo.title", {
    defaultValue: "What is Dithering? Ordered Dithering, Error Diffusion & Floyd–Steinberg",
  });
  const pageDescription = t("education.seo.description", {
    defaultValue: "Learn the dithering definition and the main methods (ordered dithering/Bayer matrix and error diffusion/Floyd–Steinberg). See when to use color dithering and try it online.",
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
        <meta property="og:url" content={getOgUrl(EDUCATION_PATH, i18n.language)} />
        <meta property="og:image" content={getSocialImageUrl()} />
        <meta property="og:locale" content={i18n.language} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={getSocialImageUrl()} />

        <link rel="canonical" href={getCanonicalUrlWithLang(EDUCATION_PATH, i18n.language)} />
        {generateHreflangTags(EDUCATION_PATH)}
      </Helmet>

      <div className="flex h-screen w-full flex-col overflow-hidden">
        <Header page="education" />

        <main id="main-content" className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-4xl px-6 py-10">
            <header className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 md:items-center">
                <div className="space-y-4">
                  <h1 className="font-anton text-3xl leading-tight text-gray-100">{t("education.title", { defaultValue: "Dithering Education" })}</h1>
                  <p className="text-[12px] leading-relaxed text-gray-400">
                    <strong className="font-semibold text-gray-200">{t("education.strong.dithering", { defaultValue: "Dithering" })}</strong>{" "}
                    {t("education.lead.tail", {
                      defaultValue: "is a way to simulate more tones and colors than a palette (or display) can show by intentionally adding a structured pattern or noise. It's used to reduce banding in gradients, create retro pixel art looks, and mimic print halftones.",
                    })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Link to={withLangPrefix("/Dithering/Image", activeLang)} className="clean-btn clean-btn-primary px-4 py-2 text-[11px]">
                      {t("education.cta.openTool", { defaultValue: "Open the tool" })}
                    </Link>
                  </div>
                </div>

                <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-2">
                  <img src="/education-hero.png" alt={t("education.heroImageAlt", { defaultValue: "Dithering education hero" })} className="block h-auto w-full rounded-md" loading="lazy" />
                </div>
              </div>
            </header>

            <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-neutral-800/70 to-transparent lg:my-14" />

            <section className="space-y-8 lg:space-y-12">
              <section className="space-y-3">
                <h2 className="font-anton text-xl tracking-tight text-gray-100">{t("education.onboarding.title", { defaultValue: "Start here (2 steps)" })}</h2>
                <p className="text-[12px] leading-relaxed text-gray-400">
                  {t("education.onboarding.body", {
                    defaultValue: "If you're new to dithering, follow this short path: learn the core ideas first, then apply them with a few practical recipes.",
                  })}
                </p>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-4">
                    <p className="font-mono text-[10px] text-gray-500">{t("education.onboarding.step1.kicker", { defaultValue: "Step 1" })}</p>
                    <h3 className="mt-1 text-[12px] font-medium tracking-wide text-gray-200">{t("education.cta.basics", { defaultValue: "Start with Basics" })}</h3>
                    <p className="mt-2 text-[12px] leading-relaxed text-gray-400">
                      {t("education.onboarding.step1.body", {
                        defaultValue: "Definition, ordered dithering (Bayer), and error diffusion (Floyd–Steinberg) — just enough to understand what changes when you swap algorithms.",
                      })}
                    </p>
                    <div className="mt-3">
                      <Link to={withLangPrefix("/Education/Basics", activeLang)} className="clean-btn clean-btn-primary px-4 py-2 text-[11px]">
                        {t("education.cta.basics", { defaultValue: "Start with Basics" })}
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-4">
                    <p className="font-mono text-[10px] text-gray-500">{t("education.onboarding.step2.kicker", { defaultValue: "Step 2" })}</p>
                    <h3 className="mt-1 text-[12px] font-medium tracking-wide text-gray-200">{t("education.cta.practice", { defaultValue: "Go to Practice" })}</h3>
                    <p className="mt-2 text-[12px] leading-relaxed text-gray-400">
                      {t("education.onboarding.step2.body", {
                        defaultValue: "A small set of recipes and knobs to get good results fast: threshold, serpentine, palettes, and common artifacts.",
                      })}
                    </p>
                    <div className="mt-3">
                      <Link to={withLangPrefix("/Education/Practice", activeLang)} className="clean-btn px-4 py-2 text-[11px]">
                        {t("education.cta.practice", { defaultValue: "Go to Practice" })}
                      </Link>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="font-anton text-xl tracking-tight text-gray-100">{t("education.whatIs.title", { defaultValue: "What is dithering? (Definition)" })}</h2>
                <p className="text-[12px] leading-relaxed text-gray-400">
                  <strong className="font-semibold text-gray-200">{t("education.strong.definition", { defaultValue: "Definition:" })}</strong>{" "}
                  {t("education.whatIs.body", {
                    defaultValue: "In computer graphics, dithering is a technique that approximates missing tones by distributing pixels from the available palette. Instead of a smooth gradient (which may not be possible after quantization), you get a controlled pattern that the eye blends into a perceived intermediate tone.",
                  })}
                </p>
                <ul className="list-disc space-y-1 pl-5 text-[12px] text-gray-400">
                  <li>{t("education.whatIs.point1", { defaultValue: "Reduces visible banding in gradients" })}</li>
                  <li>{t("education.whatIs.point2", { defaultValue: "Makes limited palettes look richer (color dithering)" })}</li>
                  <li>{t("education.whatIs.point3", { defaultValue: "Creates a deliberate retro / pixel art texture" })}</li>
                </ul>
              </section>

              <section className="space-y-4">
                <RandomDitherPreview />
                <div className="flex flex-wrap gap-2">
                  <Link to={withLangPrefix("/Education/Algorithms", activeLang)} className="clean-btn px-4 py-2 text-[11px]">
                    {t("education.cta.exploreAlgorithms", { defaultValue: "Explore algorithms" })}
                  </Link>
                  <Link to={withLangPrefix("/Dithering/Video", activeLang)} className="clean-btn px-4 py-2 text-[11px]">
                    {t("education.cta.tryVideo", { defaultValue: "Try it on a video" })}
                  </Link>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="font-anton text-xl tracking-tight text-gray-100">{t("education.families.title", { defaultValue: "The two main families" })}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-4">
                    <h3 className="text-[12px] font-medium tracking-wide text-gray-200">
                      <strong className="font-semibold">{t("education.families.ordered.title", { defaultValue: "Ordered dithering (Bayer matrix)" })}</strong>
                    </h3>
                    <p className="mt-2 text-[12px] leading-relaxed text-gray-400">
                      {t("education.families.ordered.body", {
                        defaultValue: "Ordered dithering compares each pixel’s brightness to a repeating threshold matrix. It's extremely fast and predictable, and its “patterned” look is often desirable for pixel art and stylized graphics.",
                      })}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link to={`${withLangPrefix("/Education/Algorithms", activeLang)}?algo=2`} className="clean-btn px-3 py-1.5 text-[11px]">
                        {t("education.families.ordered.cta", { defaultValue: "See Bayer 4×4" })}
                      </Link>
                      <Link to={withLangPrefix("/Dithering/Image", activeLang)} className="clean-btn px-3 py-1.5 text-[11px]">
                        {t("education.families.tryInTool", { defaultValue: "Try in tool" })}
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-4">
                    <h3 className="text-[12px] font-medium tracking-wide text-gray-200">
                      <strong className="font-semibold">{t("education.families.error.title", { defaultValue: "Error diffusion (Floyd–Steinberg)" })}</strong>
                    </h3>
                    <p className="mt-2 text-[12px] leading-relaxed text-gray-400">
                      {t("education.families.error.body", {
                        defaultValue: "Error diffusion quantizes a pixel to the nearest available tone, then spreads the quantization error to neighboring pixels. This usually produces more “natural” textures and smoother gradients than ordered dithering.",
                      })}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link to={`${withLangPrefix("/Education/Algorithms", activeLang)}?algo=1`} className="clean-btn px-3 py-1.5 text-[11px]">
                        {t("education.families.error.cta", { defaultValue: "See Floyd–Steinberg" })}
                      </Link>
                      <Link to={withLangPrefix("/Dithering/Image", activeLang)} className="clean-btn px-3 py-1.5 text-[11px]">
                        {t("education.families.tryInTool", { defaultValue: "Try in tool" })}
                      </Link>
                    </div>
                  </div>
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="font-anton text-xl tracking-tight text-gray-100">{t("education.color.title", { defaultValue: "Color dithering vs grayscale" })}</h2>
                <p className="text-[12px] leading-relaxed text-gray-400">
                  {t("education.color.body", {
                    defaultValue: "Grayscale dithering approximates tones using black/white (or a few gray levels). Color dithering does the same, but with a limited set of colors. The palette you choose strongly affects the look—try a small palette for a retro 8‑bit feel, or a larger palette for smoother color ramps.",
                  })}
                </p>
              </section>

              <section className="space-y-3">
                <h2 className="font-anton text-xl tracking-tight text-gray-100">{t("education.when.title", { defaultValue: "When to use dithering" })}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-4">
                    <h3 className="text-[12px] font-medium tracking-wide text-gray-200">{t("education.when.good.title", { defaultValue: "Great for" })}</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-gray-400">
                      <li>{t("education.when.good.1", { defaultValue: "Gradients and skies (reduce banding)" })}</li>
                      <li>{t("education.when.good.2", { defaultValue: "Pixel art, retro/CRT aesthetics" })}</li>
                      <li>{t("education.when.good.3", { defaultValue: "Print-like halftone and stipple styles" })}</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-4">
                    <h3 className="text-[12px] font-medium tracking-wide text-gray-200">{t("education.when.avoid.title", { defaultValue: "Avoid when" })}</h3>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-[12px] text-gray-400">
                      <li>{t("education.when.avoid.1", { defaultValue: "You need perfectly smooth tonal transitions" })}</li>
                      <li>{t("education.when.avoid.2", { defaultValue: "Fine text should remain razor sharp" })}</li>
                      <li>{t("education.when.avoid.3", { defaultValue: "Noise or patterns would be distracting" })}</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="font-anton text-xl tracking-tight text-gray-100">{t("education.faq.title", { defaultValue: "FAQ" })}</h2>
                <div className="space-y-4">
                  <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-4">
                    <h3 className="text-[12px] font-medium tracking-wide text-gray-200">{t("education.faq.q1", { defaultValue: "Ordered dithering vs error diffusion: what’s the difference?" })}</h3>
                    <p className="mt-2 text-[12px] leading-relaxed text-gray-400">
                      {t("education.faq.a1", {
                        defaultValue: "Ordered dithering uses a repeating threshold matrix (fast, patterned, deterministic). Error diffusion propagates quantization error to neighbors (often smoother gradients, more organic noise). Both are valid—choose based on the texture you want.",
                      })}
                    </p>
                  </div>
                  <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-4">
                    <h3 className="text-[12px] font-medium tracking-wide text-gray-200">{t("education.faq.q2", { defaultValue: "What is Floyd–Steinberg dithering?" })}</h3>
                    <p className="mt-2 text-[12px] leading-relaxed text-gray-400">
                      {t("education.faq.a2", {
                        defaultValue: "Floyd–Steinberg is a classic error diffusion algorithm that spreads quantization error to nearby pixels with fixed weights. It’s a strong default when you want smooth-looking gradients and a fine-grain texture.",
                      })}
                    </p>
                  </div>
                  <div className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-4">
                    <h3 className="text-[12px] font-medium tracking-wide text-gray-200">{t("education.faq.q3", { defaultValue: "What is a Bayer matrix?" })}</h3>
                    <p className="mt-2 text-[12px] leading-relaxed text-gray-400">
                      {t("education.faq.a3", {
                        defaultValue: "A Bayer matrix is a small ordered threshold pattern (like 4×4 or 8×8) used for ordered dithering. It creates a repeating structure that approximates intermediate tones with a recognizable, pixel-friendly texture.",
                      })}
                    </p>
                  </div>
                </div>
              </section>
            </section>

            <div className="my-10 h-px w-full bg-gradient-to-r from-transparent via-neutral-800/70 to-transparent" />

            <section className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-5">
              <h2 className="font-anton text-xl tracking-tight text-gray-100">{t("education.next.title", { defaultValue: "Next: try the techniques" })}</h2>
              <p className="mt-2 text-[12px] leading-relaxed text-gray-400">
                <strong className="font-semibold text-gray-200">{t("education.strong.tip", { defaultValue: "Tip:" })}</strong>{" "}
                {t("education.next.body", {
                  defaultValue: "Pick an image with gradients or skin tones and compare Bayer vs Floyd–Steinberg. Then try a limited palette to see color dithering in action.",
                })}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link to={withLangPrefix("/Dithering/Image", activeLang)} className="clean-btn clean-btn-primary px-4 py-2 text-[11px]">
                  {t("education.next.cta1", { defaultValue: "Open the tool" })}
                </Link>
                <Link to={withLangPrefix("/Education/Algorithms", activeLang)} className="clean-btn px-4 py-2 text-[11px]">
                  {t("education.next.cta2", { defaultValue: "Browse algorithm details" })}
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
};

export default Education;
