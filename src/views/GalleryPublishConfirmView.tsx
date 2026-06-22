"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import GalleryUsernameRequiredOverlay from "../components/gallery/GalleryUsernameRequiredOverlay";
import Header from "../components/ui/Header";
import SiteFooter from "../components/ui/SiteFooter";
import { Link } from "../lib/nextRouterCompat";
import {
  clearPublishDraft,
  dataUrlToFile,
  type GalleryPublishDraft,
} from "../lib/gallery/publishDraft";
import { formatGallerySettingsSummary, galleryToolBasePath } from "../lib/gallery/settings";
import { GALLERY_DESCRIPTION_MAX, isGalleryDescriptionAllowed } from "../lib/gallery/sanitize";
import { normalizeLang, withLangPrefix } from "../utils/localePath";

interface GalleryPublishConfirmViewProps {
  lang: string;
  username: string | null;
  draft: GalleryPublishDraft;
  onUsernameSet: (username: string | null) => void;
}

export default function GalleryPublishConfirmView({
  lang,
  username,
  draft,
  onUsernameSet,
}: GalleryPublishConfirmViewProps) {
  const router = useRouter();
  const normalizedLang = normalizeLang(lang);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ id: string; pending: boolean } | null>(null);

  const settingsSummary = formatGallerySettingsSummary(draft.settings);
  const isVideo = draft.settings.mode === "video";
  const toolPath = galleryToolBasePath(draft.settings, normalizedLang);

  const submit = async () => {
    if (!username?.trim()) return;

    const allowed = isGalleryDescriptionAllowed(description);
    if (!allowed.ok) {
      setError(allowed.reason ?? "Invalid description.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const form = new FormData();
      form.set("settings", JSON.stringify(draft.settings));
      form.set("description", description);
      form.set("width", String(draft.resultWidth));
      form.set("height", String(draft.resultHeight));
      form.set(
        "result",
        await dataUrlToFile(
          draft.resultDataUrl,
          draft.resultMime === "image/gif" ? "result.gif" : "result.webp",
        ),
      );
      form.set("original", await dataUrlToFile(draft.originalDataUrl, "original.webp"));

      const response = await fetch("/api/gallery/publish", { method: "POST", body: form });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        id?: string;
        pending?: boolean;
      } | null;

      if (!response.ok || !payload?.id) {
        if (payload?.error === "username_required") {
          onUsernameSet(null);
        }
        setError(
          payload?.error === "username_required"
            ? "Your username could not be verified. Please set it again."
            : (payload?.error ?? "Could not publish."),
        );
        setLoading(false);
        return;
      }

      clearPublishDraft();
      setDone({ id: payload.id, pending: !!payload.pending });
      setLoading(false);
    } catch {
      setError("Could not publish.");
      setLoading(false);
    }
  };

  const needsUsername = !username?.trim();

  return (
    <div className="relative flex min-h-screen flex-col bg-neutral-950 text-neutral-50">
      {!needsUsername ? null : <GalleryUsernameRequiredOverlay onComplete={onUsernameSet} />}
      <div className={needsUsername ? "pointer-events-none select-none blur-[2px]" : undefined} aria-hidden={needsUsername}>
      <Header activeNav="gallery" />
      <main id="main-content" className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-8 px-4 pt-10 md:px-8">
        <header className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Gallery</p>
          <h1 className="font-anton text-3xl tracking-tight text-gray-100">Confirm publication</h1>
          <p className="text-sm text-gray-400">
            {isVideo
              ? "Review your animated preview before submission. Gallery stores a short dithered GIF — not the full video — to keep storage light."
              : "Review your post before submission. All posts are moderated."}
          </p>
        </header>

        {done ? (
          <section className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900/40 p-6">
            <p className="text-sm text-emerald-300">
              {done.pending
                ? "Submitted for review. You will see it in the gallery once approved."
                : "Published to the gallery."}
            </p>
            <div className="flex flex-wrap gap-2">
              {!done.pending && (
                <Link
                  to={withLangPrefix(`/Gallery/${done.id}`, normalizedLang)}
                  className="clean-btn clean-btn-primary px-4 py-2 text-[11px]"
                >
                  View post
                </Link>
              )}
              <Link to={withLangPrefix("/Gallery", normalizedLang)} className="clean-btn px-4 py-2 text-[11px]">
                Back to gallery
              </Link>
            </div>
          </section>
        ) : (
          <>
            <section className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-wide text-gray-500">
                  {isVideo ? "Source frame" : "Original"}
                </p>
                <img
                  src={draft.originalDataUrl}
                  alt={isVideo ? "Source frame" : "Original"}
                  className="max-h-80 rounded-lg border border-neutral-800 object-contain"
                />
              </div>
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-wide text-gray-500">
                  {isVideo ? "Animated preview" : "Result"}
                </p>
                <img
                  src={draft.resultDataUrl}
                  alt={isVideo ? "Animated dithered preview" : "Result"}
                  className="max-h-80 rounded-lg border border-neutral-800 object-contain"
                />
              </div>
            </section>

            <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-6">
              <h2 className="mb-4 text-[10px] uppercase tracking-wide text-gray-500">Settings snapshot</h2>
              <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-[10px] uppercase tracking-wide text-gray-500">Publisher</dt>
                  <dd className="mt-1 text-gray-200">@{username?.trim() || "…"}</dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase tracking-wide text-gray-500">Date</dt>
                  <dd className="mt-1 text-gray-200">{new Date(draft.createdAt).toLocaleString()}</dd>
                </div>
                {settingsSummary.map((entry) => (
                  <div key={entry.label}>
                    <dt className="text-[10px] uppercase tracking-wide text-gray-500">{entry.label}</dt>
                    <dd className="mt-1 break-words text-gray-200">{entry.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section className="space-y-3">
              <label htmlFor="gallery-desc" className="block text-sm text-gray-300">
                Description <span className="text-gray-500">(optional, max {GALLERY_DESCRIPTION_MAX} chars)</span>
              </label>
              <textarea
                id="gallery-desc"
                maxLength={GALLERY_DESCRIPTION_MAX}
                rows={2}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-gray-100"
                placeholder="A few words about your piece..."
              />
              {error && <p className="text-xs text-red-300">{error}</p>}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="clean-btn clean-btn-primary px-4 py-2 text-[11px]"
                  onClick={submit}
                  disabled={loading || needsUsername}
                >
                  {loading ? "Submitting..." : "Submit for publication"}
                </button>
                <button
                  type="button"
                  className="clean-btn px-4 py-2 text-[11px]"
                  onClick={() => router.push(toolPath)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </section>
          </>
        )}

        <SiteFooter />
      </main>
      </div>
    </div>
  );
}
