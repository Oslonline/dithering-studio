import type { Metadata } from "next";
import Education from "../../../views/Education";
import { baseMetadata, t } from "../../../lib/metadata";

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

export default function EducationPage() {
  return <Education />;
}
