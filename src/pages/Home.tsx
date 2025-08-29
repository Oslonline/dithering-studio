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
      <div className="relative flex min-h-screen flex-col bg-neutral-950 text-neutral-50">
  <div className="flex flex-1 flex-col items-center justify-start gap-3 px-4 pt-6 pb-20 md:justify-center md:gap-4 md:pt-0">
          <header className="w-full space-y-2 text-center sm:space-y-1">
            <h1 className="font-anton text-2xl leading-tight sm:text-3xl md:text-[1.8rem] xl:text-[2.75rem] 2xl:text-[4.5rem]">Multi‑Algorithm Image Dithering</h1>
            <h2 className="mx-auto max-w-2xl text-[10px] tracking-wide text-gray-300 sm:text-[11px] md:text-xs 2xl:text-sm">Floyd–Steinberg · Atkinson · Stucki · Sierra · Bayer · Halftone & more</h2>
            <p className="mx-auto max-w-xl px-2 text-[10px] leading-snug text-gray-400 sm:text-[11px] md:text-xs">100% client‑side. Tune threshold, resolution, invert & serpentine scan. Download instantly as PNG or JPEG.</p>
          </header>
          <div className="w-full">
            <InfiniteImageScroll />
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-3 text-[10px] sm:text-[11px]">
            <Link to="/Dithering" className="clean-btn clean-btn-primary">Open Dithering Tool</Link>
            <Link to="/Algorithms" className="clean-btn">Explore Algorithms</Link>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center p-4 text-[10px] text-gray-400 sm:text-xs">
          <p>By&nbsp;</p>
          <a className="text-blue-300 duration-100 hover:text-blue-500" href="https://oslo418.com" rel="noopener noreferrer">Oslo418</a>
        </div>
      </div>
    </>
  );
};

export default Home;
