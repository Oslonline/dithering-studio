import type { Metadata } from "next";
import AccountView from "../../../views/AccountView";
import { isAdminUserPreviewEnabled } from "../../../lib/auth/admin";
import { ensureProfileFromUser, getProfile } from "../../../lib/auth/profile";
import { features } from "../../../lib/features";
import { listGalleryItemsByAuthor, listPendingGalleryItems, listRecentGalleryItems } from "../../../lib/gallery/queries";
import { listAllDevBlogPostsForAdmin } from "../../../lib/devblog/queries";
import { getAvatarPublicUrl, resolveProfileLinks } from "../../../lib/gallery/settings";
import { baseMetadata } from "../../../lib/metadata";
import { getSupabaseClientConfig } from "../../../lib/supabase/config";
import { getSupabaseServerClient } from "../../../lib/supabase/server";
import { emptyUserActivityStats } from "../../../lib/user/stats";
import { normalizeLang } from "../../../utils/localePath";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  return baseMetadata({
    lang,
    path: "/Account",
    title: "Your Account | Dithering Studio",
    description:
      "Manage your Dithering Studio account for community features like gallery sharing and saved presets.",
    noindex: true,
  });
}

function formatMemberSince(value: string | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(date);
}

function resolveAuthProvider(user: {
  app_metadata?: Record<string, unknown>;
  identities?: Array<{ provider?: string }>;
}): string | null {
  const fromMetadata = user.app_metadata?.provider;
  if (typeof fromMetadata === "string" && fromMetadata) return fromMetadata;
  const fromIdentity = user.identities?.find((identity) => identity.provider)?.provider;
  return fromIdentity ?? null;
}

export default async function AccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { lang: rawLang } = await params;
  const lang = normalizeLang(rawLang);
  const qs = await searchParams;

  if (!features.accounts) {
    return (
      <AccountView
        lang={lang}
        signedIn={false}
        email={null}
        provider={null}
        username=""
        confirmDeleteText=""
        memberSince="—"
        authError={null}
        notice={{
          title: "Accounts are disabled",
          body: "Account and gallery features are currently disabled in this environment.",
        }}
      />
    );
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    return (
      <AccountView
        lang={lang}
        signedIn={false}
        email={null}
        provider={null}
        username=""
        confirmDeleteText=""
        memberSince="—"
        authError={null}
        notice={{
          title: "Supabase is not configured",
          body: "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local, then restart the dev server.",
        }}
      />
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const authError = typeof qs.authError === "string" ? qs.authError : null;

  if (!user) {
    return (
      <AccountView
        lang={lang}
        signedIn={false}
        email={null}
        provider={null}
        username=""
        confirmDeleteText=""
        memberSince="—"
        authError={authError}
      />
    );
  }

  const ensured = await ensureProfileFromUser(supabase, user);
  const profile = ensured.data ?? (await getProfile(supabase, user.id)).data;
  const username = profile?.username?.trim() ?? "";
  const confirmDeleteText = username || user.email?.trim() || user.id;
  const memberSince = formatMemberSince(profile?.created_at ?? user.created_at);
  const myGalleryItems =
    features.gallery && supabase ? await listGalleryItemsByAuthor(user.id, 6) : [];

  const { data: extendedProfile } = await supabase
    .from("profiles")
    .select(
      "role, bio, social_links, avatar_path, media_downloads_total, image_downloads, video_downloads, last_download_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  const { count: galleryPostsCount } = await supabase
    .from("gallery_items")
    .select("id", { count: "exact", head: true })
    .eq("author_id", user.id);

  const config = getSupabaseClientConfig();
  const profileAvatarUrl =
    extendedProfile?.avatar_path && config
      ? getAvatarPublicUrl(config.url, extendedProfile.avatar_path)
      : null;

  const isActualAdminUser = extendedProfile?.role === "admin";
  const adminUserPreview = isActualAdminUser ? await isAdminUserPreviewEnabled() : false;

  const activityStats = {
    ...emptyUserActivityStats(galleryPostsCount ?? myGalleryItems.length),
    mediaDownloadsTotal: extendedProfile?.media_downloads_total ?? 0,
    imageDownloads: extendedProfile?.image_downloads ?? 0,
    videoDownloads: extendedProfile?.video_downloads ?? 0,
    galleryPostsCount: galleryPostsCount ?? myGalleryItems.length,
    lastDownloadAt: extendedProfile?.last_download_at ?? null,
  };

  const panelParam = typeof qs.panel === "string" ? qs.panel : undefined;

  let pendingModerationItems: Awaited<ReturnType<typeof listPendingGalleryItems>> = [];
  let recentModerationItems: Awaited<ReturnType<typeof listRecentGalleryItems>> = [];
  let devBlogPosts: Awaited<ReturnType<typeof listAllDevBlogPostsForAdmin>> = [];

  if (isActualAdminUser) {
    if (features.gallery) {
      [pendingModerationItems, recentModerationItems] = await Promise.all([
        listPendingGalleryItems(50),
        listRecentGalleryItems(12),
      ]);
    }
    devBlogPosts = await listAllDevBlogPostsForAdmin();
  }

  return (
    <AccountView
      lang={lang}
      signedIn
      email={user.email ?? null}
      provider={resolveAuthProvider(user)}
      username={username}
      confirmDeleteText={confirmDeleteText}
      memberSince={memberSince}
      authError={authError}
      myGalleryItems={myGalleryItems}
      isAdmin={isActualAdminUser && !adminUserPreview}
      isActualAdmin={isActualAdminUser}
      adminUserPreview={adminUserPreview}
      profileBio={extendedProfile?.bio ?? ""}
      profileSocialLinks={resolveProfileLinks(extendedProfile?.social_links)}
      profileAvatarUrl={profileAvatarUrl}
      activityStats={activityStats}
      initialPanel={panelParam}
      pendingModerationItems={pendingModerationItems}
      recentModerationItems={recentModerationItems}
      devBlogPosts={devBlogPosts}
    />
  );
}
