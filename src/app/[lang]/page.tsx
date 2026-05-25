import type { Metadata } from "next";
import Home from "../../views/Home";
import { baseMetadata } from "../../lib/metadata";

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

export default function HomePage() {
  return <Home />;
}
