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

const SITE_URL = "https://ditheringstudio.com";
const SOCIAL_IMAGE = `${SITE_URL}/socials-img.png`;
const SUPPORTED_LANGS = ["en", "fr", "es", "de", "zh", "ru", "hi"] as const;

type SupportedLang = (typeof SUPPORTED_LANGS)[number];

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

function localizedPath(lang: string, path: string): string {
  const normalized = normalizeLang(lang);
  if (path === "/") return `/${normalized}/`;
  return `/${normalized}${path}`;
}

function absolute(path: string): string {
  return `${SITE_URL}${path}`;
}

export function buildAlternates(path: string): Metadata["alternates"] {
  const languages = Object.fromEntries(
    SUPPORTED_LANGS.map((lang) => [lang, absolute(localizedPath(lang, path))]),
  );
  return {
    canonical: absolute(localizedPath("en", path)),
    languages: {
      ...languages,
      "x-default": absolute(localizedPath("en", path)),
    },
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
  const url = absolute(localizedPath(lang, path));
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
  const overview = t(lang, `algoData.${id}.overview`, algo?.overview ?? "Algorithm details");
  const explorerTitle = t(lang, "explorer.seo.title", "Dithering Algorithms Reference");

  return baseMetadata({
    lang,
    path: `/Education/Algorithms/${slug}`,
    title: `${algo?.name ?? "Algorithm"} - ${explorerTitle}`,
    description: overview,
  });
}
