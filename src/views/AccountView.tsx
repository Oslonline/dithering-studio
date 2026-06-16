"use client";

import Header from "../components/ui/Header";
import SiteFooter from "../components/ui/SiteFooter";
import AuthPanel from "../components/auth/AuthPanel";
import AccountDashboard from "../components/auth/AccountDashboard";
import type { GalleryItemPublic, ProfileSocialLinks } from "../lib/gallery/types";

interface AccountViewProps {
  lang: string;
  signedIn: boolean;
  email: string | null;
  provider: string | null;
  username: string;
  memberSince: string;
  confirmDeleteText: string;
  usernameSaved: boolean;
  usernameError: string | null;
  authError: string | null;
  myGalleryItems?: GalleryItemPublic[];
  isAdmin?: boolean;
  isActualAdmin?: boolean;
  adminUserPreview?: boolean;
  profileBio?: string;
  profileSocialLinks?: ProfileSocialLinks;
  profileAvatarUrl?: string | null;
  saveUsernameAction: (formData: FormData) => Promise<void>;
  notice?: { title: string; body: string };
}

export default function AccountView({
  lang,
  signedIn,
  email,
  provider,
  username,
  memberSince,
  confirmDeleteText,
  usernameSaved,
  usernameError,
  authError,
  myGalleryItems = [],
  isAdmin = false,
  isActualAdmin = false,
  adminUserPreview = false,
  profileBio = "",
  profileSocialLinks = {},
  profileAvatarUrl = null,
  saveUsernameAction,
  notice,
}: AccountViewProps) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-50">
      <Header activeNav="account" />
      <main id="main-content" className="flex flex-1 flex-col px-4 py-8 md:px-8 md:py-10">
        {notice ? (
          <div className="mx-auto w-full max-w-lg">
            <section className="rounded-lg border border-neutral-800 bg-neutral-900/40 p-6">
              <h1 className="font-anton text-2xl tracking-tight text-gray-100">{notice.title}</h1>
              <p className="mt-2 text-sm text-gray-400">{notice.body}</p>
            </section>
          </div>
        ) : !signedIn ? (
          <div className="mx-auto flex w-full max-w-md flex-col gap-6 py-4 sm:py-8">
            <header className="space-y-3 text-center">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Account</p>
              <h1 className="font-anton text-3xl tracking-tight text-gray-100 sm:text-4xl">Welcome</h1>
              <p className="text-sm leading-relaxed text-gray-400">
                Sign in to save presets, share to the gallery, and manage your public profile.
              </p>
            </header>
            <AuthPanel lang={lang} />
            <p className="text-center text-xs text-gray-500">
              The dithering tool stays fully free and client-side — an account is optional.
            </p>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-6xl flex-1">
            <AccountDashboard
            lang={lang}
            email={email}
            provider={provider}
            username={username}
            confirmDeleteText={confirmDeleteText}
            memberSince={memberSince}
            usernameSaved={usernameSaved}
            usernameError={usernameError}
            authError={authError}
            myGalleryItems={myGalleryItems}
            isAdmin={isAdmin}
            isActualAdmin={isActualAdmin}
            adminUserPreview={adminUserPreview}
            profileBio={profileBio}
            profileSocialLinks={profileSocialLinks}
            profileAvatarUrl={profileAvatarUrl}
            saveUsernameAction={saveUsernameAction}
            />
          </div>
        )}
        <SiteFooter />
      </main>
    </div>
  );
}
