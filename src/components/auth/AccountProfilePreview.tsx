"use client";

import { Link } from "../../lib/nextRouterCompat";
import type { ProfileSocialLinks } from "../../lib/gallery/types";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

interface AccountProfilePreviewProps {
  lang: string;
  username: string;
  bio: string;
  avatarUrl: string | null;
  socialLinks: ProfileSocialLinks;
  galleryPostsCount: number;
  onEditProfile: () => void;
}

export default function AccountProfilePreview({
  lang,
  username,
  bio,
  avatarUrl,
  socialLinks,
  galleryPostsCount,
  onEditProfile,
}: AccountProfilePreviewProps) {
  const normalizedLang = normalizeLang(lang);
  const hasUsername = username.trim().length > 0;
  const displayBio = bio.trim() || "Add a short bio so visitors know what you create.";
  const initial = hasUsername ? username.slice(0, 1).toUpperCase() : "?";

  return (
    <div className="rounded-lg border border-neutral-800 bg-[#0d0d0d] p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[10px] uppercase tracking-wide text-gray-500">Public profile preview</p>
        <button type="button" onClick={onEditProfile} className="text-[10px] text-gray-400 underline-offset-2 hover:text-gray-200 hover:underline">
          Edit profile
        </button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="h-16 w-16 shrink-0 rounded-full border border-neutral-700 object-cover" />
        ) : (
          <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-lg font-medium text-gray-400">
            {initial}
          </span>
        )}

        <div className="min-w-0 flex-1 space-y-2">
          <h3 className="font-anton text-xl tracking-tight text-gray-100">
            {hasUsername ? `@${username}` : "Choose a username"}
          </h3>
          <p className={`text-[12px] leading-relaxed ${bio.trim() ? "text-gray-400" : "text-gray-600 italic"}`}>
            {displayBio}
          </p>

          {(socialLinks.x || socialLinks.figma || socialLinks.cosmos) && (
            <div className="flex flex-wrap gap-2 text-[10px] text-gray-500">
              {socialLinks.x && <span>X linked</span>}
              {socialLinks.figma && <span>Figma linked</span>}
              {socialLinks.cosmos && <span>Cosmos linked</span>}
            </div>
          )}

          <p className="text-[10px] text-gray-600">
            {galleryPostsCount === 0
              ? "No gallery posts yet"
              : `${galleryPostsCount} public gallery ${galleryPostsCount === 1 ? "post" : "posts"}`}
          </p>
        </div>
      </div>

      {hasUsername && (
        <Link
          to={withLangPrefix(`/u/${username}`, normalizedLang)}
          className="clean-btn mt-4 inline-flex px-3 py-1.5 text-[10px]"
        >
          View public page
        </Link>
      )}
    </div>
  );
}
