import type { NextConfig } from "next";

const LANGS = ["en", "fr", "es", "de", "zh", "ru", "hi"] as const;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async redirects() {
    return LANGS.flatMap((lang) => [
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
  },
};

export default nextConfig;
