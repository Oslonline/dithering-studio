"use client";

import { useEffect, useRef, useState } from "react";
import { useNavigate } from "../../lib/nextRouterCompat";
import { createFocusTrap } from "../../utils/a11y";
import { features } from "../../lib/features";
import {
  captureImageFromUrl,
  captureVideoFrameAsync,
  canvasToGalleryPreviewDataUrl,
  getDitheredResultCanvas,
} from "../../lib/gallery/captureImages";
import { buildToolUrlFromSettings, snapshotFromToolState, type ToolSettingsSnapshot } from "../../lib/gallery/settings";
import { savePublishDraft } from "../../lib/gallery/publishDraft";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

interface ShareOptionsModalProps {
  open: boolean;
  onClose: () => void;
  buildShareUrl: () => string;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  processedCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  sourceImageUrl: string | null;
  sourceVideoRef?: React.RefObject<HTMLVideoElement | null>;
  toolState: ToolSettingsSnapshot;
  hasApplied?: boolean;
  captureVideoGalleryResult?: () => Promise<{
    dataUrl: string;
    width: number;
    height: number;
    mime: "image/gif";
  }>;
}

export default function ShareOptionsModal({
  open,
  onClose,
  buildShareUrl,
  canvasRef,
  processedCanvasRef,
  sourceImageUrl,
  sourceVideoRef,
  toolState,
  hasApplied = true,
  captureVideoGalleryResult,
}: ShareOptionsModalProps) {
  const navigate = useNavigate();
  const lang = normalizeLang(typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "en");
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setCopied(false);
      setError(null);
      setLoading(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !dialogRef.current) return;
    const trap = createFocusTrap(dialogRef.current);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      trap?.();
      document.removeEventListener("keydown", onKey);
    };
  }, [open, loading, onClose]);

  if (!open) return null;

  const copyLink = async () => {
    const url = buildShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Could not copy link.");
    }
  };

  const startPublish = async () => {
    if (!features.gallery) return;
    setLoading(true);
    setError(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setError("Gallery is not configured.");
      setLoading(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      navigate(withLangPrefix("/Account", lang));
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
    if (!profile?.username?.trim()) {
      navigate(withLangPrefix("/Account", lang));
      setLoading(false);
      return;
    }

    if (!hasApplied) {
      setError(
        toolState.videoMode
          ? "Process a video frame before publishing."
          : "Process an image before publishing.",
      );
      setLoading(false);
      return;
    }

    const resultCanvas = getDitheredResultCanvas(
      toolState.videoMode,
      canvasRef.current,
      processedCanvasRef.current,
    );
    if (!resultCanvas?.width || !resultCanvas?.height) {
      setError(
        toolState.videoMode
          ? "Process a video frame before publishing."
          : "Process an image before publishing.",
      );
      setLoading(false);
      return;
    }

    try {
      const settings = snapshotFromToolState(toolState);

      let result: { dataUrl: string; width: number; height: number };
      let resultMime: "image/webp" | "image/gif" = "image/webp";

      let original: { dataUrl: string; width: number; height: number };
      if (toolState.videoMode) {
        const videoEl = sourceVideoRef?.current;
        if (!videoEl) {
          setError("Upload a video before publishing.");
          setLoading(false);
          return;
        }
        original = await captureVideoFrameAsync(videoEl);

        if (!captureVideoGalleryResult) {
          setError("Video gallery preview is unavailable.");
          setLoading(false);
          return;
        }
        const gifResult = await captureVideoGalleryResult();
        result = gifResult;
        resultMime = gifResult.mime;
      } else {
        result = await canvasToGalleryPreviewDataUrl(resultCanvas);
        if (sourceImageUrl) {
          original = await captureImageFromUrl(sourceImageUrl);
        } else {
          setError("Upload media before publishing.");
          setLoading(false);
          return;
        }
      }

      savePublishDraft({
        settings,
        templateUrl: buildToolUrlFromSettings(settings, lang),
        resultDataUrl: result.dataUrl,
        originalDataUrl: original.dataUrl,
        resultWidth: result.width,
        resultHeight: result.height,
        resultMime,
        createdAt: new Date().toISOString(),
      });

      navigate(withLangPrefix("/Gallery/publish", lang));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not prepare publication preview.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-options-title"
        className="w-full max-w-md rounded-xl border border-neutral-800 bg-[#111] p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="share-options-title" className="text-sm font-medium tracking-wide text-gray-200">
              Share
            </h2>
            <p className="mt-1 text-xs text-gray-500">Copy a template link or publish to the community gallery.</p>
          </div>
          <button type="button" className="clean-btn px-2 py-1 text-[10px]" onClick={onClose} disabled={loading}>
            Close
          </button>
        </div>

        <div className="space-y-2">
          <button type="button" className="clean-btn clean-btn-primary w-full justify-center py-2.5 text-[11px]" onClick={copyLink}>
            {copied ? "Link copied" : "Copy template link"}
          </button>
          {features.gallery && (
            <button
              type="button"
              className="clean-btn w-full justify-center py-2.5 text-[11px]"
              onClick={startPublish}
              disabled={loading}
            >
              {loading ? (toolState.videoMode ? "Encoding preview..." : "Preparing...") : "Publish to gallery"}
            </button>
          )}
        </div>

        {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
        <p className="mt-4 text-[10px] leading-relaxed text-gray-600">
          Template links encode your current settings. Gallery posts are reviewed before going public.
        </p>
      </div>
    </div>
  );
}
