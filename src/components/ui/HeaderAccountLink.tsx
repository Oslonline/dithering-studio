"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "../../lib/nextRouterCompat";
import { getSupabaseBrowserClient } from "../../lib/supabase/client";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";
import PixelUserIcon from "./PixelUserIcon";

interface HeaderAccountLinkProps {
  lang: string;
  isActive: boolean;
  variant?: "default" | "menu";
  onNavigate?: () => void;
}

export default function HeaderAccountLink({
  lang,
  isActive,
  variant = "default",
  onNavigate,
}: HeaderAccountLinkProps) {
  const { t } = useTranslation();
  const activeLang = normalizeLang(lang);
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setSignedIn(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSignedIn(!!session?.user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const label =
    signedIn === true
      ? t("header.nav.account", { defaultValue: "Account" })
      : t("header.nav.createAccount", { defaultValue: "Create an account" });

  const accountBtnClass =
    variant === "menu"
      ? `flex w-full items-center gap-3 rounded-md px-3 py-3 text-left font-mono text-[13px] transition-colors ${
          isActive ? "bg-neutral-800 text-gray-100" : "text-gray-300 hover:bg-neutral-900 hover:text-gray-100"
        }`
      : `header-utility-btn header-account-btn${isActive ? " is-active" : ""}`;

  return (
    <Link
      to={withLangPrefix("/Account", activeLang)}
      className={accountBtnClass}
      aria-current={isActive ? "page" : undefined}
      onClick={onNavigate}
    >
      <PixelUserIcon />
      <span>{label}</span>
    </Link>
  );
}
