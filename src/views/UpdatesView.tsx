"use client";

import React from "react";
import Header from "../components/ui/Header";
import SiteFooter from "../components/ui/SiteFooter";
import { Link } from "../lib/nextRouterCompat";
import type { DevBlogPostPublic } from "../lib/devblog/types";
import { normalizeLang, withLangPrefix } from "../utils/localePath";

interface UpdatesViewProps {
  lang: string;
  posts: DevBlogPostPublic[];
  activePost?: DevBlogPostPublic | null;
}

function formatDate(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(date);
}

function renderBody(body: string): React.ReactNode {
  const paragraphs = body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return paragraphs.map((paragraph, index) => (
    <p key={index} className="text-sm leading-relaxed text-gray-300">
      {paragraph.split("\n").map((line, lineIndex) => (
        <span key={lineIndex}>
          {lineIndex > 0 && <br />}
          {line}
        </span>
      ))}
    </p>
  ));
}

export default function UpdatesView({ lang, posts, activePost = null }: UpdatesViewProps) {
  const normalizedLang = normalizeLang(lang);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-50">
      <Header />
      <main id="main-content" className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 pt-10 md:px-8">
        <header className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Product updates</p>
          <h1 className="font-anton text-3xl tracking-tight text-gray-100">
            {activePost ? activePost.title : "What's new"}
          </h1>
          {activePost ? (
            <p className="text-sm text-gray-500">{formatDate(activePost.published_at ?? activePost.created_at)}</p>
          ) : (
            <p className="text-sm text-gray-400">Release notes and major improvements to Dithering Studio.</p>
          )}
        </header>

        {activePost ? (
          <article className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900/30 p-5 sm:p-6">
            <div className="space-y-4">{renderBody(activePost.body)}</div>
            <Link to={withLangPrefix("/Updates", normalizedLang)} className="clean-btn inline-flex px-3 py-1.5 text-[10px]">
              All updates
            </Link>
          </article>
        ) : posts.length === 0 ? (
          <p className="text-sm text-gray-500">No updates published yet.</p>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li key={post.id}>
                <Link
                  to={withLangPrefix(`/Updates/${post.slug}`, normalizedLang)}
                  className="block rounded-lg border border-neutral-800 bg-neutral-900/30 p-5 transition-colors hover:border-neutral-700 hover:bg-neutral-900/50"
                >
                  <p className="text-[11px] text-gray-500">{formatDate(post.published_at ?? post.created_at)}</p>
                  <h2 className="mt-1 text-lg font-medium text-gray-100">{post.title}</h2>
                  <p className="mt-2 line-clamp-2 text-sm text-gray-400">{post.summary}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <SiteFooter />
      </main>
    </div>
  );
}
