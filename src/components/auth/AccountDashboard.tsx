"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminUserPreviewToggle from "./AdminUserPreviewToggle";
import ProfileSettingsPanel from "./ProfileSettingsPanel";
import DeleteAccountDialog from "./DeleteAccountDialog";
import GalleryCard from "../gallery/GalleryCard";
import { Link } from "../../lib/nextRouterCompat";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";
import type { GalleryItemPublic, ProfileSocialLinks } from "../../lib/gallery/types";

interface AccountDashboardProps {
  lang: string;
  email: string | null;
  provider: string | null;
  username: string;
  confirmDeleteText: string;
  memberSince: string;
  usernameSaved: boolean;
  usernameError: string | null;
  authError: string | null;
  myGalleryItems: GalleryItemPublic[];
  isAdmin: boolean;
  isActualAdmin: boolean;
  adminUserPreview: boolean;
  profileBio: string;
  profileSocialLinks: ProfileSocialLinks;
  profileAvatarUrl: string | null;
  saveUsernameAction: (formData: FormData) => Promise<void>;
}

function providerLabel(provider: string | null): string {
  if (!provider) return "OAuth";
  if (provider === "github") return "GitHub";
  if (provider === "google") return "Google";
  return provider;
}

type NavItem = { id: string; label: string };

function AccountNav({ items }: { items: NavItem[] }) {
  return (
    <nav className="hidden lg:block" aria-label="Account sections">
      <ul className="flex flex-col gap-0">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="block py-1.5 text-[12px] text-gray-500 transition-colors hover:text-gray-200"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
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
  usernameSaved,
  usernameError,
  authError,
  myGalleryItems,
  isAdmin,
  isActualAdmin,
  adminUserPreview,
  profileBio,
  profileSocialLinks,
  profileAvatarUrl,
  saveUsernameAction,
}: AccountDashboardProps) {
  const router = useRouter();
  const normalizedLang = normalizeLang(lang);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const navItems: NavItem[] = [
    { id: "account-overview", label: "Overview" },
    { id: "account-profile", label: "Profile" },
  ];
  if (myGalleryItems.length > 0) navItems.push({ id: "account-gallery", label: "Gallery" });
  if (isActualAdmin) navItems.push({ id: "account-admin", label: "Admin" });
  navItems.push({ id: "account-danger", label: "Danger zone" });

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

        <div className="grid gap-10 lg:grid-cols-[minmax(0,11rem)_1fr] lg:gap-16 xl:grid-cols-[minmax(0,14rem)_1fr]">
          <aside className="space-y-6 lg:sticky lg:top-[calc(var(--site-header-height)+1.5rem)] lg:self-start">
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

            <AccountNav items={navItems} />

            <div className="hidden border-t border-neutral-800/80 pt-5 lg:block">{signOutForm}</div>
          </aside>

          <div className="min-w-0 divide-y divide-neutral-800/80">
            <section id="account-overview" className="scroll-mt-28 space-y-5 py-8 first:pt-0 sm:py-10">
              <div className="space-y-1">
                <h2 className="text-[13px] font-medium tracking-wide text-gray-100 sm:text-[14px]">Overview</h2>
                <p className="text-[11px] leading-relaxed text-gray-500 sm:text-[12px]">
                  Signed in as {email ?? "no email on file"} via {providerLabel(provider)}.
                </p>
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

            <section id="account-profile" className="scroll-mt-28 py-8 sm:py-10">
              <ProfileSettingsPanel
                lang={lang}
                username={username}
                usernameSaved={usernameSaved}
                usernameError={usernameError}
                saveUsernameAction={saveUsernameAction}
                bio={profileBio}
                socialLinks={profileSocialLinks}
                avatarUrl={profileAvatarUrl}
                embedded
              />
            </section>

            {myGalleryItems.length > 0 && (
              <section id="account-gallery" className="scroll-mt-28 space-y-4 py-8 sm:py-10">
                <div className="space-y-1">
                  <h2 className="text-[13px] font-medium tracking-wide text-gray-100 sm:text-[14px]">
                    Your gallery posts
                  </h2>
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
            )}

            {isActualAdmin && (
              <section id="account-admin" className="scroll-mt-28 space-y-4 py-8 sm:py-10">
                <div className="space-y-1">
                  <h2 className="text-[13px] font-medium tracking-wide text-amber-200/90 sm:text-[14px]">Admin</h2>
                  <p className="text-[11px] leading-relaxed text-gray-500 sm:text-[12px]">
                    Moderation tools and preview mode.
                  </p>
                </div>
                <div className="rounded-lg border border-amber-900/25 bg-amber-950/10 p-4 sm:p-5">
                  <AdminUserPreviewToggle initialEnabled={adminUserPreview} />
                  {isAdmin && (
                    <div className="mt-4 border-t border-amber-900/20 pt-4">
                      <p className="text-[11px] text-gray-500">Moderate pending gallery submissions.</p>
                      <Link
                        to={withLangPrefix("/Admin/Gallery", normalizedLang)}
                        className="clean-btn mt-3 inline-flex px-4 py-2 text-[11px]"
                      >
                        Open moderation queue
                      </Link>
                    </div>
                  )}
                </div>
              </section>
            )}

            <section id="account-danger" className="scroll-mt-28 space-y-4 py-8 sm:py-10">
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
          </div>
        </div>
      </div>

      <DeleteAccountDialog
        open={deleteOpen}
        confirmText={confirmDeleteText}
        confirmHint={
          username ? "Type your username" : email ? "Type your email" : "Type your account ID"
        }
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
