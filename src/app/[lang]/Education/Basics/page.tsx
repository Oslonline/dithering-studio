import type { Metadata } from "next";
import EducationBasics from "../../../../views/education/EducationBasics";
import { baseMetadata, t } from "../../../../lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return baseMetadata({
    lang,
    path: "/Education/Basics",
    title: t(
      lang,
      "education.basics.seo.title",
      "Dithering Basics | Definition, Bayer Matrix & Error Diffusion",
    ),
    description: t(
      lang,
      "education.basics.seo.description",
      "Dithering basics: what it is, why it reduces banding, and key algorithm families.",
    ),
  });
}

export default function EducationBasicsPage() {
  return <EducationBasics />;
}
