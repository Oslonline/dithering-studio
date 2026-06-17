import { getSupabaseAdminClient } from "../supabase/admin";
import { getSupabaseServerClient } from "../supabase/server";
import type { DevBlogPostPublic, DevBlogPostRow, HomeBannerPost } from "./types";

function mapPublic(row: DevBlogPostRow): DevBlogPostPublic {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    summary: row.summary,
    body: row.body,
    banner_label: row.banner_label,
    published_at: row.published_at,
    created_at: row.created_at,
  };
}

export async function listPublishedDevBlogPosts(limit = 24): Promise<DevBlogPostPublic[]> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("dev_blog_posts")
    .select("*")
    .eq("published", true)
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as DevBlogPostRow[]).map(mapPublic);
}

export async function getPublishedDevBlogPostBySlug(slug: string): Promise<DevBlogPostPublic | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("dev_blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error || !data) return null;
  return mapPublic(data as DevBlogPostRow);
}

export async function getActiveHomeBannerPost(): Promise<HomeBannerPost | null> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("dev_blog_posts")
    .select("id, title, slug, summary, banner_label")
    .eq("published", true)
    .eq("show_home_banner", true)
    .maybeSingle();

  if (error || !data) return null;
  return data as HomeBannerPost;
}

export async function listAllDevBlogPostsForAdmin(): Promise<DevBlogPostRow[]> {
  const admin = getSupabaseAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("dev_blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as DevBlogPostRow[];
}
