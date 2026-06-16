export const GALLERY_SETTINGS_VERSION = 1 as const;
export const GALLERY_PREVIEW_BUCKET = "gallery-previews";
export const AVATARS_BUCKET = "avatars";

export type GalleryItemStatus = "pending" | "approved" | "rejected";
export type GallerySort = "latest" | "popular";

export interface ProfileSocialLinks {
  x?: string;
  figma?: string;
  cosmos?: string;
}

export interface GallerySettingsV1 {
  version: typeof GALLERY_SETTINGS_VERSION;
  pattern: number;
  threshold: number;
  workingResolution: number;
  contrast: number;
  midtones: number;
  highlights: number;
  blurRadius: number;
  paletteId: string | null;
  customPalette: [number, number, number][] | null;
  invert: boolean;
  serpentine: boolean;
  asciiRamp: string;
  mode: "image" | "video";
}

export interface GalleryItemRow {
  id: string;
  author_id: string;
  title: string;
  description: string | null;
  settings: GallerySettingsV1;
  settings_version: number;
  preview_path: string;
  original_path: string | null;
  preview_width: number | null;
  preview_height: number | null;
  status: GalleryItemStatus;
  is_public: boolean;
  upvote_count: number;
  downvote_count: number;
  rank_score: number;
  created_at: string;
  updated_at: string;
}

export interface ProfilePublic {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  social_links: ProfileSocialLinks;
  created_at: string;
}

export interface GalleryItemPublic extends GalleryItemRow {
  author_username: string;
  author_avatar_url: string | null;
  preview_url: string;
  original_url: string | null;
  settings: GallerySettingsV1;
}
