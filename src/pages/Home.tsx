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
      <div className="relative min-h-screen bg-neutral-950 text-neutral-50 px-6 py-10 md:px-10 lg:px-16 xl:px-24 2xl:px-32 flex flex-col">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-8 lg:gap-10">
            <header className="w-full max-w-4xl space-y-4 text-center">
              <h1 className="font-anton text-3xl leading-tight sm:text-4xl md:text-[2.6rem] lg:text-[3.1rem] xl:text-[3.6rem] 2xl:text-[4.2rem]">Multi‑Algorithm Image Dithering</h1>
              <h2 className="mx-auto max-w-2xl text-[11px] tracking-wide text-gray-300 sm:text-xs md:text-sm lg:text-[0.9rem]">Floyd–Steinberg · Atkinson · Stucki · Sierra · Bayer · Halftone & more</h2>
              <p className="mx-auto max-w-2xl px-2 text-[11px] leading-relaxed text-gray-400 sm:text-xs md:text-[13px]">100% client‑side. Tune threshold, resolution, invert & serpentine scan. Download instantly as PNG or JPEG.</p>
            </header>
            <div className="w-full max-w-5xl">
              <InfiniteImageScroll />
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-[11px] sm:text-xs md:text-[13px]">
              <Link to="/Dithering" className="clean-btn clean-btn-primary">Open Dithering Tool</Link>
              <Link to="/Algorithms" className="clean-btn">Explore Algorithms</Link>
            </div>
          </div>
        </div>
        <footer className="mt-8 flex items-center justify-center text-[10px] text-gray-500 sm:text-[11px] md:text-xs">
          <p className="flex items-center gap-1">By <a className="text-blue-300 duration-100 hover:text-blue-500" href="https://oslo418.com" rel="noopener noreferrer">Oslo418</a></p>
        </footer>
      </div>
    </>
  );
};

export default Home;
