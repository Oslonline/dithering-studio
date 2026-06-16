"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AdminUserPreviewToggleProps {
  initialEnabled: boolean;
}

export default function AdminUserPreviewToggle({ initialEnabled }: AdminUserPreviewToggleProps) {

  const router = useRouter();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = async () => {
    const next = !enabled;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/user-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: next }),
      });
      const payload = (await response.json().catch(() => null)) as { error?: string; enabled?: boolean } | null;
      if (!response.ok) {
        setError(payload?.error ?? "Could not update preview mode.");
        setLoading(false);
        return;
      }
      setEnabled(!!payload?.enabled);
      router.refresh();
    } catch {
      setError("Could not update preview mode.");
    }
    setLoading(false);
  };

  return (
    <div className="mt-4 space-y-3 rounded-md border border-neutral-800 bg-[#0d0d0d] p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-gray-200">Preview as regular user</p>
          <p className="text-xs leading-relaxed text-gray-500">
            When on, gallery posts go to moderation, admin tools are hidden, and the app behaves like a normal
            account. Vote buttons appear on other users&apos; posts.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label="Preview as regular user"
          disabled={loading}
          onClick={toggle}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${enabled ? "bg-blue-600" : "bg-neutral-700"
            } ${loading ? "opacity-60" : ""}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${enabled ? "translate-x-5" : "translate-x-0"
              }`}
          />
        </button>
      </div>
      {enabled && (
        <p className="text-xs text-amber-300/90">
          User preview active — you are seeing the normal member experience.
        </p>
      )}
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
}


