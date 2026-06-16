import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from '../../lib/nextRouterCompat';
import { getPathLang, normalizeLang, replaceLangPrefix, withLangPrefix } from '../../utils/localePath';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
];

const LanguageSwitcher: React.FC = () => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const activeLang = normalizeLang(i18n.resolvedLanguage || i18n.language);
  const currentLanguage = languages.find(lang => lang.code === activeLang) || languages[0];

  const changeLanguage = (lng: string) => {
    const normalizedLng = normalizeLang(lng);
    const pathLang = getPathLang(location.pathname);

    const nextPathname = pathLang
      ? replaceLangPrefix(location.pathname, normalizedLng)
      : withLangPrefix(location.pathname || '/', normalizedLng);

    navigate(
      {
        pathname: nextPathname,
        search: location.search,
        hash: location.hash,
      },
      { replace: true }
    );

    i18n.changeLanguage(normalizedLng);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="header-utility-btn font-mono uppercase tracking-wide"
        aria-label={t('tool.ariaSelectLanguage')}
      >
        <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center text-[14px] leading-none">
          {currentLanguage.flag}
        </span>
        <span>{currentLanguage.code}</span>
        <svg
          className={`h-3 w-3 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-20 mt-2 w-40 overflow-hidden rounded-md border border-neutral-800 bg-neutral-900 shadow-lg">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  activeLang === lang.code
                    ? 'bg-blue-600/20 text-blue-400'
                    : 'text-gray-300 hover:bg-neutral-800/60 hover:text-gray-100'
                }`}
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.name}</span>
                {activeLang === lang.code && (
                  <svg className="ml-auto h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
