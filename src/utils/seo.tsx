const SITE_URL = 'https://ditheringstudio.com';

export const SUPPORTED_LANGUAGES = ['en', 'fr', 'es', 'de', 'zh', 'ru', 'hi'] as const;

/**
 * Generate hreflang link elements for a given page path
 * @param pathname - Current page path (e.g., '/', '/Dithering/Image', '/Algorithms')
 * @returns Array of link elements with hreflang attributes
 */
export const generateHreflangTags = (pathname: string) => {
  const tags = SUPPORTED_LANGUAGES.map((lang) => (
    <link
      key={`hreflang-${lang}`}
      rel="alternate"
      hrefLang={lang}
      href={`${SITE_URL}${pathname}?lang=${lang}`}
    />
  ));

  // Add x-default for language selector (defaults to English)
  tags.push(
    <link
      key="hreflang-default"
      rel="alternate"
      hrefLang="x-default"
      href={`${SITE_URL}${pathname}`}
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
  return `${SITE_URL}${pathname}`;
};

/**
 * Generate Open Graph URL with language parameter
 * @param pathname - Current page path
 * @param lang - Current language
 * @returns OG URL with language
 */
export const getOgUrl = (pathname: string, lang?: string): string => {
  if (lang && lang !== 'en') {
    return `${SITE_URL}${pathname}?lang=${lang}`;
  }
  return `${SITE_URL}${pathname}`;
};
