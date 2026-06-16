import { type NextRequest, NextResponse } from "next/server";
import { getProfile } from "../../../lib/auth/profile";
import { getSupabaseAdminClient } from "../../../lib/supabase/admin";
import { getSupabaseServerClient } from "../../../lib/supabase/server";
import { normalizeLang, withLangPrefix } from "../../../utils/localePath";

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const admin = getSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "Account deletion is unavailable. Set SUPABASE_SERVICE_ROLE_KEY on the server." },
      { status: 503 },
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "You must be signed in to delete your account." }, { status: 401 });
  }

  let body: { confirmation?: string; lang?: string };
  try {
    body = (await request.json()) as { confirmation?: string; lang?: string };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const lang = normalizeLang(body.lang);
  const confirmation = body.confirmation?.trim() ?? "";

  const profile = (await getProfile(supabase, user.id)).data;
  const username = profile?.username?.trim() ?? "";
  const expected = username || user.email?.trim() || user.id;

  if (!confirmation || confirmation !== expected) {
    return NextResponse.json({ error: "Confirmation text does not match." }, { status: 400 });
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    return NextResponse.json({ error: "Could not delete account. Please try again." }, { status: 500 });
  }

  await supabase.auth.signOut();

  const homePath = withLangPrefix("/", lang);
  const response = NextResponse.json({ ok: true, redirectTo: homePath });
  return response;
}
