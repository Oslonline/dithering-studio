"use client";

import { useMemo, useState } from "react";
import { Link } from "../../lib/nextRouterCompat";
import type { DevBlogPostRow } from "../../lib/devblog/types";
import { slugifyTitle } from "../../lib/devblog/slug";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

interface AdminDevBlogPanelProps {
  lang: string;
  initialPosts: DevBlogPostRow[];
}

type Draft = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  published: boolean;
  show_home_banner: boolean;
  banner_label: string;
};

const emptyDraft = (): Draft => ({
  title: "",
  slug: "",
  summary: "",
  body: "",
  published: false,
  show_home_banner: false,
  banner_label: "What's new",
});

function draftFromPost(post: DevBlogPostRow): Draft {
  return {
    title: post.title,
    slug: post.slug,
    summary: post.summary,
    body: post.body,
    published: post.published,
    show_home_banner: post.show_home_banner,
    banner_label: post.banner_label ?? "What's new",
  };
}

export default function AdminDevBlogPanel({ lang, initialPosts }: AdminDevBlogPanelProps) {
  const normalizedLang = normalizeLang(lang);
  const [posts, setPosts] = useState(initialPosts);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const activeBanner = useMemo(() => posts.find((p) => p.show_home_banner && p.published), [posts]);

  const resetForm = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setShowForm(false);
    setError(null);
  };

  const startCreate = () => {
    setEditingId(null);
    setDraft(emptyDraft());
    setShowForm(true);
    setError(null);
  };

  const startEdit = (post: DevBlogPostRow) => {
    setEditingId(post.id);
    setDraft(draftFromPost(post));
    setShowForm(true);
    setError(null);
  };

  const savePost = async () => {
    setBusy(true);
    setError(null);
    const slug = draft.slug.trim() || slugifyTitle(draft.title);
    const payload = {
      title: draft.title.trim(),
      slug,
      summary: draft.summary.trim(),
      body: draft.body.trim(),
      published: draft.published,
      show_home_banner: draft.show_home_banner,
      banner_label: draft.banner_label.trim() || null,
    };

    try {
      const url = editingId ? `/api/admin/devblog/${editingId}` : "/api/admin/devblog";
      const response = await fetch(url, {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json().catch(() => null)) as { error?: string; post?: DevBlogPostRow } | null;
      if (!response.ok || !data?.post) {
        setError(data?.error ?? "Could not save post.");
        setBusy(false);
        return;
      }

      setPosts((current) => {
        const next = current.filter((p) => p.id !== data.post!.id);
        const cleared = data.post!.show_home_banner
          ? next.map((p) => (p.show_home_banner ? { ...p, show_home_banner: false } : p))
          : next;
        return [data.post!, ...cleared];
      });
      resetForm();
    } catch {
      setError("Could not save post.");
    }
    setBusy(false);
  };

  const deletePost = async (id: string) => {
    if (!window.confirm("Delete this post permanently?")) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/devblog/${id}`, { method: "DELETE" });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error ?? "Could not delete post.");
        setBusy(false);
        return;
      }
      setPosts((current) => current.filter((p) => p.id !== id));
      if (editingId === id) resetForm();
    } catch {
      setError("Could not delete post.");
    }
    setBusy(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-[13px] font-medium tracking-wide text-gray-100 sm:text-[14px]">Dev blog</h2>
          <p className="text-[11px] leading-relaxed text-gray-500 sm:text-[12px]">
            Publish release notes and optionally show a floating &ldquo;what&apos;s new&rdquo; banner on the homepage.
          </p>
        </div>
        {!showForm && (
          <button type="button" className="clean-btn clean-btn-primary px-3 py-1.5 text-[10px]" onClick={startCreate}>
            New post
          </button>
        )}
      </div>

      {activeBanner && (
        <p className="rounded-md border border-emerald-900/40 bg-emerald-950/20 px-3 py-2 text-[11px] text-emerald-300/90">
          Homepage banner active: <strong>{activeBanner.title}</strong>
        </p>
      )}

      {error && <p className="text-sm text-red-300">{error}</p>}

      {showForm && (
        <form
          className="space-y-4 rounded-lg border border-neutral-800 bg-[#0d0d0d] p-4 sm:p-5"
          onSubmit={(e) => {
            e.preventDefault();
            void savePost();
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-[10px] uppercase tracking-wide text-gray-500">Title</span>
              <input
                type="text"
                required
                maxLength={160}
                value={draft.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setDraft((d) => ({
                    ...d,
                    title,
                    slug: editingId ? d.slug : slugifyTitle(title),
                  }));
                }}
                className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-gray-100"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wide text-gray-500">Slug</span>
              <input
                type="text"
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                value={draft.slug}
                onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
                className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 font-mono text-sm text-gray-100"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-[10px] uppercase tracking-wide text-gray-500">Banner label</span>
              <input
                type="text"
                maxLength={60}
                value={draft.banner_label}
                onChange={(e) => setDraft((d) => ({ ...d, banner_label: e.target.value }))}
                placeholder="What's new"
                className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-gray-100"
              />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-[10px] uppercase tracking-wide text-gray-500">Summary (for banner & list)</span>
              <textarea
                required
                maxLength={400}
                rows={2}
                value={draft.summary}
                onChange={(e) => setDraft((d) => ({ ...d, summary: e.target.value }))}
                className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 text-sm text-gray-100"
              />
            </label>
            <label className="block space-y-1 sm:col-span-2">
              <span className="text-[10px] uppercase tracking-wide text-gray-500">Body</span>
              <textarea
                required
                rows={8}
                value={draft.body}
                onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
                className="w-full rounded-md border border-neutral-800 bg-neutral-950 px-3 py-2 font-mono text-sm text-gray-100"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => setDraft((d) => ({ ...d, published: e.target.checked }))}
              />
              Published
            </label>
            <label className="flex items-center gap-2 text-gray-300">
              <input
                type="checkbox"
                checked={draft.show_home_banner}
                disabled={!draft.published}
                onChange={(e) => setDraft((d) => ({ ...d, show_home_banner: e.target.checked }))}
              />
              Show homepage banner
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="submit" disabled={busy} className="clean-btn clean-btn-primary px-4 py-2 text-[11px]">
              {editingId ? "Save changes" : "Create post"}
            </button>
            <button type="button" disabled={busy} className="clean-btn px-4 py-2 text-[11px]" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      <section className="space-y-3">
        <h3 className="text-xs uppercase tracking-wide text-gray-500">All posts</h3>
        {posts.length === 0 ? (
          <p className="text-sm text-gray-500">No posts yet.</p>
        ) : (
          <ul className="space-y-2">
            {posts.map((post) => (
              <li
                key={post.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-neutral-800 bg-neutral-900/40 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-gray-200">{post.title}</p>
                  <p className="text-[11px] text-gray-500">
                    {post.published ? "Published" : "Draft"}
                    {post.show_home_banner && post.published ? " · Homepage banner" : ""}
                    {" · "}
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.published && (
                    <Link
                      to={withLangPrefix(`/Updates/${post.slug}`, normalizedLang)}
                      className="clean-btn px-3 py-1.5 text-[10px]"
                    >
                      View
                    </Link>
                  )}
                  <button
                    type="button"
                    className="clean-btn px-3 py-1.5 text-[10px]"
                    onClick={() => startEdit(post)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="clean-btn border-red-800/60 px-3 py-1.5 text-[10px] text-red-300"
                    onClick={() => void deletePost(post.id)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
