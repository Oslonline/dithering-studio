import type { Metadata } from "next";
import EducationPartTwo from "../../../../views/education/EducationPartTwo";
import { baseMetadata, t } from "../../../../lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return baseMetadata({
    lang,
    path: "/Education/Part-2",
    title: t(lang, "education.guide.part2.seo.title", "Ordered Dithering & Threshold Maps — Part 2"),
    description: t(
      lang,
      "education.guide.part2.seo.description",
      "How Bayer matrices and threshold maps create ordered dither patterns.",
    ),
  });
}

export default function EducationPartTwoPage() {
  return <EducationPartTwo />;
}
