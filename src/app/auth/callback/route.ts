import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { normalizeLang } from "../../../utils/localePath";
import { getSupabaseServerConfig } from "../../../lib/supabase/config";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/en/Account";
  const nextPath = next.startsWith("/") ? next : `/${next}`;
  const config = getSupabaseServerConfig();
  const lang = normalizeLang(requestUrl.searchParams.get("lang"));

  if (!config) {
    return NextResponse.redirect(new URL(`/${lang}/Account?authError=config`, request.url));
  }
  if (!code) {
    return NextResponse.redirect(new URL(`/${lang}/Account?authError=missing_code`, request.url));
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url));

  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL(`/${lang}/Account?authError=exchange_failed`, request.url));
  }
  return response;
}
