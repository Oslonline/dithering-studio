import { NextResponse } from "next/server";

import { requireActualAdminApi } from "../../../../lib/auth/admin";
import { slugifyTitle } from "../../../../lib/devblog/slug";
import type { DevBlogPostRow } from "../../../../lib/devblog/types";

function parseBody(body: unknown): {
  title: string;
  slug: string;
  summary: string;
  body: string;
  published: boolean;
  show_home_banner: boolean;
  banner_label: string | null;
} | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Record<string, unknown>;
  const title = typeof raw.title === "string" ? raw.title.trim() : "";
  const slugRaw = typeof raw.slug === "string" ? raw.slug.trim() : "";
  const summary = typeof raw.summary === "string" ? raw.summary.trim() : "";
  const content = typeof raw.body === "string" ? raw.body.trim() : "";
  if (!title || !summary || !content) return null;
  const slug = slugRaw || slugifyTitle(title);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  return {
    title,
    slug,
    summary,
    body: content,
    published: raw.published === true,
    show_home_banner: raw.show_home_banner === true,
    banner_label: typeof raw.banner_label === "string" && raw.banner_label.trim() ? raw.banner_label.trim() : null,
  };
}

async function clearOtherHomeBanners(
  supabase: Extract<Awaited<ReturnType<typeof requireActualAdminApi>>, { ok: true }>["supabase"],
  exceptId?: string,
) {
  if (!supabase) return;
  let query = supabase.from("dev_blog_posts").update({ show_home_banner: false }).eq("show_home_banner", true);
  if (exceptId) query = query.neq("id", exceptId);
  await query;
}

export async function POST(request: Request) {
  const auth = await requireActualAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = parseBody(json);
  if (!parsed) {
    return NextResponse.json({ error: "Invalid post fields." }, { status: 400 });
  }

  if (parsed.show_home_banner && !parsed.published) {
    return NextResponse.json({ error: "Only published posts can use the homepage banner." }, { status: 400 });
  }

  if (parsed.show_home_banner) {
    await clearOtherHomeBanners(auth.supabase);
  }

  const now = new Date().toISOString();
  const { data, error } = await auth.supabase
    .from("dev_blog_posts")
    .insert({
      author_id: auth.user.id,
      title: parsed.title,
      slug: parsed.slug,
      summary: parsed.summary,
      body: parsed.body,
      published: parsed.published,
      show_home_banner: parsed.show_home_banner,
      banner_label: parsed.banner_label,
      published_at: parsed.published ? now : null,
    })
    .select("*")
    .single();

  if (error) {
    console.error("[admin/devblog] insert failed:", error.message);
    const message = error.code === "23505" ? "Slug already exists." : "Could not create post.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ post: data as DevBlogPostRow });
}
