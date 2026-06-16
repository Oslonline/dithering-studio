import { getAlgorithmDetail } from "../../utils/algorithmInfo";
import { getAlgorithmIdFromSlug } from "../../utils/algorithmSlug";
import { t } from "../metadata";
import { absoluteUrl, SITE_URL, type SupportedLang } from "./site";

const ORG_ID = `${SITE_URL}/#organization`;
const APP_ID = `${SITE_URL}/#webapp`;

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: "Dithering Studio",
    url: SITE_URL,
    logo: `${SITE_URL}/ditheringstudio.png`,
    sameAs: ["https://github.com/Oslonline/dithering-studio", "https://x.com/Oslo418"],
  };
}

export function webApplicationJsonLd(lang: SupportedLang) {
  const url = absoluteUrl(lang, "/");
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": APP_ID,
    name: "Dithering Studio",
    url,
    applicationCategory: "MultimediaApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript. Runs entirely in the browser.",
    description:
      "Free online image and video dithering with 30+ algorithms. Client-side processing — no uploads required for the core tool.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Image and video dithering",
      "Floyd-Steinberg and error diffusion family",
      "Bayer ordered dithering matrices",
      "Custom palettes and presets",
      "PNG, JPEG, WEBP, SVG, GIF, WebM, MP4 export",
    ],
    publisher: { "@id": ORG_ID },
  };
}

const EDUCATION_FAQ = [
  {
    question: "What is dithering?",
    answer:
      "Dithering simulates more tones than a limited palette can show by placing patterns of dots or pixels. It reduces banding in gradients and creates retro or print-style looks.",
  },
  {
    question: "What is the difference between ordered dithering and error diffusion?",
    answer:
      "Ordered dithering (e.g. Bayer matrices) uses a fixed threshold pattern. Error diffusion (e.g. Floyd-Steinberg) spreads quantization error to neighboring pixels for smoother results.",
  },
  {
    question: "Does Dithering Studio upload my images?",
    answer:
      "No. Core image and video processing runs locally in your browser. Only content you explicitly publish to the optional community gallery is uploaded.",
  },
  {
    question: "Do I need an account to use the dithering tool?",
    answer:
      "No. The tool is free and works without signing in. Accounts are optional for gallery publishing and your public profile.",
  },
] as const;

export function educationTechArticleJsonLd(lang: SupportedLang) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: t(lang, "education.techArticle.headline", "What Is Dithering? Complete Guide to Ordered & Error Diffusion"),
    description: t(
      lang,
      "education.techArticle.description",
      "An interactive educational reference guide explaining digital image and video dithering math, covering 30+ algorithms including Floyd-Steinberg, Bayer, and Blue Noise.",
    ),
    inLanguage: lang === "en" ? "en" : lang,
    about: [
      { "@type": "Thing", name: t(lang, "education.techArticle.aboutDithering", "Dithering") },
      { "@type": "Thing", name: t(lang, "education.techArticle.aboutFloydSteinberg", "Floyd–Steinberg algorithm") },
      { "@type": "Thing", name: t(lang, "education.techArticle.aboutErrorDiffusion", "Error diffusion") },
      { "@type": "Thing", name: t(lang, "education.techArticle.aboutOrderedDithering", "Ordered dithering") },
    ],
    audience: {
      "@type": "Audience",
      audienceType: t(lang, "education.techArticle.audienceType", "Developers, Graphic Designers, Pixel Artists"),
    },
    url: absoluteUrl(lang, "/Education"),
  };
}

export function educationFaqJsonLd(lang: SupportedLang) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: EDUCATION_FAQ.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
    url: absoluteUrl(lang, "/Education"),
  };
}

export function algorithmBreadcrumbJsonLd(lang: SupportedLang, slug: string) {
  const id = getAlgorithmIdFromSlug(slug);
  const algo = id ? getAlgorithmDetail(id) : null;
  const name = algo?.name ?? "Algorithm";

  const items = [
    { name: "Home", path: "/" },
    { name: "Education", path: "/Education" },
    { name: "Algorithms", path: "/Education/Algorithms" },
    { name, path: `/Education/Algorithms/${slug}` },
  ];

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(lang, item.path),
    })),
  };
}

export function sitewideJsonLd(lang: SupportedLang) {
  return [organizationJsonLd(), webApplicationJsonLd(lang)];
}
