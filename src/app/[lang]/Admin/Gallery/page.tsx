import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AdminModerationView from "../../../../views/AdminModerationView";
import { isCurrentUserAdmin } from "../../../../lib/auth/admin";
import { listPendingGalleryItems, listRecentGalleryItems } from "../../../../lib/gallery/queries";
import { baseMetadata } from "../../../../lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return baseMetadata({
    lang,
    path: "/Admin/Gallery",
    title: "Gallery moderation | Dithering Studio",
    description: "Admin moderation queue.",
    noindex: true,
  });
}

export default async function AdminGalleryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!(await isCurrentUserAdmin())) {
    redirect(`/${lang}`);
  }

  const [pendingItems, recentItems] = await Promise.all([
    listPendingGalleryItems(50),
    listRecentGalleryItems(12),
  ]);

  return <AdminModerationView pendingItems={pendingItems} recentItems={recentItems} lang={lang} />;
}
