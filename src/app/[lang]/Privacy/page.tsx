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
    path: "/Privacy",
    title: legal.privacy.seoTitle,
    description: legal.privacy.seoDescription,
  });
}

export default function PrivacyPage() {
  return <LegalPage pageKey="privacy" />;
}
