import type { Metadata } from "next";
import DitheringTool from "../../../../views/DitheringTool";
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
    path: "/Dithering/Image",
    title: t(lang, "tool.seo.imageTitle", "Online Image Dithering Tool"),
    description: t(
      lang,
      "tool.seo.imageDescription",
      "Dither images online with advanced algorithms and export in multiple formats.",
    ),
    noindex: Object.keys(qs).length > 0,
  });
}

export default function DitheringImagePage() {
  return <DitheringTool initialMode="image" />;
}
