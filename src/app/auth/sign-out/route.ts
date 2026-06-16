import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "../../../lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  const requestUrl = new URL(request.url);
  const redirectTo = requestUrl.searchParams.get("redirectTo") ?? "/en/";
  return NextResponse.redirect(new URL(redirectTo, request.url), { status: 303 });
}
