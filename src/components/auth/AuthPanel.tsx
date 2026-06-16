"use client";

import { useState } from "react";
import { Link } from "../../lib/nextRouterCompat";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.178 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.021C22 6.484 17.522 2 12 2z"
      />
    </svg>
  );
}

const oauthBtnClass =
  "flex w-full items-center justify-center gap-2.5 rounded-md border border-neutral-700 bg-neutral-900/80 px-4 py-3 text-[12px] font-medium text-gray-100 transition-colors";

export default function AuthPanel({ lang }: { lang: string }) {
  const normalizedLang = normalizeLang(lang);
  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const nextPath = withLangPrefix("/Account", normalizedLang);

  const signInWithOAuth = async (provider: "github") => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setMessage(
        "Client auth config missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      );
      return;
    }
    setLoading(provider);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}&lang=${encodeURIComponent(normalizedLang)}`,
      },
    });
    if (error) setMessage(error.message);
    setLoading(null);
  };

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.65)] sm:p-8">
      <div className="space-y-6">
        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-base font-medium text-gray-100">Sign in to your account</h2>
          <p className="text-xs leading-relaxed text-gray-500">
            Use GitHub to access gallery publishing, presets, and your public profile. The core tool stays
            free with no login required.
          </p>
        </div>

        <div className="space-y-3">
          <div className="group relative">
            <button
              type="button"
              aria-disabled="true"
              className={`${oauthBtnClass} cursor-not-allowed border-neutral-800 text-gray-500 opacity-60`}
              onClick={(e) => e.preventDefault()}
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
            <span
              role="tooltip"
              className="pointer-events-none absolute left-1/2 top-full z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-md border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-[10px] text-gray-200 opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
            >
              Very soon!
            </span>
          </div>

          <button
            type="button"
            className={`${oauthBtnClass} hover:border-neutral-600 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50`}
            onClick={() => signInWithOAuth("github")}
            disabled={loading !== null}
          >
            <GitHubIcon />
            <span>{loading === "github" ? "Connecting…" : "Continue with GitHub"}</span>
          </button>
        </div>

        {message && <p className="text-center text-xs text-red-300 sm:text-left">{message}</p>}

        <p className="border-t border-neutral-800/80 pt-4 text-center text-[10px] leading-relaxed text-gray-600 sm:text-left">
          By continuing, you agree to our{" "}
          <Link to={withLangPrefix("/Terms", normalizedLang)} className="text-gray-400 underline hover:text-gray-300">
            Terms
          </Link>
          ,{" "}
          <Link to={withLangPrefix("/Privacy", normalizedLang)} className="text-gray-400 underline hover:text-gray-300">
            Privacy Policy
          </Link>
          , and{" "}
          <Link to={withLangPrefix("/Cookies", normalizedLang)} className="text-gray-400 underline hover:text-gray-300">
            Cookie Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
