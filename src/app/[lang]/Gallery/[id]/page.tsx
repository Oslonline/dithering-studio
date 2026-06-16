import type { Metadata } from "next";

import { notFound } from "next/navigation";

import GalleryDetailView from "../../../../views/GalleryDetailView";

import { getCurrentUserProfile, isCurrentUserAdmin } from "../../../../lib/auth/admin";

import { features } from "../../../../lib/features";

import { getGalleryItemById, getUserVoteForItem } from "../../../../lib/gallery/queries";

import { baseMetadata } from "../../../../lib/metadata";



export async function generateMetadata({

  params,

}: {

  params: Promise<{ lang: string; id: string }>;

}): Promise<Metadata> {

  const { lang, id } = await params;

  const item = features.gallery ? await getGalleryItemById(id) : null;

  return baseMetadata({

    lang,

    path: `/Gallery/${id}`,

    title: item ? `${item.title} | Dithering Studio Gallery` : "Gallery | Dithering Studio",

    description: item?.description ?? "Community dithering creation on Dithering Studio.",

  });

}



export default async function GalleryDetailPage({

  params,

}: {

  params: Promise<{ lang: string; id: string }>;

}) {

  if (!features.gallery) notFound();



  const { id } = await params;

  const item = await getGalleryItemById(id);

  if (!item) notFound();



  const [isAdmin, userCtx] = await Promise.all([isCurrentUserAdmin(), getCurrentUserProfile()]);

  const userId = userCtx?.user.id ?? null;

  const isAuthor = userId === item.author_id;

  const canVote = !!userId && !isAuthor;

  const userVote = canVote ? await getUserVoteForItem(userId, item.id) : null;



  return (
    <GalleryDetailView
      item={item}
      isAdmin={isAdmin}
      canVote={canVote}
      isAuthor={isAuthor}
      userVote={userVote}
    />
  );
}
