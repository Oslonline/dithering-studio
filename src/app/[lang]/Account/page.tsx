import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import AccountView from "../../../views/AccountView";
import { isAdminUserPreviewEnabled } from "../../../lib/auth/admin";
import { ensureProfileFromUser, getProfile } from "../../../lib/auth/profile";
import { USERNAME_REGEX } from "../../../lib/auth/types";
import { features } from "../../../lib/features";
import { listGalleryItemsByAuthor } from "../../../lib/gallery/queries";
import { getAvatarPublicUrl, resolveProfileLinks } from "../../../lib/gallery/settings";
import { baseMetadata } from "../../../lib/metadata";
import { getSupabaseClientConfig } from "../../../lib/supabase/config";
import { getSupabaseServerClient } from "../../../lib/supabase/server";
import { normalizeLang, withLangPrefix } from "../../../utils/localePath";

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

async function saveUsername(formData: FormData) {
  "use server";

  const rawLang = formData.get("lang");
  const lang = normalizeLang(typeof rawLang === "string" ? rawLang : "en");
  const username = String(formData.get("username") ?? "").trim();
  const accountPath = withLangPrefix("/Account", lang);

  if (!USERNAME_REGEX.test(username)) {
    redirect(`${accountPath}?usernameError=format`);
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) {
    redirect(`${accountPath}?usernameError=config`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(accountPath);
  }

  const existing = await getProfile(supabase, user.id);
  const existingUsername = existing.data?.username?.trim() ?? "";
  if (existingUsername && existingUsername.toLowerCase() === username.toLowerCase()) {
    revalidatePath(accountPath);
    redirect(`${accountPath}?usernameSaved=1`);
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      username,
    },
    { onConflict: "id" },
  );

  if (error) {
    if (error.code === "23505") {
      redirect(`${accountPath}?usernameError=taken`);
    }
    if (error.code === "42P01") {
      redirect(`${accountPath}?usernameError=missing_table`);
    }
    if (error.code === "42501") {
      redirect(`${accountPath}?usernameError=rls_denied`);
    }
    redirect(
      `${accountPath}?usernameError=unknown&usernameErrorCode=${encodeURIComponent(error.code ?? "unknown")}`,
    );
  }

  revalidatePath(accountPath);
  redirect(`${accountPath}?usernameSaved=1`);
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
        usernameSaved={false}
        usernameError={null}
        authError={null}
        saveUsernameAction={saveUsername}
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
        usernameSaved={false}
        usernameError={null}
        authError={null}
        saveUsernameAction={saveUsername}
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

  const usernameError = typeof qs.usernameError === "string" ? qs.usernameError : null;
  const usernameSaved = qs.usernameSaved === "1";
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
        usernameSaved={false}
        usernameError={null}
        authError={authError}
        saveUsernameAction={saveUsername}
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
    .select("role, bio, social_links, avatar_path")
    .eq("id", user.id)
    .maybeSingle();

  const config = getSupabaseClientConfig();
  const profileAvatarUrl =
    extendedProfile?.avatar_path && config
      ? getAvatarPublicUrl(config.url, extendedProfile.avatar_path)
      : null;

  const isActualAdminUser = extendedProfile?.role === "admin";
  const adminUserPreview = isActualAdminUser ? await isAdminUserPreviewEnabled() : false;

  return (
    <AccountView
      lang={lang}
      signedIn
      email={user.email ?? null}
      provider={resolveAuthProvider(user)}
      username={username}
      confirmDeleteText={confirmDeleteText}
      memberSince={memberSince}
      usernameSaved={usernameSaved}
      usernameError={usernameError}
      authError={authError}
      myGalleryItems={myGalleryItems}
      isAdmin={isActualAdminUser && !adminUserPreview}
      isActualAdmin={isActualAdminUser}
      adminUserPreview={adminUserPreview}
      profileBio={extendedProfile?.bio ?? ""}
      profileSocialLinks={resolveProfileLinks(extendedProfile?.social_links)}
      profileAvatarUrl={profileAvatarUrl}
      saveUsernameAction={saveUsername}
    />
  );
}
