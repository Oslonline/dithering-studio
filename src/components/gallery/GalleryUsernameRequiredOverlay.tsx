"use client";

import { useEffect, useRef, useState } from "react";
import { normalizeUsernameInput } from "../../lib/auth/username";
import { createFocusTrap } from "../../utils/a11y";

interface GalleryUsernameRequiredOverlayProps {
  onComplete: (username: string) => void;
}

function profileErrorMessage(code: string | null): string | null {
  if (!code) return null;
  if (code === "username_format") return "Use 3–20 characters: letters, numbers, and underscores only.";
  if (code === "username_taken") return "That username is taken. Try another one.";
  return "Could not save username. Please try again.";
}

export default function GalleryUsernameRequiredOverlay({ onComplete }: GalleryUsernameRequiredOverlayProps) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dialogRef.current) return;
    const trap = createFocusTrap(dialogRef.current);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      trap?.();
      document.body.style.overflow = prev;
    };
  }, []);

  const save = async () => {
    const normalized = normalizeUsernameInput(username);
    if (normalized.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: normalized }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string; username?: string } | null;
      if (!response.ok || !payload?.username?.trim()) {
        setError(profileErrorMessage(payload?.error ?? null));
        setLoading(false);
        return;
      }
      onComplete(payload.username.trim());
    } catch {
      setError("Could not save username. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md"
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-username-required-title"
        className="w-full max-w-md rounded-xl border border-neutral-700 bg-[#111] p-6 shadow-2xl"
      >
        <p className="text-[10px] uppercase tracking-[0.2em] text-amber-500/90">Gallery</p>
        <h2 id="gallery-username-required-title" className="mt-2 font-anton text-2xl tracking-tight text-gray-100">
          Choose a username
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-400">
          A public handle is required before your work can be shared to the gallery. Your publication is saved — set a
          username below to continue.
        </p>

        <div className="mt-5 space-y-1.5">
          <label htmlFor="gallery-required-username" className="block text-[10px] uppercase tracking-wide text-gray-500">
            Username
          </label>
          <div className="flex overflow-hidden rounded-md border border-neutral-700 bg-neutral-900 focus-within:border-neutral-500">
            <span
              className="flex items-center border-r border-neutral-700 px-3 font-mono text-sm text-gray-500"
              aria-hidden="true"
            >
              @
            </span>
            <input
              id="gallery-required-username"
              type="text"
              name="username"
              required
              minLength={3}
              maxLength={20}
              pattern="[a-z0-9_]{3,20}"
              value={username}
              onChange={(e) => setUsername(normalizeUsernameInput(e.target.value))}
              placeholder="your_handle"
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-100 outline-none"
              autoComplete="username"
              autoFocus
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && username.length >= 3) void save();
              }}
            />
          </div>
          <p className="text-[10px] leading-relaxed text-gray-600">
            3–20 lowercase characters; letters, numbers, and underscores only.
          </p>
        </div>
        <p className="text-[10px] leading-relaxed text-gray-600">You can also set up avatar image and social links later in your profile settings page.</p>

        {error && <p className="mt-3 text-xs text-red-300">{error}</p>}

        <button
          type="button"
          className="clean-btn clean-btn-primary mt-6 w-full justify-center py-2.5 text-[11px]"
          onClick={() => void save()}
          disabled={loading || username.length < 3}
        >
          {loading ? "Saving..." : "Save username & continue"}
        </button>
      </div>
    </div>
  );
}
