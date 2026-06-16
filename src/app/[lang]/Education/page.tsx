import type { Metadata } from "next";
import JsonLd from "../../../components/seo/JsonLd";
import Education from "../../../views/Education";
import { baseMetadata, t } from "../../../lib/metadata";
import { educationFaqJsonLd, educationTechArticleJsonLd } from "../../../lib/seo/structuredData";
import { type SupportedLang } from "../../../lib/seo/site";
import { normalizeLang } from "../../../utils/localePath";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return baseMetadata({
    lang,
    path: "/Education",
    title: t(
      lang,
      "education.seo.title",
      "What is Dithering? Ordered Dithering, Error Diffusion & Floyd-Steinberg",
    ),
    description: t(
      lang,
      "education.seo.description",
      "Learn dithering basics and the differences between ordered dithering and error diffusion.",
    ),
  });
}

export default async function EducationPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const normalized = normalizeLang(lang) as SupportedLang;
  return (
    <>
      <JsonLd data={educationTechArticleJsonLd(normalized)} />
      <JsonLd data={educationFaqJsonLd(normalized)} />
      <Education />
    </>
  );
}
