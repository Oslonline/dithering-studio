import type { Metadata } from "next";
import EducationPractice from "../../../../views/education/EducationPractice";
import { baseMetadata, t } from "../../../../lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return baseMetadata({
    lang,
    path: "/Education/Practice",
    title: t(
      lang,
      "education.practice.seo.title",
      "Dithering Practice | Settings, Artifacts, and Quick Recipes",
    ),
    description: t(
      lang,
      "education.practice.seo.description",
      "Practical dithering tips: workflow, settings, and artifact fixes.",
    ),
  });
}

export default function EducationPracticePage() {
  return <EducationPractice />;
}
