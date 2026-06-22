import { NextResponse, type NextRequest } from "next/server";
import { ensureProfileFromUser, getProfile } from "../../../../lib/auth/profile";
import { normalizeUsername } from "../../../../lib/auth/username";
import type { ProfileSocialLinks } from "../../../../lib/gallery/types";
import { getSupabaseServerClient } from "../../../../lib/supabase/server";

function sanitizeUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    if (!["http:", "https:"].includes(url.protocol)) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Not configured." }, { status: 503 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  await ensureProfileFromUser(supabase, user);

  let body: { bio?: string; social_links?: ProfileSocialLinks; username?: string };
  try {
    body = (await request.json()) as {
      bio?: string;
      social_links?: ProfileSocialLinks;
      username?: string;
    };
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const bio =
    typeof body.bio === "string" ? body.bio.trim().slice(0, 280) || null : undefined;
  const social_links: ProfileSocialLinks | undefined =
    body.social_links !== undefined
      ? {
          x: sanitizeUrl(body.social_links?.x),
          figma: sanitizeUrl(body.social_links?.figma),
          cosmos: sanitizeUrl(body.social_links?.cosmos),
        }
      : undefined;

  const patch: {
    bio?: string | null;
    social_links?: ProfileSocialLinks;
    username?: string;
  } = {};

  if (bio !== undefined) patch.bio = bio;
  if (social_links !== undefined) patch.social_links = social_links;

  if (typeof body.username === "string") {
    const username = normalizeUsername(body.username);
    if (!username) {
      return NextResponse.json({ error: "username_format" }, { status: 400 });
    }

    const existing = await getProfile(supabase, user.id);
    const currentUsername = existing.data?.username?.trim().toLowerCase() ?? "";
    if (!currentUsername || currentUsername !== username) {
      patch.username = username;
    }
  }

  if (Object.keys(patch).length === 0) {
    const current = await getProfile(supabase, user.id);
    const savedUsername = current.data?.username?.trim() ?? "";
    if (savedUsername) {
      return NextResponse.json({ ok: true, username: savedUsername });
    }
    return NextResponse.json({ error: "Nothing to update." }, { status: 400 });
  }

  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "username_taken" }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not update profile." }, { status: 500 });
  }

  const updated = await getProfile(supabase, user.id);
  return NextResponse.json({
    ok: true,
    username: updated.data?.username?.trim() ?? patch.username ?? null,
  });
}
