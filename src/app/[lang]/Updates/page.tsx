import type { Metadata } from "next";
import UpdatesView from "../../../views/UpdatesView";
import { listPublishedDevBlogPosts } from "../../../lib/devblog/queries";
import { baseMetadata } from "../../../lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return baseMetadata({
    lang,
    path: "/Updates",
    title: "What's New | Dithering Studio",
    description: "Release notes and product updates for Dithering Studio.",
  });
}

export default async function UpdatesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const posts = await listPublishedDevBlogPosts();

  return <UpdatesView lang={lang} posts={posts} />;
}
