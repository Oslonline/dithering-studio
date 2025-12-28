import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { normalizeLang, getPathLang, replaceLangPrefix, withLangPrefix, stripLangPrefix } from '../utils/localePath';

const getBrowserPreferredLanguage = (): ReturnType<typeof normalizeLang> => {
  if (typeof navigator === 'undefined') return 'en';

  const candidates = Array.isArray(navigator.languages) && navigator.languages.length > 0
    ? navigator.languages
    : [navigator.language];

  for (const candidate of candidates) {
    const normalized = normalizeLang(candidate);
    if (normalized) return normalized;
  }
  return 'en';
};

/**
 * Syncs i18n language with path-based locales (/en/, /fr/, ...).
 *
 * Behaviors:
 * - If URL contains legacy `?lang=<code>`, migrate to path locale and remove the query param (preserving other params).
 * - If URL has no locale prefix, redirect to `/en/...` (canonical default).
 * - If URL is `/en` (missing trailing slash), normalize to `/en/`.
 * - Keeps i18n language aligned with the path locale.
 */
export function useSyncLanguageWithPath() {
  const { i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const sp = new URLSearchParams(location.search);

    // 1) Legacy migration: ?lang=fr -> /fr/... (preserve other params)
    const legacyLangRaw = sp.get('lang');
    const legacyLang = legacyLangRaw ? normalizeLang(legacyLangRaw) : undefined;
    if (legacyLangRaw) {
      sp.delete('lang');

      const { restPath } = stripLangPrefix(location.pathname);
      const targetPath = withLangPrefix(restPath, legacyLang ?? 'en');
      navigate(
        {
          pathname: targetPath,
          search: sp.toString(),
          hash: location.hash
        },
        { replace: true }
      );

      if (i18n.language !== (legacyLang ?? 'en')) {
        i18n.changeLanguage(legacyLang ?? 'en');
      }
      return;
    }

    // 2) Ensure we always have a locale prefix.
    // If the user lands on a legacy (no-locale) URL, choose a default based on
    // detected language (navigator/localStorage) instead of always forcing /en/.
    const pathLang = getPathLang(location.pathname);
    if (!pathLang) {
      const detected = normalizeLang(i18n.resolvedLanguage || i18n.language);
      const preferred = detected !== 'en' ? detected : getBrowserPreferredLanguage();

      const targetPath = withLangPrefix(location.pathname || '/', preferred);
      navigate(
        {
          pathname: targetPath,
          search: location.search,
          hash: location.hash
        },
        { replace: true }
      );
      if (i18n.language !== preferred) i18n.changeLanguage(preferred);
      return;
    }

    // 3) Normalize /en -> /en/
    if (location.pathname === `/${pathLang}`) {
      navigate(
        {
          pathname: `/${pathLang}/`,
          search: location.search,
          hash: location.hash
        },
        { replace: true }
      );
      return;
    }

    // 4) Keep URL and i18n aligned.
    // Prefer explicit user language changes by updating the URL.
    const normalizedI18n = normalizeLang(i18n.resolvedLanguage || i18n.language);
    if (normalizedI18n !== pathLang) {
      navigate(
        {
          pathname: replaceLangPrefix(location.pathname, normalizedI18n),
          search: location.search,
          hash: location.hash
        },
        { replace: true }
      );
      return;
    }

    // If URL is already correct but i18n isn't, align i18n.
    if (i18n.language !== pathLang) {
      i18n.changeLanguage(pathLang);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search, location.hash, i18n.language, i18n.resolvedLanguage]);
}
