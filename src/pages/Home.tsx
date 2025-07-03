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
      <div className="flex max-h-screen min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950 p-4 text-neutral-50 md:gap-6 lg:gap-10">
        <header className="text-center">
          <h1 className="font-anton text-3xl md:text-4xl xl:text-5xl 2xl:text-6xl">Free Online Image Dithering</h1>
          <h2 className="text-xs md:text-sm 2xl:text-base">Using Floyd Steinberg Algorithm & custom patterns</h2>
        </header>
        <InfiniteImageScroll />
        <Link className="p-x-2 rounded bg-blue-800 px-4 py-2 font-mono text-gray-50 duration-100 hover:bg-blue-600" to="/Dithering">
          Start dithering
        </Link>
      </div>
    </>
  );
};

export default Home;
