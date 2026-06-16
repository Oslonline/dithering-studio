import type { Metadata } from "next";
import GalleryPublishClient from "./GalleryPublishClient";
import { baseMetadata } from "../../../../lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return baseMetadata({
    lang,
    path: "/Gallery/publish",
    title: "Confirm Gallery Publication | Dithering Studio",
    description: "Review and submit your dithering creation to the community gallery.",
    noindex: true,
  });
}

export default async function GalleryPublishPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  return <GalleryPublishClient lang={lang} />;
}
