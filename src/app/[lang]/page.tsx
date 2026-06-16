import type { Metadata } from "next";
import JsonLd from "../../components/seo/JsonLd";
import Home from "../../views/Home";
import { features } from "../../lib/features";
import { listPublicGalleryItems } from "../../lib/gallery/queries";
import { HOME_GALLERY_TEASER_COUNT, HOME_GALLERY_TEASER_POOL_SIZE } from "../../lib/gallery/teaser";
import { pickRandomItems } from "../../lib/shuffle";
import { baseMetadata } from "../../lib/metadata";
import { sitewideJsonLd } from "../../lib/seo/structuredData";
import { type SupportedLang } from "../../lib/seo/site";
import { hasSupabaseServerConfig } from "../../lib/supabase/config";
import { normalizeLang } from "../../utils/localePath";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return baseMetadata({
    lang,
    path: "/",
    title: "Online Dithering Tool for Images & Videos | Free, No Uploads",
    description:
      "Dither images and videos online with Floyd-Steinberg, Bayer, Atkinson, Sierra and 30 algorithms. Export PNG, JPG, WEBP, SVG, GIF, MP4, WebM. Free and fully client-side.",
  });
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const normalized = normalizeLang(lang) as SupportedLang;
  const galleryEnabled = features.gallery && hasSupabaseServerConfig();
  const galleryPool = galleryEnabled
    ? await listPublicGalleryItems("popular", HOME_GALLERY_TEASER_POOL_SIZE)
    : [];
  const galleryItems = pickRandomItems(galleryPool, HOME_GALLERY_TEASER_COUNT);

  return (
    <>
      <JsonLd data={sitewideJsonLd(normalized)} />
      <Home galleryItems={galleryItems} />
    </>
  );
}
