import { getSupabaseAdminClient } from "../supabase/admin";

import { getSupabaseServerClient } from "../supabase/server";

import { getSupabaseClientConfig } from "../supabase/config";

import {

  buildToolUrlFromSettings,

  getAvatarPublicUrl,

  getGalleryPreviewPublicUrl,

  resolveProfileLinks,

} from "./settings";

import type { GalleryItemPublic, GalleryItemRow, GallerySettingsV1, GallerySort, ProfilePublic } from "./types";



type ProfileJoin = {

  username: string | null;

  avatar_path: string | null;

};



type ProfileClient = Pick<NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>, "from">;



function logGalleryQueryError(scope: string, error: { message?: string; code?: string } | null) {

  if (error) {

    console.error(`[gallery] ${scope}:`, error.message ?? error.code ?? error);

  }

}



function toPublicItem(row: GalleryItemRow, profile: ProfileJoin): GalleryItemPublic | null {

  const config = getSupabaseClientConfig();

  if (!config) return null;

  const settings = row.settings as GallerySettingsV1;

  return {

    ...row,

    settings,

    author_username: profile.username?.trim() || "anonymous",

    author_avatar_url: profile.avatar_path

      ? getAvatarPublicUrl(config.url, profile.avatar_path)

      : null,

    preview_url: getGalleryPreviewPublicUrl(config.url, row.preview_path),

    original_url: row.original_path

      ? getGalleryPreviewPublicUrl(config.url, row.original_path)

      : null,

  };

}



async function fetchProfilesForAuthors(

  supabase: ProfileClient,

  authorIds: string[],

): Promise<Map<string, ProfileJoin>> {

  const unique = [...new Set(authorIds.filter(Boolean))];

  if (!unique.length) return new Map();



  const { data, error } = await supabase

    .from("profiles")

    .select("id, username, avatar_path")

    .in("id", unique);



  if (error || !data) {

    logGalleryQueryError("fetchProfilesForAuthors", error);

    return new Map();

  }



  return new Map(

    data.map((profile) => [

      profile.id,

      { username: profile.username, avatar_path: profile.avatar_path },

    ]),

  );

}



async function enrichGalleryRows(

  supabase: ProfileClient,

  rows: GalleryItemRow[],

): Promise<GalleryItemPublic[]> {

  const profileMap = await fetchProfilesForAuthors(

    supabase,

    rows.map((row) => row.author_id),

  );



  return rows

    .map((row) => {

      const profile = profileMap.get(row.author_id) ?? { username: null, avatar_path: null };

      return toPublicItem(row, profile);

    })

    .filter((item): item is GalleryItemPublic => item !== null);

}



export async function listPublicGalleryItems(

  sort: GallerySort = "latest",

  limit = 48,

): Promise<GalleryItemPublic[]> {

  const supabase = await getSupabaseServerClient();

  if (!supabase) return [];



  let query = supabase

    .from("gallery_items")

    .select("*")

    .eq("status", "approved")

    .eq("is_public", true)

    .limit(limit);



  query =

    sort === "popular"

      ? query.order("rank_score", { ascending: false }).order("created_at", { ascending: false })

      : query.order("created_at", { ascending: false });



  const { data, error } = await query;

  if (error || !data) {

    logGalleryQueryError("listPublicGalleryItems", error);

    return [];

  }



  return enrichGalleryRows(supabase, data as GalleryItemRow[]);

}



export async function listGalleryItemsByAuthor(authorId: string, limit = 24): Promise<GalleryItemPublic[]> {

  const supabase = await getSupabaseServerClient();

  if (!supabase) return [];



  const { data, error } = await supabase

    .from("gallery_items")

    .select("*")

    .eq("author_id", authorId)

    .eq("status", "approved")

    .eq("is_public", true)

    .order("created_at", { ascending: false })

    .limit(limit);



  if (error || !data) {

    logGalleryQueryError("listGalleryItemsByAuthor", error);

    return [];

  }



  return enrichGalleryRows(supabase, data as GalleryItemRow[]);

}



