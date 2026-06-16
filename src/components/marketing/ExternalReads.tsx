"use client";

import { useTranslation } from "react-i18next";
import { Link } from "../../lib/nextRouterCompat";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

const READS = [
  {
    href: "https://visualrambling.space/dithering-part-1/",
    titleKey: "education.external.part1Title",
    descKey: "education.external.part1Desc",
    defaultTitle: "Dithering, part 1",
    defaultDesc: "Foundations and visual intuition for how dither patterns emerge.",
  },
  {
    href: "https://visualrambling.space/dithering-part-2/",
    titleKey: "education.external.part2Title",
    descKey: "education.external.part2Desc",
    defaultTitle: "Dithering, part 2",
    defaultDesc: "Blue noise, modern ordered approaches, and quality trade-offs.",
  },
] as const;

export default function ExternalReads() {
  const { t, i18n } = useTranslation();
  const lang = normalizeLang(i18n.language);

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="font-anton text-xl tracking-tight text-gray-100">
          {t("education.external.title", { defaultValue: "Recommended deep reads" })}
        </h2>
        <p className="text-[12px] leading-relaxed text-gray-400">
          {t("education.external.intro", {
            defaultValue:
              "The best visual explanations we found live off-site. Read them for intuition, then return here to try the same ideas in-app.",
          })}
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {READS.map((read) => (
          <a
            key={read.href}
            href={read.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-lg border border-neutral-800 bg-neutral-900/20 p-4 transition-colors hover:border-neutral-700"
          >
            <h3 className="text-[12px] font-medium tracking-wide text-gray-200 group-hover:text-gray-100">
              {t(read.titleKey, { defaultValue: read.defaultTitle })}
              <span className="ml-1 text-gray-500" aria-hidden>
                ↗
              </span>
            </h3>
            <p className="mt-2 text-[12px] leading-relaxed text-gray-400">{t(read.descKey, { defaultValue: read.defaultDesc })}</p>
          </a>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Link to={withLangPrefix("/Education", lang)} className="clean-btn px-4 py-2 text-[11px]">
          {t("education.external.returnCta", { defaultValue: "Back to education hub" })}
        </Link>
        <Link to={withLangPrefix("/Dithering/Image", lang)} className="clean-btn clean-btn-primary px-4 py-2 text-[11px]">
          {t("education.external.tryCta", { defaultValue: "Try in the tool" })}
        </Link>
      </div>
    </section>
  );
}
