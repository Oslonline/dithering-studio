import { notFound } from "next/navigation";
import PublicProfileView from "../../../../views/PublicProfileView";
import { getProfileByUsername, listGalleryItemsByUsername } from "../../../../lib/gallery/queries";

export default async function UserProfilePage({ params }: { params: Promise<{ lang: string; username: string }> }) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const items = await listGalleryItemsByUsername(profile.username, 48);
  return <PublicProfileView profile={profile} items={items} />;
}
