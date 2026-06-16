"use client";

import { useTranslation } from "react-i18next";
import { Link } from "../../lib/nextRouterCompat";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

const IMAGE_PIXELS: ReadonlyArray<readonly [number, number]> = [
  [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1],
  [0, 2], [10, 2],
  [0, 3], [2, 3], [3, 3], [4, 3], [6, 3], [7, 3], [10, 3],
  [0, 4], [5, 4], [10, 4],
  [0, 5], [2, 5], [3, 5], [4, 5], [6, 5], [7, 5], [10, 5],
  [0, 6], [10, 6],
  [1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7],
];

const FRAME_A: ReadonlyArray<readonly [number, number]> = [
  [1, 1], [2, 1], [3, 1], [1, 2], [3, 2], [1, 3], [2, 3], [3, 3],
];
const FRAME_B: ReadonlyArray<readonly [number, number]> = [
  [6, 1], [7, 1], [8, 1], [6, 2], [8, 2], [6, 3], [7, 3], [8, 3],
];
const FRAME_C: ReadonlyArray<readonly [number, number]> = [
  [11, 1], [12, 1], [13, 1], [11, 2], [13, 2], [11, 3], [12, 3], [13, 3],
];

function PixelSvg({
  pixels,
  viewBox,
  className = "h-10 w-10 text-gray-500",
}: {
  pixels: ReadonlyArray<readonly [number, number]>;
  viewBox: string;
  className?: string;
}) {
  return (
    <svg className={className} viewBox={viewBox} fill="currentColor" shapeRendering="crispEdges" aria-hidden="true">
      {pixels.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} />
      ))}
    </svg>
  );
}

export default function MediaProcessingShowcase() {
  const { t, i18n } = useTranslation();
  const lang = normalizeLang(i18n.language);

  const panels = [
    {
      key: "image",
      label: t("mediaProcessing.image.label", { defaultValue: "Image" }),
      title: t("mediaProcessing.image.title", { defaultValue: "Per-pixel dithering" }),
      body: t("mediaProcessing.image.body", {
        defaultValue:
          "Load PNG, JPEG, or WebP and preview every algorithm instantly. Tune threshold, palettes, and scale — then export without uploading.",
      }),
      formats: t("mediaProcessing.image.formats", { defaultValue: "PNG · JPEG · WEBP · SVG" }),
      cta: t("mediaProcessing.image.cta", { defaultValue: "Open image tool" }),
      href: withLangPrefix("/Dithering/Image", lang),
      visual: <PixelSvg pixels={IMAGE_PIXELS} viewBox="0 0 11 9" className="h-9 w-11 text-blue-400/70" />,
    },
    {
      key: "video",
      label: t("mediaProcessing.video.label", { defaultValue: "Video" }),
      title: t("mediaProcessing.video.title", { defaultValue: "Frame-by-frame in-browser" }),
      body: t("mediaProcessing.video.body", {
        defaultValue:
          "Drop MP4 or WebM and dither each frame locally. Build retro 8-bit, vaporwave, or pixel-loop animations — nothing leaves your device.",
      }),
      formats: t("mediaProcessing.video.formats", { defaultValue: "MP4 · WebM · GIF" }),
      cta: t("mediaProcessing.video.cta", { defaultValue: "Open video tool" }),
      href: withLangPrefix("/Dithering/Video", lang),
      visual: (
        <svg className="h-9 w-14 text-blue-400/70" viewBox="0 0 15 5" fill="currentColor" shapeRendering="crispEdges" aria-hidden="true">
          {[FRAME_A, FRAME_B, FRAME_C].flatMap((frame, fi) =>
            frame.map(([x, y]) => <rect key={`${fi}-${x}-${y}`} x={x} y={y} width={1} height={1} />)
          )}
          <rect x={4.5} y={2} width={1} height={1} className="text-gray-600" fill="currentColor" opacity={0.5} />
          <rect x={9.5} y={2} width={1} height={1} className="text-gray-600" fill="currentColor" opacity={0.5} />
        </svg>
      ),
    },
  ];

  return (
    <section className="w-full max-w-6xl" aria-labelledby="media-processing-heading">
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 md:flex-row md:items-end md:justify-between md:gap-10">
        <h2 id="media-processing-heading" className="font-anton max-w-lg text-xl tracking-tight sm:text-2xl lg:text-[1.65rem]">
          {t("mediaProcessing.title", {
            defaultValue: "Image & video — processed entirely in your browser",
          })}
        </h2>
        <p className="max-w-md text-[11px] leading-relaxed text-gray-500 sm:text-[12px] md:text-right md:text-[13px]">
          {t("mediaProcessing.subtitle", {
            defaultValue: "Same algorithms, same privacy model. Pick the workflow that matches your media.",
          })}
        </p>
      </div>

      <div className="grid overflow-hidden rounded-lg border border-neutral-800 md:grid-cols-2">
        {panels.map((panel, index) => (
          <article
            key={panel.key}
            className={`flex flex-col bg-neutral-950 p-6 sm:p-8 ${index === 0 ? "border-b border-neutral-800 md:border-r md:border-b-0" : ""}`}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <span className="font-mono text-[10px] tracking-[0.2em] text-gray-500 uppercase">
                0{index + 1} · {panel.label}
              </span>
              {panel.visual}
            </div>
            <h3 className="text-[13px] font-medium tracking-wide text-gray-100 sm:text-[14px]">{panel.title}</h3>
            <p className="mt-3 max-w-md text-[11px] leading-relaxed text-gray-500 sm:text-[12px]">{panel.body}</p>
            <p className="mt-4 font-mono text-[10px] tracking-wide text-gray-600">{panel.formats}</p>
            <div className="mt-6 pt-2">
              <Link
                to={panel.href}
                className={`clean-btn text-[11px] ${index === 0 ? "clean-btn-primary px-5 py-2" : "px-5 py-2"}`}
              >
                {panel.cta}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
