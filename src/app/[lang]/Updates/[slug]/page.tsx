import type { Metadata } from "next";
import { notFound } from "next/navigation";
import UpdatesView from "../../../../views/UpdatesView";
import { getPublishedDevBlogPostBySlug, listPublishedDevBlogPosts } from "../../../../lib/devblog/queries";
import { baseMetadata } from "../../../../lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const post = await getPublishedDevBlogPostBySlug(slug);
  if (!post) {
    return baseMetadata({
      lang,
      path: `/Updates/${slug}`,
      title: "Update not found | Dithering Studio",
      description: "This update could not be found.",
      noindex: true,
    });
  }
  return baseMetadata({
    lang,
    path: `/Updates/${slug}`,
    title: `${post.title} | Dithering Studio`,
    description: post.summary,
  });
}

export default async function UpdateDetailPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  const [post, posts] = await Promise.all([
    getPublishedDevBlogPostBySlug(slug),
    listPublishedDevBlogPosts(),
  ]);

  if (!post) notFound();

  return <UpdatesView lang={lang} posts={posts} activePost={post} />;
}
