"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "../components/ui/Header";
import SiteFooter from "../components/ui/SiteFooter";
import { Link, useNavigate } from "../lib/nextRouterCompat";
import { buildToolUrlFromSettings, formatGallerySettingsSummary } from "../lib/gallery/settings";
import type { GalleryItemPublic } from "../lib/gallery/types";
import { normalizeLang, withLangPrefix } from "../utils/localePath";

interface GalleryDetailViewProps {
  item: GalleryItemPublic;
  isAdmin?: boolean;
  canVote?: boolean;
  isAuthor?: boolean;
  userVote?: 1 | -1 | null;
}

type NatDims = { width: number; height: number };
type DisplayDims = { width: number; height: number };

function fitDisplaySize(natW: number, natH: number, maxW: number, maxH: number): DisplayDims {
  const scale = Math.min(1, maxW / natW, maxH / natH);
  return {
    width: Math.max(1, Math.round(natW * scale)),
    height: Math.max(1, Math.round(natH * scale)),
  };
}

function loadImageDimensions(url: string): Promise<NatDims> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error("Could not load image."));
    img.src = url;
  });
}

export default function GalleryDetailView({
  item,
  isAdmin = false,
  canVote = false,
  isAuthor = false,
  userVote: initialUserVote = null,
}: GalleryDetailViewProps) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = normalizeLang(i18n.language);
  const templateUrl = buildToolUrlFromSettings(item.settings, lang);
  const settingsSummary = formatGallerySettingsSummary(item.settings);
  const isVideo = item.settings.mode === "video";

  const [showOriginal, setShowOriginal] = useState(false);
  const [userVote, setUserVote] = useState<1 | -1 | null>(initialUserVote);
  const [upvoteCount, setUpvoteCount] = useState(item.upvote_count);
  const [downvoteCount, setDownvoteCount] = useState(item.downvote_count);
  const [voteError, setVoteError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  const [stageNat, setStageNat] = useState<NatDims | null>(null);
  const [displaySize, setDisplaySize] = useState<DisplayDims | null>(null);

  const loadedUrls = useRef(new Set<string>([item.preview_url]));
  const stageRef = useRef<HTMLDivElement>(null);

  const displayImage = useMemo(
    () => (showOriginal && item.original_url ? item.original_url : item.preview_url),
    [showOriginal, item.original_url, item.preview_url],
  );

  const resultNat = useMemo<NatDims | null>(() => {
    if (item.preview_width && item.preview_height) {
      return { width: item.preview_width, height: item.preview_height };
    }
    return null;
  }, [item.preview_height, item.preview_width]);

  const pixelateResult = !showOriginal && !!stageNat && !!resultNat && (
    resultNat.width < stageNat.width * 0.98 || resultNat.height < stageNat.height * 0.98
  );

  useEffect(() => {
    let cancelled = false;
    const layoutUrl = item.original_url ?? item.preview_url;

    loadImageDimensions(layoutUrl)
      .then((dims) => {
        if (!cancelled) setStageNat(dims);
      })
      .catch(() => {
        if (!cancelled && resultNat) setStageNat(resultNat);
      });

    if (item.original_url) {
      loadImageDimensions(item.original_url)
        .then(() => loadedUrls.current.add(item.original_url!))
        .catch(() => {});
    }

    return () => {
      cancelled = true;
    };
  }, [item.original_url, item.preview_url, resultNat]);

  useEffect(() => {
    if (!stageNat) return;

    const update = () => {
      const maxW = stageRef.current?.clientWidth ?? Math.min(window.innerWidth - 48, 960);
      const maxH = window.innerHeight * 0.7;
      setDisplaySize(fitDisplaySize(stageNat.width, stageNat.height, maxW, maxH));
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [stageNat]);

  const switchImage = (original: boolean) => {
    const nextUrl = original && item.original_url ? item.original_url : item.preview_url;
    if (nextUrl !== displayImage && !loadedUrls.current.has(nextUrl)) {
      setImageLoading(true);
    }
    setShowOriginal(original);
  };

  const castVote = async (vote: 1 | -1) => {
    if (isAuthor) {
      setVoteError("You can't vote on your own post.");
      return;
    }
    if (!canVote) {
      setVoteError("Sign in to vote on community posts.");
      return;
    }

    setVoting(true);
    setVoteError(null);
    try {
      const response = await fetch("/api/gallery/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id, vote }),
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        vote?: 1 | -1;
        upvote_count?: number;
        downvote_count?: number;
      } | null;
      if (!response.ok) {
        setVoteError(payload?.error ?? "Could not vote.");
        setVoting(false);
        return;
      }
      setUserVote(payload?.vote ?? vote);
      if (typeof payload?.upvote_count === "number") setUpvoteCount(payload.upvote_count);
      if (typeof payload?.downvote_count === "number") setDownvoteCount(payload.downvote_count);
    } catch {
      setVoteError("Could not vote.");
    }
    setVoting(false);
  };

  const voteTitle = isAuthor
    ? "You can't vote on your own post"
    : canVote
      ? undefined
      : "Sign in to vote on community posts";

  const deleteItem = async () => {
    if (!isAdmin) return;
    if (!window.confirm("Delete this gallery post permanently? This cannot be undone.")) return;

    setDeleting(true);
    setDeleteError(null);
    try {
      const response = await fetch("/api/gallery/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setDeleteError(payload?.error ?? "Could not delete post.");
        setDeleting(false);
        return;
      }
      navigate(withLangPrefix("/Gallery", lang));
    } catch {
      setDeleteError("Could not delete post.");
      setDeleting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-50">
      <Header activeNav="gallery" />
      <main id="main-content" className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 pt-10 md:px-8">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {item.original_url && (
              <div className="flex gap-1 rounded-md border border-neutral-800 bg-neutral-900/40 p-0.5">
                <button
                  type="button"
                  onClick={() => switchImage(false)}
                  aria-pressed={!showOriginal}
                  className={`rounded px-3 py-1.5 text-[10px] font-medium ${!showOriginal ? "bg-blue-600/90 text-white" : "text-gray-400 hover:text-gray-200"}`}
                >
                  {isVideo ? "Dithered frame" : "Result"}
                </button>
                <button
                  type="button"
                  onClick={() => switchImage(true)}
                  aria-pressed={showOriginal}
                  className={`rounded px-3 py-1.5 text-[10px] font-medium ${showOriginal ? "bg-blue-600/90 text-white" : "text-gray-400 hover:text-gray-200"}`}
                >
                  {isVideo ? "Source frame" : "Original"}
                </button>
              </div>
            )}
            <div className="flex items-center gap-2" title={voteTitle}>
              <button
                type="button"
                className={`clean-btn px-3 py-1.5 text-[10px] ${userVote === 1 ? "border-blue-500/60 text-blue-300" : ""} ${!canVote ? "cursor-not-allowed opacity-60" : ""}`}
                disabled={voting || !canVote}
                onClick={() => castVote(1)}
                aria-pressed={userVote === 1}
                aria-label={`Upvote (${upvoteCount})`}
              >
                ▲ {upvoteCount}
              </button>
              <button
                type="button"
                className={`clean-btn px-3 py-1.5 text-[10px] ${userVote === -1 ? "border-red-500/60 text-red-300" : ""} ${!canVote ? "cursor-not-allowed opacity-60" : ""}`}
                disabled={voting || !canVote}
                onClick={() => castVote(-1)}
                aria-pressed={userVote === -1}
                aria-label={`Downvote (${downvoteCount})`}
              >
                ▼ {downvoteCount}
              </button>
            </div>
          </div>

          <div
            ref={stageRef}
            className="relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-neutral-800 bg-[#0a0a0a] p-3 sm:p-4"
            style={displaySize ? { minHeight: displaySize.height + 24 } : { minHeight: 240 }}
          >
            {imageLoading && (
              <div className="absolute inset-0 z-10 animate-pulse bg-neutral-800/80" aria-hidden="true" />
            )}
            {displaySize ? (
              <img
                src={displayImage}
                alt={item.description ?? item.title}
                width={displaySize.width}
                height={displaySize.height}
                onLoad={() => {
                  loadedUrls.current.add(displayImage);
                  setImageLoading(false);
                }}
                onError={() => setImageLoading(false)}
                className={`block transition-opacity duration-200 ${imageLoading ? "opacity-0" : "opacity-100"}`}
                style={{
                  width: displaySize.width,
                  height: displaySize.height,
                  imageRendering: pixelateResult ? "pixelated" : "auto",
                }}
              />
            ) : (
              <div className="h-48 w-full animate-pulse bg-neutral-900/60" aria-hidden="true" />
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-start">
            <div className="space-y-3">
              <Link
                to={withLangPrefix(`/u/${item.author_username}`, lang)}
                className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white"
              >
                {item.author_avatar_url ? (
                  <img
                    src={item.author_avatar_url}
                    alt=""
                    className="h-8 w-8 rounded-full border border-neutral-700 object-cover"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-[10px]">
                    {item.author_username.slice(0, 1).toUpperCase()}
                  </span>
                )}
                @{item.author_username}
              </Link>
              {item.description && <p className="text-sm leading-relaxed text-gray-300">{item.description}</p>}
              <dl className="grid gap-2 text-xs text-gray-500 sm:grid-cols-2 lg:grid-cols-3">
                {settingsSummary.map((entry) => (
                  <div key={entry.label}>
                    <dt className="uppercase tracking-wide">{entry.label}</dt>
                    <dd className="mt-0.5 break-words text-gray-300">{entry.value}</dd>
                  </div>
                ))}
              </dl>
              {voteError && <p className="text-xs text-red-300">{voteError}</p>}
              {isAuthor && !voteError && (
                <p className="text-xs text-gray-500">
                  Your post — you can see votes but can&apos;t vote on your own work.
                </p>
              )}
              {deleteError && <p className="text-xs text-red-300">{deleteError}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <Link to={templateUrl} className="clean-btn clean-btn-primary px-5 py-2.5 text-[11px]">
                Use this template
              </Link>
              {isAdmin && (
                <button
                  type="button"
                  className="clean-btn border-red-800/60 px-5 py-2.5 text-[11px] text-red-300"
                  onClick={deleteItem}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Delete post"}
                </button>
              )}
            </div>
          </div>
        </div>
        <SiteFooter />
      </main>
    </div>
  );
}
