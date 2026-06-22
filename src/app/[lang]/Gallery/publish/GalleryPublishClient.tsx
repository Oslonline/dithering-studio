"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GalleryPublishConfirmView from "../../../../views/GalleryPublishConfirmView";
import { loadPublishDraft, type GalleryPublishDraft } from "../../../../lib/gallery/publishDraft";
import { galleryToolBasePath } from "../../../../lib/gallery/settings";
import { getSupabaseBrowserClient } from "../../../../lib/supabase/client";
import { normalizeLang, withLangPrefix } from "../../../../utils/localePath";

export default function GalleryPublishClient({ lang }: { lang: string }) {
  const router = useRouter();
  const normalizedLang = normalizeLang(lang);
  const [draft, setDraft] = useState<GalleryPublishDraft | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const loaded = loadPublishDraft();
    if (!loaded) {
      router.replace(galleryToolBasePath({ mode: "image" }, normalizedLang));
      return;
    }
    setDraft(loaded);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      router.replace(withLangPrefix("/Account", normalizedLang));
      return;
    }

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace(withLangPrefix("/Account", normalizedLang));
        return;
      }
      const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
      if (profile?.username?.trim()) {
        setUsername(profile.username.trim());
      }
      setReady(true);
    });
  }, [normalizedLang, router]);

  if (!ready || !draft) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-sm text-gray-400">
        Preparing publication...
      </div>
    );
  }

  return (
    <GalleryPublishConfirmView
      lang={normalizedLang}
      username={username}
      draft={draft}
      onUsernameSet={setUsername}
    />
  );
}
