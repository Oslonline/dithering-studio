import type { Metadata } from "next";
import { getAlgorithmDetail } from "../utils/algorithmInfo";
import { getAlgorithmIdFromSlug } from "../utils/algorithmSlug";
import de from "../i18n/locales/de/index";
import en from "../i18n/locales/en/index";
import es from "../i18n/locales/es/index";
import fr from "../i18n/locales/fr/index";
import hi from "../i18n/locales/hi/index";
import ru from "../i18n/locales/ru/index";
import zh from "../i18n/locales/zh/index";
import { normalizeLang } from "../utils/localePath";
import { SITE_URL, absoluteUrl, buildLanguageAlternates, type SupportedLang } from "./seo/site";

const SOCIAL_IMAGE = `${SITE_URL}/socials-img.png`;

const dictionaries: Record<SupportedLang, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  fr: fr as Record<string, unknown>,
  es: es as Record<string, unknown>,
  de: de as Record<string, unknown>,
  zh: zh as Record<string, unknown>,
  ru: ru as Record<string, unknown>,
  hi: hi as Record<string, unknown>,
};

function getByPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (typeof acc !== "object" || acc === null) return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

export function t(lang: string, path: string, fallback: string): string {
  const normalized = normalizeLang(lang) as SupportedLang;
  const value = getByPath(dictionaries[normalized], path);
  return typeof value === "string" ? value : fallback;
}

export function buildAlternates(path: string): Metadata["alternates"] {
  return {
    canonical: absoluteUrl("en", path),
    languages: buildLanguageAlternates(path),
  };
}

export function baseMetadata({
  lang,
  path,
  title,
  description,
  noindex = false,
}: {
  lang: string;
  path: string;
  title: string;
  description: string;
  noindex?: boolean;
}): Metadata {
  const url = absoluteUrl(lang, path);
  return {
    title,
    description,
    alternates: buildAlternates(path),
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      type: "website",
      url,
      images: [SOCIAL_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SOCIAL_IMAGE],
    },
  };
}

export function algorithmMetadata(lang: string, slug: string): Metadata {
  const id = getAlgorithmIdFromSlug(slug);
  if (!id) {
    return baseMetadata({
      lang,
      path: "/Education/Algorithms",
      title: t(lang, "explorer.seo.title", "Dithering Algorithms Reference"),
      description: t(
        lang,
        "explorer.seo.description",
        "Compare dithering algorithms and their visual characteristics.",
      ),
    });
  }

  const algo = getAlgorithmDetail(id);
  const technicalSummary = algo?.technicalSummary
    ? t(lang, `algoData.${id}.technicalSummary`, algo.technicalSummary)
    : undefined;
  const overview = t(lang, `algoData.${id}.overview`, algo?.overview ?? "Algorithm details");
  const explorerTitle = t(lang, "explorer.seo.title", "Dithering Algorithms Reference");

  return baseMetadata({
    lang,
    path: `/Education/Algorithms/${slug}`,
    title: `${algo?.name ?? "Algorithm"} - ${explorerTitle}`,
    description: technicalSummary ?? overview,
  });
}
