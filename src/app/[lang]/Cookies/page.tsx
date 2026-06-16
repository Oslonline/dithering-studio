import type { Metadata } from "next";
import LegalPage from "../../../views/LegalPage";
import legal from "../../../i18n/locales/en/legal";
import { baseMetadata } from "../../../lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return baseMetadata({
    lang,
    path: "/Cookies",
    title: legal.cookies.seoTitle,
    description: legal.cookies.seoDescription,
  });
}

export default function CookiesPage() {
  return <LegalPage pageKey="cookies" />;
}
