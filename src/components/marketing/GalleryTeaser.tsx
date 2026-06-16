"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "../../lib/nextRouterCompat";
import { buildToolUrlFromSettings } from "../../lib/gallery/settings";
import type { GalleryItemPublic } from "../../lib/gallery/types";
import { HOME_GALLERY_TEASER_COUNT } from "../../lib/gallery/teaser";
import { normalizeLang, withLangPrefix, type SupportedLanguage } from "../../utils/localePath";

interface GalleryTeaserProps {
  items: GalleryItemPublic[];
}

function previewAspect(item: GalleryItemPublic): number {
  if (item.preview_width && item.preview_height) {
    return item.preview_height / item.preview_width;
  }
  return 0.75 + (item.id.charCodeAt(0) % 5) * 0.12;
}

interface TeaserTileProps {
  item: GalleryItemPublic;
  ratio: number;
  lang: SupportedLanguage;
}

/** Same sizing as GalleryMasonry — height from aspect ratio, no cap. */
function TeaserTile({ item, ratio, lang }: TeaserTileProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const detailUrl = withLangPrefix(`/Gallery/${item.id}`, lang);
  const templateUrl = buildToolUrlFromSettings(item.settings, lang);
  const caption = item.description?.trim() || item.title;
  const aspect = Math.min(1.6, Math.max(0.55, ratio));

  return (
    <Link
      to={detailUrl}
      className="group relative mb-3 block break-inside-avoid overflow-hidden rounded-lg border border-neutral-800/80 bg-[#0d0d0d] sm:mb-4"
      aria-label={caption}
    >
      <div style={{ aspectRatio: `1 / ${aspect}` }} className="relative w-full">
        <img src={item.preview_url} alt={caption} loading="lazy" className="h-full w-full object-cover" />

        <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/45" />

        <div className="absolute inset-x-0 bottom-0 translate-y-2 p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {caption && <p className="mb-1 line-clamp-2 text-[10px] leading-snug text-gray-200">{caption}</p>}
          <p className="text-[10px] text-gray-400">@{item.author_username}</p>
          <button
            type="button"
            className="mt-1.5 text-[10px] text-blue-300/90 underline decoration-blue-500/40 underline-offset-2 hover:text-blue-200"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(templateUrl);
            }}
          >
            {t("home.gallery.useTemplate")}
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function GalleryTeaser({ items }: GalleryTeaserProps) {
  const { t, i18n } = useTranslation();
  const lang = normalizeLang(i18n.language);

  const sizedTiles = useMemo(
    () =>
      items.slice(0, HOME_GALLERY_TEASER_COUNT).map((item) => ({
        item,
        ratio: previewAspect(item),
      })),
    [items],
  );

  if (!sizedTiles.length) return null;

  return (
    <section className="w-full max-w-5xl space-y-6 2xl:max-w-6xl">
      <div className="space-y-2 text-center">
        <h2 className="font-anton text-xl tracking-tight sm:text-2xl">{t("home.gallery.title")}</h2>
        <p className="mx-auto max-w-xl text-[11px] leading-relaxed text-gray-500 sm:text-[12px]">
          {t("home.gallery.subtitle")}
        </p>
      </div>

      <div className="columns-2 gap-3 sm:gap-4 lg:columns-3 2xl:columns-4 [column-fill:balance]">
        {sizedTiles.map(({ item, ratio }) => (
          <TeaserTile key={item.id} item={item} ratio={ratio} lang={lang} />
        ))}
      </div>

      <p className="text-center">
        <Link
          to={withLangPrefix("/Gallery", lang)}
          className="text-[11px] text-gray-500 underline decoration-gray-700 underline-offset-4 transition-colors hover:text-gray-300 hover:decoration-gray-500"
        >
          {t("home.gallery.browse")} →
        </Link>
      </p>
    </section>
  );
}
