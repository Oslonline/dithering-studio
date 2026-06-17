import { NextResponse } from "next/server";

import { requireActualAdminApi } from "../../../../../lib/auth/admin";
import { slugifyTitle } from "../../../../../lib/devblog/slug";
import type { DevBlogPostRow } from "../../../../../lib/devblog/types";

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
  exceptId: string,
) {
  await supabase.from("dev_blog_posts").update({ show_home_banner: false }).eq("show_home_banner", true).neq("id", exceptId);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireActualAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
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

  const { data: existing } = await auth.supabase.from("dev_blog_posts").select("published, published_at").eq("id", id).maybeSingle();
  if (!existing) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  if (parsed.show_home_banner) {
    await clearOtherHomeBanners(auth.supabase, id);
  }

  const publishedAt =
    parsed.published && !existing.published ? new Date().toISOString() : existing.published_at ?? (parsed.published ? new Date().toISOString() : null);

  const { data, error } = await auth.supabase
    .from("dev_blog_posts")
    .update({
      title: parsed.title,
      slug: parsed.slug,
      summary: parsed.summary,
      body: parsed.body,
      published: parsed.published,
      show_home_banner: parsed.show_home_banner,
      banner_label: parsed.banner_label,
      published_at: parsed.published ? publishedAt : null,
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("[admin/devblog] update failed:", error.message);
    const message = error.code === "23505" ? "Slug already exists." : "Could not update post.";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ post: data as DevBlogPostRow });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireActualAdminApi();
  if (!auth.ok) {
    return NextResponse.json({ error: auth.message }, { status: auth.status });
  }

  const { id } = await params;
  if (!id) {
    return NextResponse.json({ error: "Missing id." }, { status: 400 });
  }

  const { error } = await auth.supabase.from("dev_blog_posts").delete().eq("id", id);
  if (error) {
    console.error("[admin/devblog] delete failed:", error.message);
    return NextResponse.json({ error: "Could not delete post." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
