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
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
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
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
