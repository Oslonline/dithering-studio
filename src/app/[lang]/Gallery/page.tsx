import type { Metadata } from "next";
import GalleryView from "../../../views/GalleryView";
import { features } from "../../../lib/features";
import { listPublicGalleryItems } from "../../../lib/gallery/queries";
import type { GallerySort } from "../../../lib/gallery/types";
import { baseMetadata } from "../../../lib/metadata";
import { hasSupabaseServerConfig } from "../../../lib/supabase/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return baseMetadata({
    lang,
    path: "/Gallery",
    title: "Community Gallery | Dithering Studio",
    description: "Browse dithering creations shared by the community and reuse their settings in the tool.",
  });
}

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>;
}) {
  const qs = await searchParams;
  const sort: GallerySort = qs.sort === "popular" ? "popular" : "latest";
  const enabled = features.gallery;
  const configured = hasSupabaseServerConfig();
  const items = enabled && configured ? await listPublicGalleryItems(sort, 60) : [];

  return <GalleryView items={items} sort={sort} enabled={enabled} configured={configured} />;
}
