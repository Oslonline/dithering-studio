"use client";

import { useTranslation } from "react-i18next";
import { Link } from "../../lib/nextRouterCompat";
import GuideSection from "../../components/education/GuideSection";
import VisualRamblingCard from "../../components/education/VisualRamblingCard";
import BayerMatrixDemo from "../../components/education/BayerMatrixDemo";
import PatternComparison from "../../components/marketing/PatternComparison";
import EducationArticleShell from "../../components/education/EducationArticleShell";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

export default function EducationPartTwo() {
  const { t, i18n } = useTranslation();
  const lang = normalizeLang(i18n.language);

  const blocks = [
    {
      title: t("education.guide.part2.blocks.quantize.title", { defaultValue: "Quantization: fewer colors on purpose" }),
      paragraphs: [
        t("education.guide.part2.blocks.quantize.p1", {
          defaultValue:
            "Ordered dithering starts with quantization — mapping many gray levels down to just black and white. One global threshold splits the image in half; multiple thresholds at once produce mixed black and white in a single tone region.",
        }),
      ],
    },
    {
      title: t("education.guide.part2.blocks.map.title", { defaultValue: "Threshold maps tile across the image" }),
      paragraphs: [
        t("education.guide.part2.blocks.map.p1", {
          defaultValue:
            "A threshold map is a small grid of values from dark to light. For each pixel you compare its brightness to the value in the matching cell. Brighter than the threshold → white; otherwise → black.",
        }),
        t("education.guide.part2.blocks.map.p2", {
          defaultValue:
            "Repeat that grid across the whole image and you get a dithered result. But if the map is a simple row of thresholds, the output shows ugly stripes — the pattern layout matters as much as the numbers.",
        }),
      ],
    },
    {
      title: t("education.guide.part2.blocks.bayer.title", { defaultValue: "Bayer matrices break up the stripes" }),
      paragraphs: [
        t("education.guide.part2.blocks.bayer.p1", {
          defaultValue:
            "The classic Bayer arrangement scatters thresholds in a cross-hatch order. A 2×2 map gives four distinct patterns; 4×4 gives sixteen, so transitions between shadows and highlights look smoother.",
        }),
        t("education.guide.part2.blocks.bayer.p2", {
          defaultValue:
            "Larger Bayer sizes (8×8, 16×16…) add even more pattern variants. The look stays crisp and grid-like — perfect for pixel art and UI — but never perfectly photo-smooth.",
        }),
      ],
    },
    {
      title: t("education.guide.part2.blocks.beyond.title", { defaultValue: "Other maps, other textures" }),
      paragraphs: [
        t("education.guide.part2.blocks.beyond.p1", {
          defaultValue:
            "Cluster-dot matrices lean toward round blobs (think newsprint). Void-and-cluster / blue-noise maps spread points more evenly for a finer, less grid-like grain. Same idea — vary density to fake gray — different character.",
        }),
        t("education.guide.part2.blocks.beyond.p2", {
          defaultValue:
            "Error diffusion (Floyd–Steinberg and friends) skips the repeating map entirely and spreads rounding error to neighbors. That family is covered in our algorithm reference when you want implementation detail.",
        }),
      ],
    },
  ];

  return (
    <EducationArticleShell>
      <GuideSection
        kicker={t("education.guide.part2.kicker", { defaultValue: "Part 2" })}
        title={t("education.guide.part2.title", { defaultValue: "Ordered dithering & threshold maps" })}
        lead={t("education.guide.part2.lead", {
          defaultValue:
            "How repeating threshold grids create Bayer cross-hatches, why tile size matters, and where error diffusion fits in.",
        })}
        blocks={blocks}
      >
        <BayerMatrixDemo />
        <div className="space-y-3">
          <h2 className="text-[13px] font-medium tracking-wide text-gray-200 sm:text-[14px]">
            {t("education.guide.part2.compare.title", { defaultValue: "Ordered vs error diffusion" })}
          </h2>
          <p className="max-w-2xl text-[12px] leading-relaxed text-gray-400 sm:text-[13px]">
            {t("education.guide.part2.compare.body", {
              defaultValue:
                "Ordered methods repeat a matrix; error diffusion propagates mistakes outward. Neither is “better” — they suit different aesthetics.",
            })}
          </p>
          <PatternComparison minimal />
        </div>
        <VisualRamblingCard part={2} href="https://visualrambling.space/dithering-part-2/" />
      </GuideSection>

      <section className="mt-10 space-y-4 border-t border-neutral-800/80 pt-8">
        <h2 className="font-anton text-xl tracking-tight text-gray-100 sm:text-2xl">
          {t("education.guide.continue.title", { defaultValue: "Go deeper in the tool" })}
        </h2>
        <p className="max-w-2xl text-[12px] leading-relaxed text-gray-400 sm:text-[13px]">
          {t("education.guide.continue.body", {
            defaultValue:
              "Load any image or video clip, pick an algorithm, and export. When you need kernels, complexity notes, or per-algorithm history, use the reference explorer.",
          })}
        </p>
        <p className="text-[12px]">
          <Link
            to={withLangPrefix("/Education/Algorithms", lang)}
            className="text-gray-300 underline decoration-gray-600 underline-offset-4 hover:text-white"
          >
            {t("education.guide.continue.algorithms", { defaultValue: "Algorithm reference" })}
          </Link>
        </p>
      </section>

      <nav className="mt-8 flex flex-col gap-4 border-t border-neutral-800/80 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <Link
          to={withLangPrefix("/Education/Part-1", lang)}
          className="text-[11px] text-gray-500 underline decoration-gray-700 underline-offset-4 hover:text-gray-300"
        >
          {t("education.guide.part2.prevLink", { defaultValue: "← Part 1" })}
        </Link>
        <Link
          to={withLangPrefix("/Dithering/Image", lang)}
          className="clean-btn clean-btn-primary justify-center px-5 py-2.5 text-[11px]"
        >
          {t("education.guide.part2.toolCta", { defaultValue: "Open the tool" })}
        </Link>
      </nav>
    </EducationArticleShell>
  );
}
