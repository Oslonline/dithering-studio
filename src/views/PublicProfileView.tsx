"use client";

import Header from "../components/ui/Header";
import SiteFooter from "../components/ui/SiteFooter";
import GalleryMasonry from "../components/gallery/GalleryMasonry";
import { Link } from "../lib/nextRouterCompat";
import type { GalleryItemPublic, ProfilePublic } from "../lib/gallery/types";
import { normalizeLang, withLangPrefix } from "../utils/localePath";

interface PublicProfileViewProps {
  profile: ProfilePublic;
  items: GalleryItemPublic[];
}

export default function PublicProfileView({ profile, items }: PublicProfileViewProps) {
  const lang = normalizeLang(typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "en");
  const links = profile.social_links;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-50">
      <Header />
      <main id="main-content" className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col gap-8 px-4 py-10 md:px-8">
        <section className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-20 w-20 rounded-full border border-neutral-700 object-cover" />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-2xl font-medium">
              {profile.username.slice(0, 1).toUpperCase()}
            </span>
          )}
          <div className="space-y-2">
            <h1 className="font-anton text-3xl tracking-tight text-gray-100">@{profile.username}</h1>
            {profile.bio && <p className="max-w-xl text-sm leading-relaxed text-gray-400">{profile.bio}</p>}
            <div className="flex flex-wrap gap-3 text-xs">
              {links.x && (
                <a href={links.x} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-200">
                  X
                </a>
              )}
              {links.figma && (
                <a href={links.figma} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-200">
                  Figma
                </a>
              )}
              {links.cosmos && (
                <a href={links.cosmos} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-gray-200">
                  Cosmos
                </a>
              )}
            </div>
            <p className="text-[10px] text-gray-600">
              Member since {new Date(profile.created_at).toLocaleDateString()}
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-medium tracking-wide text-gray-300">Gallery</h2>
          {items.length === 0 ? (
            <p className="text-sm text-gray-500">No public gallery posts yet.</p>
          ) : (
            <GalleryMasonry items={items} />
          )}
        </section>

        <Link to={withLangPrefix("/Gallery", lang)} className="clean-btn w-fit px-4 py-2 text-[11px]">
          Browse gallery
        </Link>

        <SiteFooter />
      </main>
    </div>
  );
}
