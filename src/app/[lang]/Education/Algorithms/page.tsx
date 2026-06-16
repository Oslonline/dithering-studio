import type { Metadata } from "next";
import AlgorithmExplorer from "../../../../views/AlgorithmExplorer";
import { baseMetadata, t } from "../../../../lib/metadata";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}): Promise<Metadata> {
  const { lang } = await params;
  const qs = await searchParams;
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
    noindex: Object.keys(qs).length > 0,
  });
}

export default function AlgorithmExplorerPage() {
  return <AlgorithmExplorer />;
}
