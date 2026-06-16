"use client";

import { useTranslation } from "react-i18next";
import { Link } from "../../lib/nextRouterCompat";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

interface LearningPathPreviewProps {
  showHubLink?: boolean;
}

export default function LearningPathPreview({ showHubLink = true }: LearningPathPreviewProps) {
  const { t, i18n } = useTranslation();
  const lang = normalizeLang(i18n.language);
  const education = withLangPrefix("/Education", lang);

  const paths = [
    {
      title: t("home.learn.part1.title", { defaultValue: "Part 1 — Foundations" }),
      body: t("home.learn.part1.body", {
        defaultValue: "What dithering does, why flat thresholds fail, and how dot density fakes gray.",
      }),
      href: withLangPrefix("/Education/Part-1", lang),
    },
    {
      title: t("home.learn.part2.title", { defaultValue: "Part 2 — Ordered dithering" }),
      body: t("home.learn.part2.body", {
        defaultValue: "Threshold maps, Bayer matrices, and how pattern layout changes the look.",
      }),
      href: withLangPrefix("/Education/Part-2", lang),
    },
    {
      title: t("home.learn.reference.title", { defaultValue: "Algorithm reference" }),
      body: t("home.learn.reference.body", {
        defaultValue: "Per-algorithm notes, kernels, and deep links into the tool.",
      }),
      href: withLangPrefix("/Education/Algorithms", lang),
    },
  ];

  return (
    <section className="w-full max-w-5xl space-y-8">
      <div className="space-y-2 text-center">
        <h2 className="font-anton text-xl tracking-tight sm:text-2xl">{t("home.learn.title")}</h2>
        <p className="mx-auto max-w-2xl text-[11px] leading-relaxed text-gray-500 sm:text-[12px] md:text-[13px]">
          {t("home.learn.subtitle", {
            defaultValue: "Read the two-part guide, then explore algorithms or jump straight into the tool.",
          })}
        </p>
      </div>
      <ol className="divide-y divide-neutral-800/80 border-y border-neutral-800/80">
        {paths.map((path, index) => (
          <li key={path.href} className="grid gap-3 py-6 sm:grid-cols-[2.5rem_1fr] sm:gap-6 sm:py-8">
            <span className="font-mono text-[11px] leading-none text-gray-600 tabular-nums sm:pt-0.5">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="space-y-2">
              <h3 className="text-[13px] font-medium tracking-wide text-gray-100 sm:text-[14px]">{path.title}</h3>
              <p className="max-w-2xl text-[11px] leading-relaxed text-gray-500 sm:text-[12px]">{path.body}</p>
              <Link
                to={path.href}
                className="inline-block text-[11px] text-gray-400 underline decoration-gray-700 underline-offset-4 hover:text-gray-200"
              >
                {t("home.learn.read", { defaultValue: "Read section" })}
              </Link>
            </div>
          </li>
        ))}
      </ol>
      {showHubLink && (
        <p className="text-center">
          <Link
            to={education}
            className="text-[11px] text-gray-500 underline decoration-gray-700 underline-offset-4 hover:text-gray-300"
          >
            {t("home.learn.hub", { defaultValue: "Full education hub" })}
          </Link>
        </p>
      )}
    </section>
  );
}
