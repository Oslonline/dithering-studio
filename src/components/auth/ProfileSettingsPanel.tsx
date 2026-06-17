"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { AVATARS_BUCKET } from "../../lib/gallery/types";
import type { ProfileSocialLinks } from "../../lib/gallery/types";

interface ProfileSettingsPanelProps {
  username: string;
  bio: string;
  socialLinks: ProfileSocialLinks;
  avatarUrl: string | null;
  embedded?: boolean;
}

function profileErrorMessage(code: string | null): string | null {
  if (!code) return null;
  if (code === "username_format") return "Invalid username format.";
  if (code === "username_taken") return "Username is unavailable. Please choose another one.";
  return "Could not save profile. Please try again.";
}

export default function ProfileSettingsPanel({
  username: initialUsername,
  bio: initialBio,
  socialLinks: initialLinks,
  avatarUrl,
  embedded = false,
}: ProfileSettingsPanelProps) {
  const router = useRouter();
  const [username, setUsername] = useState(initialUsername);
  const [bio, setBio] = useState(initialBio);
  const [links, setLinks] = useState<ProfileSocialLinks>(initialLinks);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(avatarUrl);

  useEffect(() => {
    setUsername(initialUsername);
    setBio(initialBio);
    setLinks(initialLinks);
    setAvatarPreview(avatarUrl);
  }, [initialUsername, initialBio, initialLinks, avatarUrl]);

  const save = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), bio, social_links: links }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(profileErrorMessage(payload?.error ?? null));
        setLoading(false);
        return;
      }
      setMessage("Profile saved.");
      router.refresh();
    } catch {
      setError("Could not save profile.");
    }
    setLoading(false);
  };

  const uploadAvatar = async (file: File) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    setError(null);
    const path = `${user.id}/avatar.webp`;
    const { error: uploadError } = await supabase.storage.from(AVATARS_BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (uploadError) {
      setError("Could not upload avatar.");
      return;
    }

    const { error: updateError } = await supabase.from("profiles").update({ avatar_path: path }).eq("id", user.id);
    if (updateError) {
      setError("Could not save avatar.");
      return;
    }

    setAvatarPreview(URL.createObjectURL(file));
    setMessage("Avatar updated.");
    router.refresh();
  };

  return (
    <section className={embedded ? "space-y-6" : "rounded-lg border border-neutral-800 bg-neutral-900/40 p-6"}>
      <div className={embedded ? "space-y-1" : "mb-5 space-y-1"}>
        <h2
          className={
            embedded
              ? "text-[13px] font-medium tracking-wide text-gray-100 sm:text-[14px]"
              : "text-sm font-medium tracking-wide text-gray-200"
          }
        >
          Public profile
        </h2>
        <p className={embedded ? "text-[11px] leading-relaxed text-gray-500 sm:text-[12px]" : "text-xs text-gray-500"}>
          How you appear on gallery posts and your public profile page.
        </p>
      </div>

      <div className="mb-5 flex items-center gap-4">
        {avatarPreview ? (
          <img src={avatarPreview} alt="" className="h-16 w-16 rounded-full border border-neutral-700 object-cover" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-sm text-gray-400">
            ?
          </span>
        )}
        <label className="clean-btn cursor-pointer px-3 py-1.5 text-[10px]">
          Upload avatar
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void uploadAvatar(file);
            }}
          />
        </label>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="account-username" className="block text-[10px] uppercase tracking-wide text-gray-500">
            Username
          </label>
          <div className="flex overflow-hidden rounded-md border border-neutral-700 bg-neutral-900 focus-within:border-neutral-500">
            <span className="flex items-center border-r border-neutral-700 px-3 font-mono text-sm text-gray-500" aria-hidden="true">
              @
            </span>
            <input
              id="account-username"
              type="text"
              name="username"
              required
              minLength={3}
              maxLength={20}
              pattern="[A-Za-z0-9_]{3,20}"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/[^A-Za-z0-9_]/g, "").slice(0, 20))}
              placeholder="your_handle"
              className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm text-gray-100 outline-none"
              autoComplete="username"
            />
          </div>
          <p className="text-[10px] leading-relaxed text-gray-600">
            Your unique public handle — shown as{" "}
            <span className="font-mono text-gray-500">@{username || "username"}</span> on your profile and gallery
            posts. 3–20 characters; letters, numbers, and underscores only.
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="account-bio" className="block text-[10px] uppercase tracking-wide text-gray-500">
            Bio
          </label>
          <textarea
            id="account-bio"
            value={bio}
            onChange={(event) => setBio(event.target.value.slice(0, 280))}
            rows={3}
            placeholder="Short bio..."
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-gray-100"
          />
          <p className="text-[10px] text-gray-600">{bio.length}/280</p>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] uppercase tracking-wide text-gray-500">Social links</p>
          <input
            type="url"
            value={links.x ?? ""}
            onChange={(event) => setLinks((prev) => ({ ...prev, x: event.target.value }))}
            placeholder="X profile URL"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-gray-100"
          />
          <input
            type="url"
            value={links.figma ?? ""}
            onChange={(event) => setLinks((prev) => ({ ...prev, figma: event.target.value }))}
            placeholder="Figma profile URL"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-gray-100"
          />
          <input
            type="url"
            value={links.cosmos ?? ""}
            onChange={(event) => setLinks((prev) => ({ ...prev, cosmos: event.target.value }))}
            placeholder="Cosmos profile URL"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-gray-100"
          />
        </div>

        <button
          type="button"
          className="clean-btn clean-btn-primary px-4 py-2 text-[11px]"
          onClick={() => void save()}
          disabled={loading || username.trim().length < 3}
        >
          {loading ? "Saving..." : "Save profile"}
        </button>
      </div>

      {message && <p className="text-xs text-emerald-300">{message}</p>}
      {error && <p className="text-xs text-red-300">{error}</p>}
    </section>
  );
}
