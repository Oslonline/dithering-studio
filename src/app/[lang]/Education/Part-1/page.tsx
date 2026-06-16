import type { Metadata } from "next";
import EducationPartOne from "../../../../views/education/EducationPartOne";
import { baseMetadata, t } from "../../../../lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return baseMetadata({
    lang,
    path: "/Education/Part-1",
    title: t(lang, "education.guide.part1.seo.title", "What Dithering Does — Part 1"),
    description: t(
      lang,
      "education.guide.part1.seo.description",
      "Learn how dithering simulates extra gray levels with patterns of black and white pixels.",
    ),
  });
}

export default function EducationPartOnePage() {
  return <EducationPartOne />;
}
