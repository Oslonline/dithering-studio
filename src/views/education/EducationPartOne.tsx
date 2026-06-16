"use client";

import { useTranslation } from "react-i18next";
import { Link } from "../../lib/nextRouterCompat";
import GuideSection from "../../components/education/GuideSection";
import VisualRamblingCard from "../../components/education/VisualRamblingCard";
import LiveDitherExample from "../../components/education/LiveDitherExample";
import EducationArticleShell, { EducationHubLink } from "../../components/education/EducationArticleShell";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

export default function EducationPartOne() {
  const { t, i18n } = useTranslation();
  const lang = normalizeLang(i18n.language);

  const blocks = [
    {
      title: t("education.guide.part1.blocks.charm.title", { defaultValue: "More shades than you actually have" }),
      paragraphs: [
        t("education.guide.part1.blocks.charm.p1", {
          defaultValue:
            "Dithering is the trick of simulating extra gray levels (or colors) using only a small set of outputs. Up close you see individual dots or pixels; step back and your eye blends them into smooth tones.",
        }),
        t("education.guide.part1.blocks.charm.p2", {
          defaultValue:
            "That is why retro game screens, newspaper print, and lo-fi art all feel related: they make the most of a limited palette by placing light and dark elements deliberately.",
        }),
      ],
    },
    {
      title: t("education.guide.part1.blocks.threshold.title", { defaultValue: "Why a plain threshold looks harsh" }),
      paragraphs: [
        t("education.guide.part1.blocks.threshold.p1", {
          defaultValue:
            "Suppose a display can only show pure black or pure white. The naive approach is to compare each pixel to a single cutoff: darker than middle gray becomes black, lighter becomes white.",
        }),
        t("education.guide.part1.blocks.threshold.p2", {
          defaultValue:
            "That preserves sharp edges but destroys subtle shadows and highlights. Large areas collapse to flat black or flat white, and gradients turn into ugly stair-steps.",
        }),
      ],
    },
    {
      title: t("education.guide.part1.blocks.pattern.title", { defaultValue: "Patterns instead of flat fills" }),
      paragraphs: [
        t("education.guide.part1.blocks.pattern.p1", {
          defaultValue:
            "Dithering fixes this by nudging some pixels toward the opposite color. A light gray pixel might still become a black dot, but only where the pattern needs more density. Dark areas get more black dots; bright areas get more white ones.",
        }),
        t("education.guide.part1.blocks.pattern.p2", {
          defaultValue:
            "The average density in each region mimics the original brightness — that is the whole illusion. Drag the slider on the live preview below to see a random algorithm turn a photo into a field of dots while keeping the overall image readable.",
        }),
      ],
    },
  ];

  return (
    <EducationArticleShell>
      <GuideSection
        kicker={t("education.guide.part1.kicker", { defaultValue: "Part 1" })}
        title={t("education.guide.part1.title", { defaultValue: "What dithering does" })}
        lead={t("education.guide.part1.lead", {
          defaultValue:
            "The same story as Damar’s visual essay on dithering, told here in plain text so you can read and experiment side by side.",
        })}
        blocks={blocks}
      >
        <LiveDitherExample />
        <VisualRamblingCard part={1} href="https://visualrambling.space/dithering-part-1/" />
      </GuideSection>

      <nav className="mt-12 flex flex-col gap-4 border-t border-neutral-800/80 pt-8 sm:flex-row sm:items-center sm:justify-between">
        <EducationHubLink />
        <Link
          to={withLangPrefix("/Education/Part-2", lang)}
          className="clean-btn clean-btn-primary justify-center px-5 py-2.5 text-[11px]"
        >
          {t("education.guide.part1.nextCta", { defaultValue: "Continue to Part 2 →" })}
        </Link>
      </nav>
    </EducationArticleShell>
  );
}
