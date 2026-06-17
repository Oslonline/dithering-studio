import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminModerationPanel from "../admin/AdminModerationPanel";
import AdminHubPanel from "../admin/AdminHubPanel";
import AdminDevBlogPanel from "../admin/AdminDevBlogPanel";
import AdminAppPanel from "../admin/AdminAppPanel";
import ProfileSettingsPanel from "./ProfileSettingsPanel";
import AccountProfilePreview from "./AccountProfilePreview";
import DeleteAccountDialog from "./DeleteAccountDialog";
import GalleryCard from "../gallery/GalleryCard";
import { Link } from "../../lib/nextRouterCompat";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";
import type { GalleryItemPublic, ProfileSocialLinks } from "../../lib/gallery/types";
import type { DevBlogPostRow } from "../../lib/devblog/types";
import type { UserActivityStats } from "../../lib/user/stats";

export type AccountSectionId =
  | "overview"
  | "profile"
  | "gallery"
  | "danger"
  | "admin-hub"
  | "admin-moderation"
  | "admin-devblog"
  | "admin-app";

type NavItem = { id: AccountSectionId; label: string };

interface AccountDashboardProps {
  lang: string;
  email: string | null;
  provider: string | null;
  username: string;
  confirmDeleteText: string;
  memberSince: string;
  authError: string | null;
  myGalleryItems: GalleryItemPublic[];
  isAdmin: boolean;
  isActualAdmin: boolean;
  adminUserPreview: boolean;
  profileBio: string;
  profileSocialLinks: ProfileSocialLinks;
  profileAvatarUrl: string | null;
  activityStats: UserActivityStats;
  initialPanel?: string;
  pendingModerationItems?: GalleryItemPublic[];
  recentModerationItems?: GalleryItemPublic[];
  devBlogPosts?: DevBlogPostRow[];
}

function providerLabel(provider: string | null): string {
  if (!provider) return "OAuth";
  if (provider === "github") return "GitHub";
  if (provider === "google") return "Google";
  return provider;
}

export function resolveAccountPanel(panel: string | undefined, isActualAdmin: boolean): AccountSectionId {
  if (panel === "admin") return isActualAdmin ? "admin-hub" : "overview";
  const valid: AccountSectionId[] = [
    "overview",
    "profile",
    "gallery",
    "danger",
    "admin-hub",
    "admin-moderation",
    "admin-devblog",
    "admin-app",
  ];
  if (!panel || !valid.includes(panel as AccountSectionId)) return "overview";
  if (panel.startsWith("admin-") && !isActualAdmin) return "overview";
  return panel as AccountSectionId;
}

