import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import I18nLangSync from "../../components/providers/I18nLangSync";
import { normalizeLang } from "../../utils/localePath";

const SUPPORTED_LANGS = new Set(["en", "fr", "es", "de", "zh", "ru", "hi"]);

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const normalized = normalizeLang(lang);
  if (!SUPPORTED_LANGS.has(lang.toLowerCase())) {
    redirect(`/${normalized}`);
  }

  return (
    <>
      <I18nLangSync lang={normalized} />
      {children}
    </>
  );
}
