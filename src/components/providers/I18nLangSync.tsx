"use client";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { normalizeLang } from "../../utils/localePath";

export default function I18nLangSync({ lang }: { lang: string }) {
  const { i18n } = useTranslation();

  useEffect(() => {
    const normalized = normalizeLang(lang);
    if (normalizeLang(i18n.language) !== normalized) {
      void i18n.changeLanguage(normalized);
    }
  }, [i18n, lang]);

  return null;
}
