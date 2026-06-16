"use client";

import { useEffect, useRef, useState } from "react";
import { createFocusTrap } from "../../utils/a11y";
import { Link } from "../../lib/nextRouterCompat";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { getSupabaseClientConfig } from "../../lib/supabase/config";
import { GALLERY_PREVIEW_BUCKET, type GallerySettingsV1 } from "../../lib/gallery/types";
import { snapshotFromToolState, type ToolSettingsSnapshot } from "../../lib/gallery/settings";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

interface GalleryPublishDialogProps {
  open: boolean;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  processedCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  toolState: ToolSettingsSnapshot;
}

async function canvasToWebpBlob(canvas: HTMLCanvasElement, maxSize = 1200): Promise<Blob> {
  const scale = Math.min(1, maxSize / Math.max(canvas.width, canvas.height));
  const width = Math.max(1, Math.round(canvas.width * scale));
  const height = Math.max(1, Math.round(canvas.height * scale));

  const output = document.createElement("canvas");
  output.width = width;
  output.height = height;
  const ctx = output.getContext("2d");
  if (!ctx) throw new Error("Could not prepare preview image.");

  ctx.drawImage(canvas, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => output.toBlob(resolve, "image/webp", 0.85));
  if (!blob) throw new Error("Could not encode preview image.");
  return blob;
}

export default function GalleryPublishDialog({
  open,
  onClose,
  canvasRef,
  processedCanvasRef,
  toolState,
}: GalleryPublishDialogProps) {
  const normalizedLang = normalizeLang(typeof window !== "undefined" ? window.location.pathname.split("/")[1] : "en");
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setTitle("");
      setDescription("");
      setPreview(null);
      setError(null);
      setSuccessId(null);
      setLoading(false);
      return;
    }

    const canvas = processedCanvasRef.current || canvasRef.current;
    if (!canvas) return;
    try {
      setPreview(canvas.toDataURL("image/webp", 0.85));
    } catch {
      setPreview(null);
    }
  }, [open, canvasRef, processedCanvasRef]);

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

  const publish = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const config = getSupabaseClientConfig();
    if (!supabase || !config) {
      setError("Gallery is not configured.");
      return;
    }

    const canvas = processedCanvasRef.current || canvasRef.current;
    if (!canvas) {
      setError("No preview available.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Sign in to publish to the gallery.");
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
      if (!profile?.username?.trim()) {
        setError("Set a username on your Account page before publishing.");
        setLoading(false);
        return;
      }

      const itemId = crypto.randomUUID();
      const previewPath = `${user.id}/${itemId}.webp`;
      const blob = await canvasToWebpBlob(canvas);

      const { error: uploadError } = await supabase.storage.from(GALLERY_PREVIEW_BUCKET).upload(previewPath, blob, {
        contentType: "image/webp",
        upsert: false,
      });

      if (uploadError) {
        setError("Could not upload preview image.");
        setLoading(false);
        return;
      }

      const settings: GallerySettingsV1 = snapshotFromToolState(toolState);

      const { data: inserted, error: insertError } = await supabase
        .from("gallery_items")
        .insert({
          id: itemId,
          author_id: user.id,
          title: trimmedTitle,
          description: description.trim() || null,
          settings,
          settings_version: settings.version,
          preview_path: previewPath,
          is_public: true,
        })
        .select("id")
        .single();

      if (insertError || !inserted) {
        await supabase.storage.from(GALLERY_PREVIEW_BUCKET).remove([previewPath]);
        setError("Could not publish to gallery.");
        setLoading(false);
        return;
      }

      setSuccessId(inserted.id);
      setLoading(false);
    } catch {
      setError("Could not publish to gallery.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-publish-title"
        className="w-full max-w-md rounded-xl border border-neutral-800 bg-[#111] p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="gallery-publish-title" className="text-sm font-medium tracking-wide text-gray-200">
              Share to gallery
            </h2>
            <p className="mt-1 text-xs text-gray-500">Publish a preview and let others reuse your settings.</p>
          </div>
          <button type="button" className="clean-btn px-2 py-1 text-[10px]" onClick={onClose} disabled={loading}>
            Close
          </button>
        </div>

        {successId ? (
          <div className="space-y-4">
            <p className="text-sm text-emerald-300">Published to the community gallery.</p>
            <div className="flex gap-2">
              <Link
                to={withLangPrefix(`/Gallery/${successId}`, normalizedLang)}
                className="clean-btn clean-btn-primary flex-1 justify-center py-2 text-[11px]"
              >
                View post
              </Link>
              <Link
                to={withLangPrefix("/Gallery", normalizedLang)}
                className="clean-btn flex-1 justify-center py-2 text-[11px]"
              >
                Browse gallery
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {preview && (
              <img src={preview} alt="Preview" className="mx-auto max-h-40 rounded-md border border-neutral-800 object-contain" />
            )}
            <div className="space-y-2">
              <label className="block text-[11px] text-gray-400" htmlFor="gallery-title">
                Title
              </label>
              <input
                id="gallery-title"
                type="text"
                maxLength={120}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-gray-100"
                placeholder="My dithered portrait"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] text-gray-400" htmlFor="gallery-description">
                Description (optional)
              </label>
              <textarea
                id="gallery-description"
                maxLength={1000}
                rows={3}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-gray-100"
                placeholder="Algorithm notes, palette, inspiration..."
              />
            </div>
            {error && <p className="text-xs text-red-300">{error}</p>}
            <button
              type="button"
              className="clean-btn clean-btn-primary w-full justify-center py-2 text-[11px]"
              onClick={publish}
              disabled={loading}
            >
              {loading ? "Publishing..." : "Publish to gallery"}
            </button>
            <p className="text-[10px] leading-relaxed text-gray-600">
              Only the preview image and settings are uploaded. Your original media stays on your device.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
