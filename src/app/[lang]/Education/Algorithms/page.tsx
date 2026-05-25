import type { Metadata } from "next";
import AlgorithmExplorer from "../../../../views/AlgorithmExplorer";
import { baseMetadata, t } from "../../../../lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return baseMetadata({
    lang,
    path: "/Education/Algorithms",
    title: t(
      lang,
      "explorer.seo.title",
      "Dithering Algorithms Explorer | Bayer, Floyd-Steinberg, Atkinson and More",
    ),
    description: t(
      lang,
      "explorer.seo.description",
      "Explore dithering algorithms with practical guidance and visual examples.",
    ),
  });
}

export default function AlgorithmExplorerPage() {
  return <AlgorithmExplorer />;
}