export async function listGalleryItemsByUsername(username: string, limit = 24): Promise<GalleryItemPublic[]> {

  const profile = await getProfileByUsername(username);

  if (!profile) return [];

  return listGalleryItemsByAuthor(profile.id, limit);

}



export async function getGalleryItemById(id: string): Promise<GalleryItemPublic | null> {

  const supabase = await getSupabaseServerClient();

  if (!supabase) return null;



  const { data, error } = await supabase

    .from("gallery_items")

    .select("*")

    .eq("id", id)

    .eq("status", "approved")

    .eq("is_public", true)

    .maybeSingle();



  if (error || !data) {

    logGalleryQueryError("getGalleryItemById", error);

    return null;

  }



  const row = data as GalleryItemRow;

  const profileMap = await fetchProfilesForAuthors(supabase, [row.author_id]);

  const profile = profileMap.get(row.author_id) ?? { username: null, avatar_path: null };

  return toPublicItem(row, profile);

}



export async function listPendingGalleryItems(limit = 50): Promise<GalleryItemPublic[]> {

  const admin = getSupabaseAdminClient();

  if (!admin) return [];



  const { data, error } = await admin

    .from("gallery_items")

    .select("*")

    .eq("status", "pending")

    .order("created_at", { ascending: true })

    .limit(limit);



  if (error || !data) {

    logGalleryQueryError("listPendingGalleryItems", error);

    return [];

  }



  const profileMap = await fetchProfilesForAuthors(admin, (data as GalleryItemRow[]).map((row) => row.author_id));

  return (data as GalleryItemRow[])

    .map((row) => {

      const profile = profileMap.get(row.author_id) ?? { username: null, avatar_path: null };

      return toPublicItem(row, profile);

    })

    .filter((item): item is GalleryItemPublic => item !== null);

}



export async function listRecentGalleryItems(limit = 12): Promise<GalleryItemPublic[]> {

  const admin = getSupabaseAdminClient();

  if (!admin) return [];



  const { data, error } = await admin

    .from("gallery_items")

    .select("*")

    .order("created_at", { ascending: false })

    .limit(limit);



  if (error || !data) {

    logGalleryQueryError("listRecentGalleryItems", error);

    return [];

  }



  const profileMap = await fetchProfilesForAuthors(admin, (data as GalleryItemRow[]).map((row) => row.author_id));

  return (data as GalleryItemRow[])

    .map((row) => {

      const profile = profileMap.get(row.author_id) ?? { username: null, avatar_path: null };

      return toPublicItem(row, profile);

    })

    .filter((item): item is GalleryItemPublic => item !== null);

}



export async function getProfileByUsername(username: string): Promise<ProfilePublic | null> {

  const supabase = await getSupabaseServerClient();

  const config = getSupabaseClientConfig();

  if (!supabase || !config) return null;



  const { data, error } = await supabase

    .from("profiles")

    .select("id, username, avatar_path, bio, social_links, created_at")

    .ilike("username", username)

    .maybeSingle();



  if (error || !data?.username) {

    logGalleryQueryError("getProfileByUsername", error);

    return null;

  }



  return {

    id: data.id,

    username: data.username,

    avatar_url: data.avatar_path ? getAvatarPublicUrl(config.url, data.avatar_path) : null,

    bio: data.bio,

    social_links: resolveProfileLinks(data.social_links),

    created_at: data.created_at,

  };

}



export function templateUrlForItem(item: GalleryItemPublic, lang: string): string {
  return buildToolUrlFromSettings(item.settings, lang);
}

export async function getUserVoteForItem(
  userId: string | null | undefined,
  itemId: string,
): Promise<1 | -1 | null> {
  if (!userId) return null;

  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("gallery_votes")
    .select("vote")
    .eq("user_id", userId)
    .eq("gallery_item_id", itemId)
    .maybeSingle();

  if (error || !data) return null;
  return data.vote === 1 || data.vote === -1 ? data.vote : null;
}