function AccountSidebarNav({
  mainItems,
  adminItems,
  activeId,
  onSelect,
}: {
  mainItems: NavItem[];
  adminItems: NavItem[];
  activeId: AccountSectionId;
  onSelect: (id: AccountSectionId) => void;
}) {
  return (
    <nav className="hidden lg:block" aria-label="Account sections">
      <ul className="flex flex-col gap-0.5">
        {mainItems.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => onSelect(item.id)}
              className={`w-full rounded-md px-2.5 py-2 text-left text-[12px] transition-colors ${
                activeId === item.id
                  ? "bg-neutral-800/90 text-gray-100"
                  : "text-gray-500 hover:bg-neutral-900/60 hover:text-gray-200"
              }`}
              aria-current={activeId === item.id ? "page" : undefined}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      {adminItems.length > 0 && (
        <div className="mt-5 border-t border-neutral-800/80 pt-4">
          <p className="mb-2 px-2.5 text-[10px] font-medium uppercase tracking-[0.15em] text-amber-600/80">Admin</p>
          <ul className="flex flex-col gap-0.5">
            {adminItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={`w-full rounded-md px-2.5 py-2 text-left text-[12px] transition-colors ${
                    activeId === item.id
                      ? "bg-amber-950/40 text-amber-100"
                      : "text-gray-500 hover:bg-neutral-900/60 hover:text-amber-100/80"
                  }`}
                  aria-current={activeId === item.id ? "page" : undefined}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
}

function AccountMobileNav({
  items,
  activeId,
  onSelect,
}: {
  items: NavItem[];
  activeId: AccountSectionId;
  onSelect: (id: AccountSectionId) => void;
}) {
  return (
    <nav className="flex gap-1 overflow-x-auto pb-1 lg:hidden" aria-label="Account sections">
      {items.map((item) => {
        const isAdminItem = item.id.startsWith("admin-");
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`shrink-0 rounded-md px-3 py-1.5 font-mono text-[10px] transition-colors ${
              activeId === item.id
                ? isAdminItem
                  ? "bg-amber-950/50 text-amber-100"
                  : "bg-neutral-800 text-gray-100"
                : "text-gray-500 hover:bg-neutral-900 hover:text-gray-300"
            }`}
            aria-current={activeId === item.id ? "page" : undefined}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

export default function AccountDashboard({
  lang,
  email,
  provider,
  username,
  confirmDeleteText,
  memberSince,
  authError,
  myGalleryItems,
  isAdmin,
  isActualAdmin,
  adminUserPreview,
  profileBio,
  profileSocialLinks,
  profileAvatarUrl,
  activityStats,
  initialPanel,
  pendingModerationItems = [],
  recentModerationItems = [],
  devBlogPosts = [],
}: AccountDashboardProps) {
  const router = useRouter();
  const normalizedLang = normalizeLang(lang);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<AccountSectionId>(() =>
    resolveAccountPanel(initialPanel, isActualAdmin),
  );

  const mainNavItems = useMemo<NavItem[]>(() => {
    const items: NavItem[] = [
      { id: "overview", label: "Overview" },
      { id: "profile", label: "Profile" },
    ];
    if (myGalleryItems.length > 0) items.push({ id: "gallery", label: "Gallery" });
    items.push({ id: "danger", label: "Danger zone" });
    return items;
  }, [myGalleryItems.length]);

  const adminNavItems = useMemo<NavItem[]>(() => {
    if (!isActualAdmin) return [];
    return [
      { id: "admin-hub", label: "Dashboard" },
      { id: "admin-moderation", label: "Moderation" },
      { id: "admin-devblog", label: "Dev blog" },
      { id: "admin-app", label: "App control" },
    ];
  }, [isActualAdmin]);

  const allNavItems = useMemo(() => [...mainNavItems, ...adminNavItems], [mainNavItems, adminNavItems]);

  useEffect(() => {
    if (!allNavItems.some((item) => item.id === activeSection)) {
      setActiveSection("overview");
    }
  }, [allNavItems, activeSection]);

  const handleDeleteAccount = async (typedUsername: string) => {
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const response = await fetch("/auth/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: typedUsername, lang: normalizedLang }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setDeleteError(payload?.error ?? "Could not delete account. Please try again.");
        setDeleteLoading(false);
        return;
      }

      router.push(withLangPrefix("/", normalizedLang));
      router.refresh();
    } catch {
      setDeleteError("Could not delete account. Please try again.");
      setDeleteLoading(false);
    }
  };

  const signOutForm = (
    <form
      method="post"
      action={`/auth/sign-out?redirectTo=${encodeURIComponent(withLangPrefix("/", normalizedLang))}`}
    >
      <button type="submit" className="clean-btn px-4 py-2 text-[11px]">
        Sign out
      </button>
    </form>
  );

  const overviewSection = (
    <section className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-[13px] font-medium tracking-wide text-gray-100 sm:text-[14px]">Overview</h2>
        <p className="text-[11px] leading-relaxed text-gray-500 sm:text-[12px]">
          Signed in as {email ?? "no email on file"} via {providerLabel(provider)}.
        </p>
      </div>

      <AccountProfilePreview
        lang={lang}
        username={username}
        bio={profileBio}
        avatarUrl={profileAvatarUrl}
        socialLinks={profileSocialLinks}
        galleryPostsCount={activityStats.galleryPostsCount}
        onEditProfile={() => setActiveSection("profile")}
      />

      <div className="space-y-2">
        <p className="text-[10px] uppercase tracking-wide text-gray-500">Your activity</p>
        <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-neutral-800 bg-[#0d0d0d] px-4 py-3">
            <dt className="text-[10px] uppercase tracking-wide text-gray-500">Media downloaded</dt>
            <dd className="mt-1 font-mono text-lg text-gray-100">{activityStats.mediaDownloadsTotal}</dd>
            <p className="mt-1 text-[10px] text-gray-600">Exports from the dithering tool</p>
          </div>
          <div className="rounded-lg border border-neutral-800 bg-[#0d0d0d] px-4 py-3">
            <dt className="text-[10px] uppercase tracking-wide text-gray-500">Images & SVG</dt>
            <dd className="mt-1 font-mono text-lg text-gray-100">{activityStats.imageDownloads}</dd>
          </div>
          <div className="rounded-lg border border-neutral-800 bg-[#0d0d0d] px-4 py-3">
            <dt className="text-[10px] uppercase tracking-wide text-gray-500">Videos & GIFs</dt>
            <dd className="mt-1 font-mono text-lg text-gray-100">{activityStats.videoDownloads}</dd>
          </div>
          <div className="rounded-lg border border-neutral-800 bg-[#0d0d0d] px-4 py-3">
            <dt className="text-[10px] uppercase tracking-wide text-gray-500">Gallery posts</dt>
            <dd className="mt-1 font-mono text-lg text-gray-100">{activityStats.galleryPostsCount}</dd>
          </div>
        </dl>
        {activityStats.lastDownloadAt && (
          <p className="text-[10px] text-gray-600">
            Last download{" "}
            {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
              new Date(activityStats.lastDownloadAt),
            )}
          </p>
        )}
      </div>

      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-neutral-800 bg-[#0d0d0d] px-4 py-3">
          <dt className="text-[10px] uppercase tracking-wide text-gray-500">Provider</dt>
          <dd className="mt-1 text-sm text-gray-200">{providerLabel(provider)}</dd>
        </div>
        <div className="rounded-lg border border-neutral-800 bg-[#0d0d0d] px-4 py-3">
          <dt className="text-[10px] uppercase tracking-wide text-gray-500">Member since</dt>
          <dd className="mt-1 text-sm text-gray-200">{memberSince}</dd>
        </div>
      </dl>

      <div className="lg:hidden">{signOutForm}</div>
    </section>
  );

  const activePanel = (() => {
    switch (activeSection) {
      case "profile":
        return (
          <ProfileSettingsPanel
            username={username}
            bio={profileBio}
            socialLinks={profileSocialLinks}
            avatarUrl={profileAvatarUrl}
            embedded
          />
        );
      case "gallery":
        return (
          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-[13px] font-medium tracking-wide text-gray-100 sm:text-[14px]">Your gallery posts</h2>
              <p className="text-[11px] leading-relaxed text-gray-500 sm:text-[12px]">
                Creations you have shared with the community.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {myGalleryItems.map((item) => (
                <GalleryCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        );
      case "admin-hub":
        return (
          <AdminHubPanel
            lang={lang}
            adminUserPreview={adminUserPreview}
            pendingCount={pendingModerationItems.length}
            devBlogCount={devBlogPosts.length}
            onNavigate={setActiveSection}
          />
        );
      case "admin-moderation":
        return (
          <AdminModerationPanel
            pendingItems={pendingModerationItems}
            recentItems={recentModerationItems}
            lang={lang}
            canModerate={isAdmin}
          />
        );
      case "admin-devblog":
        return <AdminDevBlogPanel lang={lang} initialPosts={devBlogPosts} />;
      case "admin-app":
        return <AdminAppPanel lang={lang} />;
      case "danger":
        return (
          <section className="space-y-4">
            <div className="space-y-1">
              <h2 className="text-[13px] font-medium tracking-wide text-red-300/90 sm:text-[14px]">Danger zone</h2>
              <p className="text-[11px] leading-relaxed text-gray-500 sm:text-[12px]">
                Permanently delete your account and remove your profile from Dithering Studio.
              </p>
            </div>
            <button
              type="button"
              className="clean-btn border-red-800/60 px-4 py-2 text-[11px] text-red-300 hover:bg-red-950/40"
              onClick={() => {
                setDeleteError(null);
                setDeleteOpen(true);
              }}
            >
              Delete account
            </button>
          </section>
        );
      default:
        return overviewSection;
    }
  })();

  return (
    <>
      <div className="mx-auto w-full max-w-6xl pb-12">
        {authError && (
          <div className="mb-6 rounded-lg border border-red-800/40 bg-red-950/20 px-4 py-3 text-sm text-red-200">
            {authError === "exchange_failed"
              ? "Sign-in could not be completed. Please try again."
              : "Authentication failed. Please try again."}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[minmax(0,11rem)_1fr] lg:gap-16 xl:grid-cols-[minmax(0,14rem)_1fr]">
          <aside className="space-y-5 lg:sticky lg:top-[calc(var(--site-header-height)+1.5rem)] lg:self-start">
            <header className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Account</p>
              <h1 className="font-anton text-2xl tracking-tight text-gray-100 sm:text-3xl">Your account</h1>
              {username ? (
                <p className="text-[11px] text-gray-500">
                  <Link
                    to={withLangPrefix(`/u/${username}`, normalizedLang)}
                    className="text-gray-400 underline decoration-dotted underline-offset-2 hover:text-gray-200"
                  >
                    @{username}
                  </Link>
                </p>
              ) : null}
            </header>

            <AccountSidebarNav
              mainItems={mainNavItems}
              adminItems={adminNavItems}
              activeId={activeSection}
              onSelect={setActiveSection}
            />

            <div className="hidden border-t border-neutral-800/80 pt-5 lg:block">{signOutForm}</div>
          </aside>

          <div className="min-w-0">
            <AccountMobileNav items={allNavItems} activeId={activeSection} onSelect={setActiveSection} />

            <div className="mt-4 rounded-lg border border-neutral-800/80 bg-neutral-900/20 p-5 sm:p-6 lg:mt-0 lg:min-h-[28rem]">
              {activePanel}
            </div>
          </div>
        </div>
      </div>

      <DeleteAccountDialog
        open={deleteOpen}
        confirmText={confirmDeleteText}
        confirmHint={username ? "Type your username" : email ? "Type your email" : "Type your account ID"}
        loading={deleteLoading}
        error={deleteError}
        onClose={() => {
          if (!deleteLoading) setDeleteOpen(false);
        }}
        onConfirm={handleDeleteAccount}
      />
    </>
  );
}
