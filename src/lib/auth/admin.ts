import { cookies } from "next/headers";

import { getSupabaseServerClient } from "../supabase/server";

import { ADMIN_USER_PREVIEW_COOKIE, readAdminUserPreviewCookie } from "./adminPreview";



export async function getCurrentUserProfile() {

  const supabase = await getSupabaseServerClient();

  if (!supabase) return null;



  const {

    data: { user },

  } = await supabase.auth.getUser();

  if (!user) return null;



  const { data: profile } = await supabase

    .from("profiles")

    .select("id, username, role, avatar_path, bio, social_links, created_at")

    .eq("id", user.id)

    .maybeSingle();



  return profile ? { user, profile } : { user, profile: null };

}



export async function isActualAdmin(): Promise<boolean> {

  const ctx = await getCurrentUserProfile();

  return ctx?.profile?.role === "admin";

}



export async function isAdminUserPreviewEnabled(): Promise<boolean> {

  const cookieStore = await cookies();

  return readAdminUserPreviewCookie(cookieStore.get(ADMIN_USER_PREVIEW_COOKIE)?.value);

}



/** Admin privileges for moderation, delete, auto-approve, etc. */

export async function isCurrentUserAdmin(): Promise<boolean> {

  if (!(await isActualAdmin())) return false;

  return !(await isAdminUserPreviewEnabled());

}



export async function shouldAutoApproveGalleryPublish(profileRole: string): Promise<boolean> {

  if (profileRole !== "admin") return false;

  return !(await isAdminUserPreviewEnabled());

}



/** Admin API routes — requires signed-in user with admin role (preview mode still allowed). */

export async function requireActualAdminApi(): Promise<
  | { ok: true; supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>; user: { id: string } }
  | { ok: false; status: number; message: string }
> {
  const supabase = await getSupabaseServerClient();

  if (!supabase) {
    return { ok: false, status: 503, message: "Not configured." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, status: 401, message: "Unauthorized." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    return { ok: false, status: 403, message: "Forbidden." };
  }

  return { ok: true, supabase, user };
}


