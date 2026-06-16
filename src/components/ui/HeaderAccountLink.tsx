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
}

export default function HeaderAccountLink({ lang, isActive }: HeaderAccountLinkProps) {
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

  const accountBtnClass = `header-utility-btn header-account-btn${isActive ? " is-active" : ""}`;

  return (
    <Link
      to={withLangPrefix("/Account", activeLang)}
      className={accountBtnClass}
      aria-current={isActive ? "page" : undefined}
    >
      <PixelUserIcon />
      <span>{label}</span>
    </Link>
  );
}
