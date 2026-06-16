import type { NextConfig } from "next";

const LANGS = ["en", "fr", "es", "de", "zh", "ru", "hi"] as const;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    const legacyAlgorithms = [
      { source: "/Algorithms", destination: "/en/Education", permanent: true },
      ...LANGS.map((lang) => ({
        source: `/${lang}/Algorithms`,
        destination: `/${lang}/Education`,
        permanent: true,
      })),
    ];

    const legacyEducation = LANGS.flatMap((lang) => [
      {
        source: `/${lang}/Education/Basics`,
        destination: `/${lang}/Education`,
        permanent: true,
      },
      {
        source: `/${lang}/Education/Practice`,
        destination: `/${lang}/Education`,
        permanent: true,
      },
    ]);

    const legacyDithering = [
      { source: "/Dithering", destination: "/en/Dithering/Image", permanent: true },
      { source: "/Dithering/Image", destination: "/en/Dithering/Image", permanent: true },
      { source: "/Dithering/Video", destination: "/en/Dithering/Video", permanent: true },
    ];

    return [
      { source: "/llm.txt", destination: "/llms.txt", permanent: true },
      ...legacyAlgorithms,
      ...legacyEducation,
      ...legacyDithering,
    ];
  },
};

export default nextConfig;
