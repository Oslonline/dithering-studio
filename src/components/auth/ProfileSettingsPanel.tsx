"use client";

import { useState } from "react";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { AVATARS_BUCKET } from "../../lib/gallery/types";
import type { ProfileSocialLinks } from "../../lib/gallery/types";
import { normalizeLang } from "../../utils/localePath";

interface ProfileSettingsPanelProps {
  lang: string;
  username: string;
  usernameSaved: boolean;
  usernameError: string | null;
  saveUsernameAction: (formData: FormData) => Promise<void>;
  bio: string;
  socialLinks: ProfileSocialLinks;
  avatarUrl: string | null;
  embedded?: boolean;
}

function UsernameFeedback({
  usernameSaved,
  usernameError,
}: {
  usernameSaved: boolean;
  usernameError: string | null;
}) {
  if (usernameSaved) {
    return <p className="text-xs text-emerald-300">Username saved.</p>;
  }
  if (usernameError === "format") {
    return <p className="text-xs text-red-300">Invalid username format.</p>;
  }
  if (usernameError === "taken") {
    return <p className="text-xs text-red-300">Username is unavailable. Please choose another one.</p>;
  }
  if (usernameError === "missing_table") {
    return <p className="text-xs text-red-300">Profile setup is unavailable right now. Please try again later.</p>;
  }
  if (usernameError === "rls_denied" || usernameError === "unknown") {
    return <p className="text-xs text-red-300">Could not save username. Please try again.</p>;
  }
  return null;
}

export default function ProfileSettingsPanel({
  lang,
  username,
  usernameSaved,
  usernameError,
  saveUsernameAction,
  bio: initialBio,
  socialLinks: initialLinks,
  avatarUrl,
  embedded = false,
}: ProfileSettingsPanelProps) {
  const normalizedLang = normalizeLang(lang);
  const [bio, setBio] = useState(initialBio);
  const [links, setLinks] = useState<ProfileSocialLinks>(initialLinks);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(avatarUrl);

  const save = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, social_links: links }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Could not save profile.");
        setLoading(false);
        return;
      }
      setMessage("Profile saved.");
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
  };

  return (
    <section className={embedded ? "space-y-5" : "rounded-lg border border-neutral-800 bg-neutral-900/40 p-6"}>
      <div className={embedded ? "space-y-1" : "mb-5 space-y-1"}>
        <h2 className={embedded ? "text-[13px] font-medium tracking-wide text-gray-100 sm:text-[14px]" : "text-sm font-medium tracking-wide text-gray-200"}>
          Public profile
        </h2>
        <p className={embedded ? "text-[11px] leading-relaxed text-gray-500 sm:text-[12px]" : "text-xs text-gray-500"}>
          Username, avatar, and links shown on gallery posts and your public profile page.
        </p>
      </div>

      <div className="space-y-5">
        <form action={saveUsernameAction} className="space-y-2">
          <input type="hidden" name="lang" value={normalizedLang} />
          <label htmlFor="account-username" className="block text-[10px] uppercase tracking-wide text-gray-500">
            Username
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
            <input
              id="account-username"
              type="text"
              name="username"
              required
              minLength={3}
              maxLength={20}
              pattern="[A-Za-z0-9_]{3,20}"
              defaultValue={username}
              placeholder="your_handle"
              className="min-w-0 flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-gray-100"
            />
            <button type="submit" className="clean-btn clean-btn-primary shrink-0 px-4 py-2 text-[11px]">
              Save username
            </button>
          </div>
          <p className="text-[10px] text-gray-600">3–20 characters: letters, numbers, underscores.</p>
          <UsernameFeedback usernameSaved={usernameSaved} usernameError={usernameError} />
        </form>

        <div className="border-t border-neutral-800 pt-5">
          <p className="mb-3 text-[10px] uppercase tracking-wide text-gray-500">Avatar and bio</p>
          <div className="mb-4 flex items-center gap-4">
            {avatarPreview ? (
              <img src={avatarPreview} alt="" className="h-14 w-14 rounded-full border border-neutral-700 object-cover" />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900 text-sm text-gray-400">
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
                  if (file) uploadAvatar(file);
                }}
              />
            </label>
          </div>

          <div className="space-y-3">
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value.slice(0, 280))}
              rows={3}
              placeholder="Short bio..."
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-gray-100"
            />
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
            <button
              type="button"
              className="clean-btn clean-btn-primary px-4 py-2 text-[11px]"
              onClick={save}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save profile"}
            </button>
          </div>
        </div>
      </div>

      {message && <p className="mt-4 text-xs text-emerald-300">{message}</p>}
      {error && <p className="mt-4 text-xs text-red-300">{error}</p>}
    </section>
  );
}
