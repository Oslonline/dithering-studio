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
        <meta property="og:url" content="https://ditheringstudio.com/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Online Image Dithering Tool" />
        <meta name="twitter:description" content="Dither your images online for free using the Floyd Steinberg algorithm, custom patterns and other popular algorithms." />
        <link rel="canonical" href="https://ditheringstudio.com/" />
      </Helmet>

      <div className="relative flex min-h-screen flex-col bg-neutral-950 px-6 py-6 text-neutral-50 md:px-10 md:py-6 lg:px-16 xl:px-24 2xl:px-32">
        <div className="flex flex-1 items-start justify-center">
          <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-24 pb-28">
            {/* HERO */}
            <section data-hero className="flex min-h-[calc(100dvh-4rem)] w-full max-w-6xl flex-col items-center justify-center gap-7 py-6 sm:gap-8 sm:py-8 md:min-h-[calc(100dvh-5rem)]">
              <header className="w-full max-w-3xl space-y-6 text-center">
                <h1 className="font-anton text-[2.85rem] leading-tight tracking-tight sm:text-[3.2rem] md:text-[3.6rem] lg:text-[3.9rem]">Multi‑Algorithm Image Dithering</h1>
                <p className="mx-auto max-w-xl text-[11px] leading-relaxed text-gray-400 sm:text-[12px] md:text-[13px]">Drop an image → pick an algorithm → adjust settings → export instantly. 100% client‑side & free.</p>
              </header>
              <div className="relative max-h-[380px] w-full max-w-4xl overflow-hidden rounded-lg border border-neutral-800/60 bg-neutral-900/40 p-3 shadow-[0_0_0_1px_#181818,0_4px_18px_-6px_rgba(0,0,0,0.6)] backdrop-blur-sm sm:max-h-[400px] md:p-4">
                <InfiniteImageScroll />
                <p className="mt-3 text-center text-[10px] tracking-wide text-gray-500">Generated live • No account • No uploads leave your browser</p>
              </div>
              <div className="flex flex-wrap justify-center gap-4 text-[11px] sm:text-xs md:text-[13px]">
                <Link to="/Dithering" className="clean-btn clean-btn-primary">
                  Open Tool
                </Link>
                <Link to="/Algorithms" className="clean-btn">
                  Algorithm Reference
                </Link>
              </div>
            </section>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-800/70 to-transparent" />

            {/* FEATURE GRID */}
            <section className="w-full max-w-5xl space-y-10">
              <div className="space-y-2 text-center">
                <h3 className="font-anton text-xl tracking-tight sm:text-2xl">Core Features</h3>
                <p className="mx-auto max-w-md text-[11px] leading-relaxed text-gray-500 sm:text-[12px] md:text-[13px]">Four anchors — the rest stays out of the way.</p>
              </div>
              <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
                {[
                  { t: "15+ algorithms", d: "Diffusion families, ordered matrices, stochastic & adaptive variants in one workspace." },
                  { t: "Color palette handling", d: "Apply built‑ins or custom sets (only where it adds value)." },
                  { t: "No account needed", d: "Zero signup. Zero tracking. Just load and work." },
                  { t: "Instant export", d: "PNG • JPEG • WEBP • SVG — processed locally, ready immediately." },
                ].map((f, i) => (
                  <div key={i} className="relative flex flex-col gap-2 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/40 p-5 transition-colors hover:border-neutral-700">
                    <span className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-gradient-to-b from-blue-500/60 via-blue-400/30 to-transparent opacity-80" />
                    <h4 className="text-[12px] font-medium tracking-wide text-gray-200">{f.t}</h4>
                    <p className="text-[11px] leading-relaxed text-gray-500">{f.d}</p>
                  </div>
                ))}
              </div>
            </section>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-800/70 to-transparent" />

            {/* HOW IT WORKS */}
            <section className="w-full max-w-5xl space-y-10">
              <h3 className="font-anton text-center text-xl tracking-tight sm:text-2xl">How It Works</h3>
              <ol className="mx-auto max-w-3xl list-inside list-decimal space-y-2 text-[11px] text-gray-400 sm:text-[12px] md:text-[13px]">
                <li>Load an image (never leaves your machine).</li>
                <li>Select an algorithm – ordered (Bayer, Blue Noise) or diffusion (Floyd–Steinberg family, Sierra, Stucki, etc.).</li>
                <li>Adjust threshold / resolution; optionally enable serpentine traversal for diffusion stability.</li>
                <li>(If supported) Apply or craft a palette to constrain tones & produce stylized texture.</li>
                <li>Download instantly in multiple formats — or export as SVG vector geometry.</li>
              </ol>
            </section>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-800/70 to-transparent" />

            {/* ALGORITHM COVERAGE (deep‑link enabled) */}
            <section className="w-full max-w-6xl space-y-12">
              <h3 className="font-anton text-center text-xl tracking-tight sm:text-2xl">Explore Algorithms</h3>
              <p className="mx-auto max-w-xl text-center text-[11px] leading-relaxed text-gray-500 sm:text-[12px] md:text-[13px]">Jump straight into any implementation. Compare diffusion, ordered, stochastic & experimental techniques.</p>
              <div className="space-y-12">
                {[
                  {
                    label: "Error Diffusion",
                    items: [
                      { id: 1, name: "Floyd–Steinberg" },
                      { id: 21, name: "Adaptive FS 3×3" },
                      { id: 22, name: "Adaptive FS 7×7" },
                      { id: 3, name: "Atkinson" },
                      { id: 5, name: "Stucki" },
                      { id: 4, name: "Burkes" },
                      { id: 6, name: "Sierra" },
                      { id: 13, name: "Two‑Row Sierra" },
                      { id: 12, name: "Sierra Lite" },
                      { id: 7, name: "Jarvis–Judice–Ninke" },
                      { id: 14, name: "Stevenson–Arce" },
                      { id: 18, name: "Ostromoukhov" },
                      { id: 19, name: "False Floyd–Steinberg" },
                    ],
                  },
                  {
                    label: "Ordered / Stochastic",
                    items: [
                      { id: 16, name: "Bayer 2×2" },
                      { id: 2, name: "Bayer 4×4" },
                      { id: 8, name: "Bayer 8×8" },
                      { id: 20, name: "Bayer 16×16" },
                      { id: 17, name: "Blue Noise 64×64" },
                    ],
                  },
                  {
                    label: "Other / Experimental",
                    items: [
                      { id: 9, name: "Halftone" },
                      { id: 10, name: "Random Threshold" },
                      { id: 11, name: "Dot Diffusion (Simple)" },
                      { id: 15, name: "Binary Threshold" },
                    ],
                  },
                ].map((group) => (
                  <div key={group.label} className="space-y-4">
                    <h4 className="text-center font-mono text-[10px] tracking-wide text-gray-400 uppercase">{group.label}</h4>
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4">
                      {group.items.map((a) => (
                        <Link
                          key={a.id}
                          to={`/Algorithms?algo=${a.id}`}
                          className="group relative min-w-[140px] overflow-hidden rounded-md border border-neutral-800 bg-neutral-900/40 px-3 py-2 text-center text-[10px] text-gray-300/85 transition will-change-transform hover:-translate-y-0.5 hover:border-blue-600/70 hover:bg-neutral-800/50 hover:text-gray-100 focus-visible:shadow-[var(--focus-ring)] sm:text-[11px] md:text-[12px]"
                          title={`View ${a.name} details`}
                        >
                          <span className="relative z-10 truncate">{a.name}</span>
                          <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mx-auto max-w-2xl text-center text-[11px] leading-relaxed text-gray-500 sm:text-[12px] md:text-[13px]">Click a tile to deep‑link into that algorithm’s dedicated reference page.</p>
            </section>
            <div className="h-px w-full bg-gradient-to-r from-transparent via-neutral-800/70 to-transparent" />

            {/* PRIVACY / PHILOSOPHY + OPEN SOURCE */}
            <section className="w-full max-w-5xl space-y-6">
              <h3 className="font-anton text-center text-xl tracking-tight sm:text-2xl">What is this?</h3>
              <div className="mx-auto max-w-3xl space-y-4 text-[11px] leading-relaxed text-gray-400 sm:text-[12px] md:text-[13px]">
                <p>
                  <span className="text-gray-200">Steinberg Image</span> started as a small experiment to compare classic error–diffusion kernels side by side and grew into a lightweight playground for exploring different dithering styles without friction.
                </p>
                <p>
                  It runs <span className="text-gray-200">fully client‑side</span> (no uploads, no tracking, no accounts) and is{" "}
                  <a href="https://github.com/Oslonline/steinberg-image" target="_blank" rel="noopener noreferrer" className="text-gray-200 underline decoration-neutral-600 hover:decoration-neutral-400">
                    open source (Apache 2.0)
                  </a>{" "}
                  so you can read, fork or adapt it.
                </p>
                <p>
                  Inspired in spirit by tools like{" "}
                  <a href="https://ditherit.com/" target="_blank" rel="noopener noreferrer" className="text-gray-200 underline decoration-neutral-600 hover:decoration-neutral-400">
                    Dither It
                  </a>{" "}
                  and{" "}
                  <a href="https://studioaaa.com/product/dither-boy/" target="_blank" rel="noopener noreferrer" className="text-gray-200 underline decoration-neutral-600 hover:decoration-neutral-400">
                    Dither Boy
                  </a>
                  , but meant to combine their strengths (multi‑algorithm exploration, fast iteration, palette + threshold tweaking) in one minimal, distraction‑free place.
                </p>
                <p>If it’s useful to you, a GitHub star helps visibility and future tweaks.</p>
              </div>
            </section>
          </div>
        </div>
        <footer className="mt-auto flex flex-col gap-10 border-t border-neutral-900 pt-10 pb-12">
          <div className="flex flex-col items-center gap-5">
            <Link to="/Dithering" className="clean-btn clean-btn-primary">
              Open Dithering Tool
            </Link>
            <p className="text-[10px] tracking-wide text-gray-600">Fast • Local • Open</p>
          </div>
          <div className="flex flex-col items-center gap-4 text-[10px] text-gray-500 sm:text-[11px] md:text-xs">
            <nav className="flex flex-wrap justify-center gap-6">
              <Link to="/Algorithms" className="transition-colors hover:text-gray-300">
                Algorithms
              </Link>
              <a href="https://github.com/Oslonline/steinberg-image" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-gray-300">
                GitHub
              </a>
              <a href="https://github.com/Oslonline/steinberg-image/blob/main/LICENSE" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-gray-300">
                License
              </a>
            </nav>
            <p className="flex items-center gap-1">
              By{" "}
              <a className="text-blue-300 duration-100 hover:text-blue-500" href="https://oslo418.com" rel="noopener noreferrer">
                Oslo418
              </a>{" "}
              • Apache 2.0
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Home;
