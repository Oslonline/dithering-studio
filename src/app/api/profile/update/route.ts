import { NextResponse, type NextRequest } from "next/server";
import { getProfile } from "../../../../lib/auth/profile";
import { USERNAME_REGEX } from "../../../../lib/auth/types";
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

  const bio = typeof body.bio === "string" ? body.bio.trim().slice(0, 280) : null;
  const social_links: ProfileSocialLinks = {
    x: sanitizeUrl(body.social_links?.x),
    figma: sanitizeUrl(body.social_links?.figma),
    cosmos: sanitizeUrl(body.social_links?.cosmos),
  };

  const patch: {
    bio: string | null;
    social_links: ProfileSocialLinks;
    username?: string;
  } = { bio: bio || null, social_links };

  if (typeof body.username === "string") {
    const username = body.username.trim();
    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json({ error: "username_format" }, { status: 400 });
    }

    const existing = await getProfile(supabase, user.id);
    const currentUsername = existing.data?.username?.trim() ?? "";
    if (!currentUsername || currentUsername.toLowerCase() !== username.toLowerCase()) {
      patch.username = username;
    }
  }

  const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "username_taken" }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not update profile." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
