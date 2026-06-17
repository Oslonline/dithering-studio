"use client";

import { useEffect, useState } from "react";
import { Link } from "../../lib/nextRouterCompat";
import type { HomeBannerPost } from "../../lib/devblog/types";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";

interface WhatsNewFloaterProps {
  lang: string;
  post: HomeBannerPost;
}

function dismissKey(postId: string): string {
  return `ds_whatsnew_dismissed_${postId}`;
}

export default function WhatsNewFloater({ lang, post }: WhatsNewFloaterProps) {
  const normalizedLang = normalizeLang(lang);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(dismissKey(post.id));
      setVisible(!dismissed);
    } catch {
      setVisible(true);
    }
  }, [post.id]);

  const dismiss = () => {
    try {
      localStorage.setItem(dismissKey(post.id), "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  };

  if (!visible) return null;

  const label = post.banner_label?.trim() || "What's new";

  return (
    <aside
      className="fixed bottom-4 right-4 z-40 w-[min(100vw-2rem,22rem)] rounded-lg border border-neutral-700/80 bg-neutral-900/95 p-4 shadow-xl backdrop-blur-sm"
      aria-label={label}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[10px] font-medium uppercase tracking-[0.15em] text-blue-400">{label}</p>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded p-0.5 text-gray-500 transition-colors hover:bg-neutral-800 hover:text-gray-300"
          aria-label="Dismiss"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      <p className="mt-2 text-sm font-medium text-gray-100">{post.title}</p>
      <p className="mt-1 line-clamp-3 text-[12px] leading-relaxed text-gray-400">{post.summary}</p>
      <Link
        to={withLangPrefix(`/Updates/${post.slug}`, normalizedLang)}
        className="clean-btn clean-btn-primary mt-3 inline-flex px-3 py-1.5 text-[10px]"
        onClick={dismiss}
      >
        Read more
      </Link>
    </aside>
  );
}
