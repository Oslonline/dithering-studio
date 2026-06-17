"use client";

import { useState } from "react";
import { Link } from "../../lib/nextRouterCompat";
import type { GalleryItemPublic } from "../../lib/gallery/types";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

interface AdminModerationPanelProps {
  pendingItems: GalleryItemPublic[];
  recentItems: GalleryItemPublic[];
  lang: string;
  canModerate: boolean;
}

function statusLabel(status: GalleryItemPublic["status"]): string {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

export default function AdminModerationPanel({
  pendingItems: initialPending,
  recentItems,
  lang,
  canModerate,
}: AdminModerationPanelProps) {
  const normalizedLang = normalizeLang(lang);
  const [pendingItems, setPendingItems] = useState(initialPending);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const moderate = async (itemId: string, action: "approve" | "reject") => {
    if (!canModerate) return;
    setBusyId(itemId);
    setError(null);
    try {
      const response = await fetch("/api/gallery/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, action }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Moderation failed.");
        setBusyId(null);
        return;
      }
      setPendingItems((current) => current.filter((item) => item.id !== itemId));
    } catch {
      setError("Moderation failed.");
    }
    setBusyId(null);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-[13px] font-medium tracking-wide text-gray-100 sm:text-[14px]">Gallery moderation</h2>
        <p className="text-[11px] leading-relaxed text-gray-500 sm:text-[12px]">
          Review pending submissions. Admin accounts publish directly as approved, so your own posts will not appear
          in the queue.
        </p>
        {!canModerate && (
          <p className="text-[11px] text-amber-400/90">Turn off user preview mode to approve or reject items.</p>
        )}
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}

      <section className="space-y-4">
        <h3 className="text-xs uppercase tracking-wide text-gray-500">Pending review ({pendingItems.length})</h3>
        {pendingItems.length === 0 ? (
          <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-5 text-sm text-gray-400">
            No pending submissions.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingItems.map((item) => (
              <article
                key={item.id}
                className="grid gap-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-4 md:grid-cols-[180px_1fr]"
              >
                <img src={item.preview_url} alt="" className="rounded-md border border-neutral-800 object-cover" />
                <div className="space-y-3">
                  <p className="text-sm text-gray-300">
                    @{item.author_username} · {new Date(item.created_at).toLocaleString()}
                  </p>
                  {item.description && <p className="text-sm text-gray-400">{item.description}</p>}
                  {item.original_url && (
                    <a
                      href={item.original_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-300 underline"
                    >
                      View original
                    </a>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="clean-btn clean-btn-primary px-3 py-1.5 text-[10px]"
                      disabled={!canModerate || busyId === item.id}
                      onClick={() => moderate(item.id, "approve")}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="clean-btn border-red-800/60 px-3 py-1.5 text-[10px] text-red-300"
                      disabled={!canModerate || busyId === item.id}
                      onClick={() => moderate(item.id, "reject")}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h3 className="text-xs uppercase tracking-wide text-gray-500">Recent publications</h3>
        {recentItems.length === 0 ? (
          <div className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-5 text-sm text-gray-400">
            No gallery posts yet.
          </div>
        ) : (
          <div className="space-y-3">
            {recentItems.map((item) => (
              <article
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900/40 px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={item.preview_url}
                    alt=""
                    className="h-12 w-12 rounded border border-neutral-800 object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-gray-200">@{item.author_username}</p>
                    <p className="text-[11px] text-gray-500">
                      {statusLabel(item.status)} · {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Link
                  to={withLangPrefix(`/Gallery/${item.id}`, normalizedLang)}
                  className="clean-btn px-3 py-1.5 text-[10px]"
                >
                  View post
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
