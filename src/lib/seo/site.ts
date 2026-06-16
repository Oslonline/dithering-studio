import algorithmSlugsById from "../../data/algorithm-slugs.json";
import { normalizeLang } from "../../utils/localePath";

export const SITE_URL = "https://ditheringstudio.com";
export const SUPPORTED_LANGS = ["en", "fr", "es", "de", "zh", "ru", "hi"] as const;
export type SupportedLang = (typeof SUPPORTED_LANGS)[number];

export const INDEXABLE_PATHS = [
  "/",
  "/Dithering/Image",
  "/Dithering/Video",
  "/Education",
  "/Education/Part-1",
  "/Education/Part-2",
  "/Education/Algorithms",
  "/Terms",
  "/Privacy",
  "/Cookies",
  "/Gallery",
] as const;

export const ALGORITHM_SLUGS = Object.values(algorithmSlugsById as Record<string, string>);

export function localizedPath(lang: string, path: string): string {
  const normalized = normalizeLang(lang);
  if (path === "/") return `/${normalized}/`;
  return `/${normalized}${path}`;
}

export function absoluteUrl(lang: string, path: string): string {
  return `${SITE_URL}${localizedPath(lang, path)}`;
}

export function buildLanguageAlternates(path: string): Record<string, string> {
  const languages = Object.fromEntries(
    SUPPORTED_LANGS.map((lang) => [lang, absoluteUrl(lang, path)]),
  );
  return {
    ...languages,
    "x-default": absoluteUrl("en", path),
  };
}
