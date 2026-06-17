"use client";

import AdminUserPreviewToggle from "../auth/AdminUserPreviewToggle";
import { Link } from "../../lib/nextRouterCompat";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

interface AdminHubPanelProps {
  lang: string;
  adminUserPreview: boolean;
  pendingCount: number;
  devBlogCount: number;
  onNavigate: (section: "admin-moderation" | "admin-devblog" | "admin-app") => void;
}

export default function AdminHubPanel({
  lang,
  adminUserPreview,
  pendingCount,
  devBlogCount,
  onNavigate,
}: AdminHubPanelProps) {
  const normalizedLang = normalizeLang(lang);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-[13px] font-medium tracking-wide text-amber-200/90 sm:text-[14px]">Admin dashboard</h2>
        <p className="text-[11px] leading-relaxed text-gray-500 sm:text-[12px]">
          Site management tools — visible only to your admin account.
        </p>
      </div>

      <div className="rounded-lg border border-amber-900/25 bg-amber-950/10 p-4 sm:p-5">
        <AdminUserPreviewToggle initialEnabled={adminUserPreview} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onNavigate("admin-moderation")}
          className="rounded-lg border border-neutral-800 bg-[#0d0d0d] px-4 py-3 text-left transition-colors hover:border-neutral-700"
        >
          <p className="text-[10px] uppercase tracking-wide text-gray-500">Moderation</p>
          <p className="mt-1 font-mono text-lg text-gray-100">{pendingCount}</p>
          <p className="mt-1 text-[10px] text-gray-600">Pending gallery posts</p>
        </button>
        <button
          type="button"
          onClick={() => onNavigate("admin-devblog")}
          className="rounded-lg border border-neutral-800 bg-[#0d0d0d] px-4 py-3 text-left transition-colors hover:border-neutral-700"
        >
          <p className="text-[10px] uppercase tracking-wide text-gray-500">Dev blog</p>
          <p className="mt-1 font-mono text-lg text-gray-100">{devBlogCount}</p>
          <p className="mt-1 text-[10px] text-gray-600">Posts (all statuses)</p>
        </button>
        <button
          type="button"
          onClick={() => onNavigate("admin-app")}
          className="rounded-lg border border-neutral-800 bg-[#0d0d0d] px-4 py-3 text-left transition-colors hover:border-neutral-700"
        >
          <p className="text-[10px] uppercase tracking-wide text-gray-500">App control</p>
          <p className="mt-1 text-sm text-gray-200">Settings</p>
          <p className="mt-1 text-[10px] text-gray-600">Feature flags & links</p>
        </button>
      </div>

      <p className="text-[11px] text-gray-500">
        Public updates page:{" "}
        <Link
          to={withLangPrefix("/Updates", normalizedLang)}
          className="text-gray-300 underline decoration-dotted underline-offset-2 hover:text-gray-100"
        >
          /Updates
        </Link>
      </p>
    </div>
  );
}
