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
    path: "/Dithering/Video",
    title: t(lang, "tool.seo.videoTitle", "Online Video Dithering Tool"),
    description: t(
      lang,
      "tool.seo.videoDescription",
      "Apply dithering effects to video directly in your browser with no uploads.",
    ),
    noindex: Object.keys(qs).length > 0,
  });
}

export default function DitheringVideoPage() {
  return <DitheringTool initialMode="video" />;
}
