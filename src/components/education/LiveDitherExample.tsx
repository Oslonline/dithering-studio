"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import MediaComparison from "../ui/MediaComparison";
import SAMPLE_IMAGE_SRC from "../../assets/base-sample.webp";
import { findAlgorithm, algorithms } from "../../utils/algorithms";

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

export default function LiveDitherExample() {
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
    <figure className="rounded-lg border border-neutral-800 bg-neutral-900/20 p-4">
      <figcaption className="mb-3 flex items-center justify-between gap-3">
        <span className="text-[11px] font-medium tracking-wide text-gray-200">
          {t("education.preview.title", { defaultValue: "Live example" })}
        </span>
        <span className="font-mono text-[10px] text-gray-500">
          {t("education.preview.hint", { defaultValue: "Drag the slider" })}
        </span>
      </figcaption>
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
    </figure>
  );
}
