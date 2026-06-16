"use client";

import { useMemo } from "react";
import { Link } from "../../lib/nextRouterCompat";
import type { GalleryItemPublic } from "../../lib/gallery/types";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

interface GalleryMasonryProps {
  items: GalleryItemPublic[];
}

export default function GalleryMasonry({ items }: GalleryMasonryProps) {
  const lang = normalizeLang(typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "en");

  const sizedItems = useMemo(
    () =>
      items.map((item) => {
        const ratio =
          item.preview_width && item.preview_height
            ? item.preview_height / item.preview_width
            : 0.75 + (item.id.charCodeAt(0) % 5) * 0.12;
        return { item, ratio };
      }),
    [items],
  );

  return (
    <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 2xl:columns-4 [column-fill:balance]">
      {sizedItems.map(({ item, ratio }) => (
        <Link
          key={item.id}
          to={withLangPrefix(`/Gallery/${item.id}`, lang)}
          className="group relative mb-4 block break-inside-avoid overflow-hidden rounded-lg border border-neutral-800/80 bg-[#0d0d0d]"
        >
          <div style={{ aspectRatio: `1 / ${Math.min(1.6, Math.max(0.55, ratio))}` }} className="relative w-full">
            <img
              src={item.preview_url}
              alt={item.description ?? item.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/45" />
            <div className="absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              {item.description && (
                <p className="mb-1 line-clamp-2 text-[10px] leading-snug text-gray-200">{item.description}</p>
              )}
              <p className="text-[10px] text-gray-400">@{item.author_username}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
