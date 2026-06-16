"use client";

import { useTranslation } from "react-i18next";
import { Link } from "../../lib/nextRouterCompat";
import { features } from "../../lib/features";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

interface SiteFooterProps {
  showCta?: boolean;
}

export default function SiteFooter({ showCta = false }: SiteFooterProps) {
  const { t, i18n } = useTranslation();
  const activeLang = normalizeLang(i18n.language);

  return (
    <footer className="mt-auto flex flex-col gap-10 border-t border-neutral-900 py-10">
      {showCta && (
        <div className="flex flex-col items-center gap-5">
          <Link to={withLangPrefix("/Dithering/Image", activeLang)} className="clean-btn clean-btn-primary">
            {t("footer.cta", { defaultValue: "Start Dithering" })}
          </Link>
          <p className="text-[10px] tracking-wide text-gray-600">
            {t("footer.tagline", { defaultValue: "Fast • Local • Open" })}
          </p>
        </div>
      )}
      <div className="flex flex-col items-center gap-4 text-[10px] text-gray-500 sm:text-[11px] md:text-xs">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          <Link to={withLangPrefix("/Education", activeLang)} className="transition-colors hover:text-gray-300">
            {t("footer.algorithms", { defaultValue: "Education" })}
          </Link>
          {features.gallery && (
            <Link to={withLangPrefix("/Gallery", activeLang)} className="transition-colors hover:text-gray-300">
              {t("footer.gallery", { defaultValue: "Gallery" })}
            </Link>
          )}
          <Link to={withLangPrefix("/Terms", activeLang)} className="transition-colors hover:text-gray-300">
            {t("footer.terms", { defaultValue: "Terms" })}
          </Link>
          <Link to={withLangPrefix("/Privacy", activeLang)} className="transition-colors hover:text-gray-300">
            {t("footer.privacy", { defaultValue: "Privacy" })}
          </Link>
          <Link to={withLangPrefix("/Cookies", activeLang)} className="transition-colors hover:text-gray-300">
            {t("footer.cookies", { defaultValue: "Cookies" })}
          </Link>
          <a
            href="https://github.com/Oslonline/dithering-studio"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-gray-300"
          >
            {t("footer.github", { defaultValue: "GitHub" })}
          </a>
          <a
            href="https://github.com/Oslonline/dithering-studio/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-gray-300"
          >
            {t("footer.license", { defaultValue: "License" })}
          </a>
        </nav>
        <p className="max-w-lg text-center text-[10px] leading-relaxed text-gray-600">
          {t("footer.analyticsNotice", {
            defaultValue: "Privacy-friendly Vercel Web Analytics (no ad cookies).",
          })}{" "}
          <Link to={withLangPrefix("/Cookies", activeLang)} className="text-gray-400 underline hover:text-gray-300">
            {t("footer.analyticsPolicy", { defaultValue: "Cookie Policy" })}
          </Link>
        </p>
        <p className="flex items-center gap-1">
          {t("footer.by", { defaultValue: "By" })}{" "}
          <a className="text-blue-300 duration-100 hover:text-blue-500" href="https://x.com/Oslo418" rel="noopener noreferrer">
            Oslo418
          </a>{" "}
          • Apache 2.0
        </p>
      </div>
    </footer>
  );
}
