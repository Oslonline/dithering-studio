import type { MetadataRoute } from "next";
import { features } from "../lib/features";
import {
  ALGORITHM_SLUGS,
  INDEXABLE_PATHS,
  SUPPORTED_LANGS,
  absoluteUrl,
  buildLanguageAlternates,
} from "../lib/seo/site";

function entry(path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"]) {
  return SUPPORTED_LANGS.map((lang) => ({
    url: absoluteUrl(lang, path),
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: {
      languages: buildLanguageAlternates(path),
    },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = INDEXABLE_PATHS.filter((path) => path !== "/Gallery" || features.gallery);

  const staticEntries = paths.flatMap((path) => {
    const priority = path === "/" ? 1 : path.startsWith("/Dithering") ? 0.9 : path.startsWith("/Education") ? 0.85 : 0.5;
    const changeFrequency: MetadataRoute.Sitemap[0]["changeFrequency"] =
      path === "/" || path.startsWith("/Education") ? "weekly" : "monthly";
    return entry(path, priority, changeFrequency);
  });

  const algorithmEntries = ALGORITHM_SLUGS.flatMap((slug) =>
    entry(`/Education/Algorithms/${slug}`, 0.7, "monthly"),
  );

  return [...staticEntries, ...algorithmEntries];
}
