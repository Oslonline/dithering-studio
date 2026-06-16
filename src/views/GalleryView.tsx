"use client";

import Header from "../components/ui/Header";
import SiteFooter from "../components/ui/SiteFooter";
import GalleryMasonry from "../components/gallery/GalleryMasonry";
import { Link } from "../lib/nextRouterCompat";
import type { GalleryItemPublic } from "../lib/gallery/types";
import { normalizeLang, withLangPrefix } from "../utils/localePath";

interface GalleryViewProps {
  items: GalleryItemPublic[];
  sort: "latest" | "popular";
  enabled: boolean;
  configured: boolean;
}

export default function GalleryView({ items, sort, enabled, configured }: GalleryViewProps) {
  const lang = normalizeLang(typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "en");

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-50">
      <Header activeNav="gallery" />
      <main id="main-content" className="mx-auto flex w-full max-w-[1400px] flex-1 flex-col gap-8 px-4 pt-10 md:px-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Community</p>
            <h1 className="font-anton text-3xl tracking-tight text-gray-100 sm:text-4xl">Gallery</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-gray-400">
              Discover community creations. Open any piece to compare, vote, and reuse its settings.
            </p>
          </div>
          {enabled && configured && (
            <div className="flex gap-1 rounded-md border border-neutral-800 bg-neutral-900/40 p-0.5">
              <Link
                to={withLangPrefix("/Gallery?sort=popular", lang)}
                className={`rounded px-3 py-1.5 text-[10px] font-medium tracking-wide ${sort === "popular" ? "bg-blue-600/90 text-white" : "text-gray-400 hover:text-gray-200"}`}
              >
                Popular
              </Link>
              <Link
                to={withLangPrefix("/Gallery?sort=latest", lang)}
                className={`rounded px-3 py-1.5 text-[10px] font-medium tracking-wide ${sort === "latest" ? "bg-blue-600/90 text-white" : "text-gray-400 hover:text-gray-200"}`}
              >
                Latest
              </Link>
            </div>
          )}
        </header>

        {!enabled && (
          <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-6 text-sm text-gray-400">
            The community gallery is disabled in this environment.
          </section>
        )}

        {enabled && !configured && (
          <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-6 text-sm text-gray-400">
            Gallery requires Supabase configuration.
          </section>
        )}

        {enabled && configured && items.length === 0 && (
          <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-6 text-sm text-gray-400">
            No approved creations yet. Share from the dithering tool to get started.
          </section>
        )}

        {enabled && configured && items.length > 0 && <GalleryMasonry items={items} />}

        <SiteFooter />
      </main>
    </div>
  );
}
