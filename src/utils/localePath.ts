import { SUPPORTED_LANGUAGES } from './seo';

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const normalizeLang = (lang: string | null | undefined): SupportedLanguage => {
  const lower = (lang ?? '').toLowerCase().trim();
  const base = lower.split(/[-_]/)[0];
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(base) ? (base as SupportedLanguage) : 'en';
};

export const getPathLang = (pathname: string): SupportedLanguage | undefined => {
  const seg = pathname.split('/').filter(Boolean)[0];
  if (!seg) return undefined;
  const lower = seg.toLowerCase();
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(lower) ? (lower as SupportedLanguage) : undefined;
};

export const stripLangPrefix = (pathname: string): { lang?: SupportedLanguage; restPath: string } => {
  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];
  const lang = first ? getPathLang(`/${first}`) : undefined;
  if (!lang) return { restPath: pathname || '/' };

  const rest = segments.slice(1).join('/');
  return { lang, restPath: `/${rest}`.replace(/\/$/, '') || '/' };
};

export const withLangPrefix = (pathname: string, lang: SupportedLanguage): string => {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;
  // Ensure home has a trailing slash: /en/
  if (normalized === '/') return `/${lang}/`;
  return `/${lang}${normalized}`;
};

export const replaceLangPrefix = (pathname: string, lang: SupportedLanguage): string => {
  const { restPath } = stripLangPrefix(pathname);
  return withLangPrefix(restPath, lang);
};
