import React from "react";
import InfiniteImageScroll from "../components/InfiniteImageScroll";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const Home: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Free Online Image Dithering Tool | Floyd Steinberg & Patterns</title>
        <meta name="description" content="Dither your images online for free using the Floyd Steinberg algorithm and custom patterns. Fast, privacy-friendly, no upload or account required." />
        <meta property="og:title" content="Free Online Image Dithering Tool" />
        <meta property="og:description" content="Dither your images online for free using the Floyd Steinberg algorithm, custom patterns and other popular algorithms." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://steinberg-image.vercel.app/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Online Image Dithering Tool" />
        <meta name="twitter:description" content="Dither your images online for free using the Floyd Steinberg algorithm, custom patterns and other popular algorithms." />
        <link rel="canonical" href="https://steinberg-image.vercel.app/" />
      </Helmet>
      <div className="flex max-h-screen min-h-screen flex-col items-center justify-center gap-5 bg-neutral-950 p-4 text-neutral-50 md:gap-7">
        <header className="space-y-1 text-center">
          <h1 className="font-anton text-3xl md:text-4xl xl:text-5xl 2xl:text-6xl">Multi‑Algorithm Image Dithering</h1>
          <h2 className="text-[11px] tracking-wide text-gray-300 md:text-xs 2xl:text-sm">Floyd–Steinberg · Atkinson · Stucki · Sierra · Bayer · Halftone & more</h2>
          <p className="mx-auto max-w-xl px-2 text-[11px] leading-snug text-gray-400 md:text-xs">100% client‑side. Tune threshold, resolution, invert & serpentine scan. Download instantly as PNG or JPEG.</p>
        </header>
        <InfiniteImageScroll />
        <Link className="clean-btn clean-btn-primary relative !px-8 !py-4 !text-[14px] after:absolute after:inset-0 after:rounded-[inherit] after:ring-1 after:ring-white/5 after:ring-inset hover:shadow-xl focus-visible:shadow-[var(--shadow-focus)]" to="/Dithering">
          Start Dithering
        </Link>
      </div>
      <div className="absolute right-0 bottom-0 left-0 flex items-center justify-center p-4 text-xs text-gray-400">
        <p>By&nbsp;</p>
        <a className="text-blue-300 duration-100 hover:text-blue-500" href="https://oslo418.com">
          Oslo418
        </a>
      </div>
    </>
  );
};

export default Home;
