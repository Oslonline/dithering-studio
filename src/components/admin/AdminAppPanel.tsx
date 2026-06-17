"use client";

import { features } from "../../lib/features";
import { Link } from "../../lib/nextRouterCompat";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

interface AdminAppPanelProps {
  lang: string;
}

export default function AdminAppPanel({ lang }: AdminAppPanelProps) {
  const normalizedLang = normalizeLang(lang);

  const flags = [
    { key: "accounts", enabled: features.accounts, label: "User accounts" },
    { key: "gallery", enabled: features.gallery, label: "Community gallery" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-[13px] font-medium tracking-wide text-gray-100 sm:text-[14px]">App control</h2>
        <p className="text-[11px] leading-relaxed text-gray-500 sm:text-[12px]">
          Read-only view of environment flags. Change these via{" "}
          <code className="text-gray-400">NEXT_PUBLIC_ENABLE_*</code> in your deployment settings.
        </p>
      </div>

      <dl className="space-y-3">
        {flags.map((flag) => (
          <div
            key={flag.key}
            className="flex items-center justify-between rounded-lg border border-neutral-800 bg-[#0d0d0d] px-4 py-3"
          >
            <dt className="text-sm text-gray-300">{flag.label}</dt>
            <dd
              className={`font-mono text-[11px] ${flag.enabled ? "text-emerald-400" : "text-gray-500"}`}
            >
              {flag.enabled ? "ON" : "OFF"}
            </dd>
          </div>
        ))}
      </dl>

      <div className="space-y-2 rounded-lg border border-neutral-800 bg-neutral-900/30 p-4">
        <p className="text-[10px] uppercase tracking-wide text-gray-500">Quick links</p>
        <ul className="space-y-2 text-sm">
          <li>
            <Link
              to={withLangPrefix("/Updates", normalizedLang)}
              className="text-gray-300 underline decoration-dotted underline-offset-2 hover:text-gray-100"
            >
              Public updates page
            </Link>
          </li>
          <li>
            <Link
              to={withLangPrefix("/Gallery", normalizedLang)}
              className="text-gray-300 underline decoration-dotted underline-offset-2 hover:text-gray-100"
            >
              Gallery (public)
            </Link>
          </li>
          <li>
            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noreferrer"
              className="text-gray-300 underline decoration-dotted underline-offset-2 hover:text-gray-100"
            >
              Supabase dashboard
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
