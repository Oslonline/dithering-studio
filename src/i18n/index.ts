import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en/index';
import fr from './locales/fr/index';
import es from './locales/es/index';
import zh from './locales/zh/index';
import ru from './locales/ru/index';
import hi from './locales/hi/index';
import de from './locales/de/index';

i18n
  .use(initReactI18next);

if (typeof window !== 'undefined') {
  i18n.use(LanguageDetector);
}

i18n.init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      es: { translation: es },
      zh: { translation: zh },
      ru: { translation: ru },
      hi: { translation: hi },
      de: { translation: de },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr', 'es', 'zh', 'ru', 'hi', 'de'],
    load: 'languageOnly',
    nonExplicitSupportedLngs: true,
    detection: typeof window !== 'undefined' ? {
      // SEO + shareable URLs: prefer explicit locale path prefixes like `/fr/...`.
      order: ['path', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupFromPathIndex: 0,
      lookupLocalStorage: 'i18nextLng',
    } : undefined,
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
