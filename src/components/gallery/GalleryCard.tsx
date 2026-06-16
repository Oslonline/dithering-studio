"use client";

import { useTranslation } from "react-i18next";
import { Link } from "../../lib/nextRouterCompat";
import { findAlgorithm } from "../../utils/algorithms";
import { buildToolUrlFromSettings } from "../../lib/gallery/settings";
import type { GalleryItemPublic } from "../../lib/gallery/types";
import { normalizeLang } from "../../utils/localePath";

interface GalleryCardProps {
  item: GalleryItemPublic;
}

export default function GalleryCard({ item }: GalleryCardProps) {
  const { i18n } = useTranslation();
  const lang = normalizeLang(i18n.language);
  const algorithm = findAlgorithm(item.settings.pattern);
  const templateUrl = buildToolUrlFromSettings(item.settings, lang);

  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/40 transition-colors hover:border-neutral-700">
      <Link to={templateUrl} className="relative block aspect-[4/3] overflow-hidden bg-[#0d0d0d]">
        <img
          src={item.preview_url}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        {item.settings.mode === "video" && (
          <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[9px] uppercase tracking-wide text-gray-200">
            Video
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h2 className="text-sm font-medium tracking-wide text-gray-200">{item.title}</h2>
        <p className="text-[11px] text-gray-500">
          {item.author_username} · {algorithm?.name ?? "Custom"}
        </p>
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <Link to={templateUrl} className="clean-btn clean-btn-primary px-3 py-1.5 text-[10px]">
            Use settings
          </Link>
          <Link
            to={`/${lang}/Gallery/${item.id}`}
            className="clean-btn px-3 py-1.5 text-[10px]"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}
