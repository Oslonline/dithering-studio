import type { Metadata } from "next";
import JsonLd from "../../../../../components/seo/JsonLd";
import AlgorithmDetail from "../../../../../views/AlgorithmDetail";
import { algorithmMetadata } from "../../../../../lib/metadata";
import { algorithmBreadcrumbJsonLd } from "../../../../../lib/seo/structuredData";
import { type SupportedLang } from "../../../../../lib/seo/site";
import { normalizeLang } from "../../../../../utils/localePath";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  return algorithmMetadata(lang, slug);
}

export default async function AlgorithmDetailPage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const normalized = normalizeLang(lang) as SupportedLang;
  return (
    <>
      <JsonLd data={algorithmBreadcrumbJsonLd(normalized, slug)} />
      <AlgorithmDetail />
    </>
  );
}
