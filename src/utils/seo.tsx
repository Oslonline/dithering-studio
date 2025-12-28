const SITE_URL = 'https://ditheringstudio.com';
const DEFAULT_SOCIAL_IMAGE_PATH = '/socials-img.png';

export const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'zh', 'ru', 'hi'] as const;

const normalizePathname = (pathname: string): string => {
  if (!pathname) return '/';
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
};

const withLocalePath = (pathname: string, lang?: string): string => {
  const normalizedPathname = normalizePathname(pathname);
  const normalizedLang = (lang && SUPPORTED_LANGUAGES.includes(lang as any) ? lang : 'en') as string;
  // Always use explicit locale prefixes (e.g. /en/, /fr/), including English.
  // Home is represented as `/${lang}/`.
  return `${SITE_URL}/${normalizedLang}${normalizedPathname}`;
};

/**
 * Generate hreflang link elements for a given page path
 * @param pathname - Page path without locale prefix (e.g., '/', '/Dithering/Image', '/Algorithms')
 * @returns Array of link elements with hreflang attributes
 */
export const generateHreflangTags = (pathname: string) => {
  const tags = SUPPORTED_LANGUAGES.map((lang) => (
    <link
      key={`hreflang-${lang}`}
      rel="alternate"
      hrefLang={lang}
      href={withLocalePath(pathname, lang)}
    />
  ));

  // Add x-default for language selector (defaults to English)
  tags.push(
    <link
      key="hreflang-default"
      rel="alternate"
      hrefLang="x-default"
      href={withLocalePath(pathname, 'en')}
    />
  );

  return tags;
};

/**
 * Generate canonical URL for a given pathname
 * @param pathname - Current page path
 * @returns Canonical URL
 */
export const getCanonicalUrl = (pathname: string): string => {
  return withLocalePath(pathname, 'en');
};

/**
 * Generate canonical URL with language parameter (if non-English)
 * @param pathname - Current page path
 * @param lang - Current language
 * @returns Canonical URL
 */
export const getCanonicalUrlWithLang = (pathname: string, lang?: string): string => {
  return withLocalePath(pathname, lang);
};

/**
 * Generate Open Graph URL with language parameter
 * @param pathname - Current page path
 * @param lang - Current language
 * @returns OG URL with language
 */
export const getOgUrl = (pathname: string, lang?: string): string => {
  return withLocalePath(pathname, lang);
};

/**
 * Default social share image for OG/Twitter.
 * Keep as a single, stable absolute URL for all locales.
 */
export const getSocialImageUrl = (): string => {
  return `${SITE_URL}${DEFAULT_SOCIAL_IMAGE_PATH}`;
};
