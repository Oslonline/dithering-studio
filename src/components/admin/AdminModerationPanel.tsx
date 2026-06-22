"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "../../lib/nextRouterCompat";
import type { GalleryItemPublic, GalleryItemStatus } from "../../lib/gallery/types";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

interface AdminModerationPanelProps {
  lang: string;
  canModerate: boolean;
  onPendingCountChange?: (count: number) => void;
}

type ModerationTab = GalleryItemStatus;

const PAGE_SIZE = 25;

function statusLabel(status: GalleryItemStatus): string {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

function statusBadgeClass(status: GalleryItemStatus): string {
  if (status === "approved") return "text-emerald-400/90";
  if (status === "rejected") return "text-red-400/90";
  return "text-amber-400/90";
}

function formatShortDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export default function AdminModerationPanel({ lang, canModerate, onPendingCountChange }: AdminModerationPanelProps) {
  const normalizedLang = normalizeLang(lang);
  const [activeTab, setActiveTab] = useState<ModerationTab>("pending");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<GalleryItemPublic[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const tabCounts = useMemo(
    () => ({
      pending: activeTab === "pending" ? total : null,
      approved: activeTab === "approved" ? total : null,
      rejected: activeTab === "rejected" ? total : null,
    }),
    [activeTab, total],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setSearchQuery(searchInput.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const fetchItems = useCallback(
    async (mode: "replace" | "append", nextOffset: number) => {
      const params = new URLSearchParams({
        status: activeTab,
        offset: String(nextOffset),
        limit: String(PAGE_SIZE),
      });
      if (searchQuery) params.set("q", searchQuery);

      const response = await fetch(`/api/admin/gallery/moderation?${params.toString()}`);
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        items?: GalleryItemPublic[];
        total?: number;
        hasMore?: boolean;
      } | null;

      if (!response.ok || !payload?.items) {
        throw new Error(payload?.error ?? "Could not load moderation queue.");
      }

      setTotal(payload.total ?? 0);
      setOffset(nextOffset + payload.items.length);
      setItems((current) => (mode === "append" ? [...current, ...payload.items!] : payload.items!));

      if (activeTab === "pending" && onPendingCountChange) {
        onPendingCountChange(payload.total ?? 0);
      }

      return payload;
    },
    [activeTab, searchQuery, onPendingCountChange],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setItems([]);
    setOffset(0);
    setExpandedId(null);

    void fetchItems("replace", 0)
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, searchQuery, fetchItems]);

  const hasMore = items.length < total;

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      await fetchItems("append", offset);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load more items.");
    }
    setLoadingMore(false);
  };

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
      setItems((current) => current.filter((item) => item.id !== itemId));
      setTotal((count) => {
        const next = Math.max(0, count - 1);
        if (activeTab === "pending" && onPendingCountChange) {
          onPendingCountChange(next);
        }
        return next;
      });
    } catch {
      setError("Moderation failed.");
    }
    setBusyId(null);
  };

  const tabs: { id: ModerationTab; label: string }[] = [
    { id: "pending", label: "Pending" },
    { id: "approved", label: "Approved" },
    { id: "rejected", label: "Rejected" },
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-[13px] font-medium tracking-wide text-gray-100 sm:text-[14px]">Gallery moderation</h2>
        <p className="text-[11px] leading-relaxed text-gray-500 sm:text-[12px]">
          Review pending submissions and browse approved or rejected history. Results load in pages so large queues stay
          fast.
        </p>
        {!canModerate && (
          <p className="text-[11px] text-amber-400/90">Turn off user preview mode to approve or reject items.</p>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1 rounded-lg border border-neutral-800 bg-[#0a0a0a] p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-md px-3 py-1.5 font-mono text-[10px] transition-colors ${
                activeTab === tab.id
                  ? "bg-neutral-800 text-gray-100"
                  : "text-gray-500 hover:bg-neutral-900 hover:text-gray-300"
              }`}
            >
              {tab.label}
              {tabCounts[tab.id] !== null ? ` (${tabCounts[tab.id]})` : ""}
            </button>
          ))}
        </div>

        <label className="block w-full sm:max-w-xs">
          <span className="sr-only">Search moderation queue</span>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search username or description…"
            className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-[12px] text-gray-100 placeholder:text-gray-600"
          />
        </label>
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}

      <div className="overflow-hidden rounded-lg border border-neutral-800">
        <div className="hidden grid-cols-[3.5rem_minmax(0,1fr)_auto] gap-3 border-b border-neutral-800 bg-[#0a0a0a] px-3 py-2 text-[10px] uppercase tracking-wide text-gray-500 md:grid">
          <span>Preview</span>
          <span>Submission</span>
          <span className="text-right">Actions</span>
        </div>

        {loading ? (
          <div className="px-4 py-10 text-center text-sm text-gray-500">Loading queue…</div>
        ) : items.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-gray-500">
            No {statusLabel(activeTab).toLowerCase()} items{searchQuery ? " match your search" : ""}.
          </div>
        ) : (
          <ul className="max-h-[min(70vh,42rem)] divide-y divide-neutral-800/80 overflow-y-auto">
            {items.map((item) => {
              const expanded = expandedId === item.id;
              return (
                <li key={item.id} className="bg-neutral-900/20">
                  <div className="grid gap-3 px-3 py-3 md:grid-cols-[3.5rem_minmax(0,1fr)_auto] md:items-center">
                    <button
                      type="button"
                      className="h-14 w-14 shrink-0 overflow-hidden rounded border border-neutral-800 bg-neutral-950"
                      onClick={() => setExpandedId(expanded ? null : item.id)}
                      aria-label={expanded ? "Collapse details" : "Expand details"}
                    >
                      <img src={item.preview_url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </button>

                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="truncate text-sm text-gray-200">@{item.author_username}</p>
                        <span className={`text-[10px] uppercase tracking-wide ${statusBadgeClass(item.status)}`}>
                          {statusLabel(item.status)}
                        </span>
                        <span className="text-[10px] text-gray-600">{formatShortDate(item.created_at)}</span>
                      </div>
                      {item.description ? (
                        <p className={`text-[12px] text-gray-400 ${expanded ? "" : "line-clamp-2"}`}>
                          {item.description}
                        </p>
                      ) : (
                        <p className="text-[11px] text-gray-600">No description</p>
                      )}
                      {expanded && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {item.original_url && (
                            <a
                              href={item.original_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-blue-300 underline"
                            >
                              View original
                            </a>
                          )}
                          <Link
                            to={withLangPrefix(`/Gallery/${item.id}`, normalizedLang)}
                            className="text-[11px] text-gray-400 underline decoration-dotted underline-offset-2 hover:text-gray-200"
                          >
                            Open post
                          </Link>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      {activeTab === "pending" ? (
                        <>
                          <button
                            type="button"
                            className="clean-btn clean-btn-primary px-3 py-1.5 text-[10px]"
                            disabled={!canModerate || busyId === item.id}
                            onClick={() => void moderate(item.id, "approve")}
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            className="clean-btn border-red-800/60 px-3 py-1.5 text-[10px] text-red-300"
                            disabled={!canModerate || busyId === item.id}
                            onClick={() => void moderate(item.id, "reject")}
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <Link
                          to={withLangPrefix(`/Gallery/${item.id}`, normalizedLang)}
                          className="clean-btn px-3 py-1.5 text-[10px]"
                        >
                          View
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {!loading && items.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800 bg-[#0a0a0a] px-3 py-2.5">
            <p className="text-[11px] text-gray-500">
              Showing {items.length} of {total}
            </p>
            {hasMore ? (
              <button
                type="button"
                className="clean-btn px-3 py-1.5 text-[10px]"
                disabled={loadingMore}
                onClick={() => void loadMore()}
              >
                {loadingMore ? "Loading…" : `Load more (${Math.min(PAGE_SIZE, total - items.length)})`}
              </button>
            ) : (
              <span className="text-[10px] text-gray-600">End of list</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
