import { useEffect, useState } from "react";
import { Link } from "../../lib/nextRouterCompat";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import HeaderAccountLink from "./HeaderAccountLink";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";
import { prefetchEducationRoutes, prefetchRoute } from "../../utils/routePrefetch";
import { features } from "../../lib/features";

export type HeaderActiveNav = "home" | "tool" | "education" | "algorithms" | "gallery" | "account";

interface HeaderProps {
  /** Current section — its nav link is hidden in the center bar. */
  activeNav?: HeaderActiveNav;
}

type NavItem = {
  key: HeaderActiveNav;
  href: string;
  labelKey: string;
  defaultLabel: string;
  prefetch?: () => void;
};

const Header: React.FC<HeaderProps> = ({ activeNav }) => {
  const { t, i18n } = useTranslation();
  const activeLang = normalizeLang(i18n.language);
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      key: "home",
      href: "/",
      labelKey: "header.nav.home",
      defaultLabel: "Home",
      prefetch: () => prefetchRoute("home"),
    },
    {
      key: "tool",
      href: "/Dithering",
      labelKey: "header.nav.tool",
      defaultLabel: "Tool",
      prefetch: () => prefetchRoute("tool"),
    },
    {
      key: "education",
      href: "/Education",
      labelKey: "header.nav.education",
      defaultLabel: "Education",
      prefetch: prefetchEducationRoutes,
    },
    {
      key: "algorithms",
      href: "/Education/Algorithms",
      labelKey: "header.nav.algorithms",
      defaultLabel: "Algorithms",
      prefetch: () => prefetchRoute("explorer"),
    },
  ];

  if (features.gallery) {
    navItems.push({
      key: "gallery",
      href: "/Gallery",
      labelKey: "header.nav.gallery",
      defaultLabel: "Gallery",
    });
  }

  const visibleNav = navItems.filter((item) => item.key !== activeNav);
  const linkClass = "header-nav-link !text-[12px] lg:!text-[14px] font-mono text-gray-100";

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [activeNav]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header relative shrink-0 border-b border-neutral-900 bg-[#0b0b0b] px-4 py-3">
      <div className="mx-auto w-full max-w-4/5">
        <div className="flex items-center justify-between md:grid md:grid-cols-3 md:items-center">
          <div className="flex items-center md:justify-start">
            <Link
              to={withLangPrefix("/", activeLang)}
              className="font-anton text-md tracking-wide text-gray-300 transition-colors hover:text-gray-100 lg:text-lg xl:text-xl"
              onMouseEnter={() => prefetchRoute("home")}
              onPointerDown={() => prefetchRoute("home")}
            >
              {t("header.brand", { defaultValue: "DitheringStudio" })}
            </Link>
          </div>

          <nav className="hidden items-center justify-center gap-4 md:flex lg:gap-6" aria-label="Main">
            {visibleNav.map((item) => (
              <Link
                key={item.key}
                to={withLangPrefix(item.href, activeLang)}
                className={linkClass}
                onMouseEnter={item.prefetch}
                onPointerDown={item.prefetch}
              >
                {t(item.labelKey, { defaultValue: item.defaultLabel })}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-2 sm:gap-3">
            <div className="hidden items-center gap-2 sm:gap-3 md:flex">
              {features.accounts && (
                <HeaderAccountLink lang={activeLang} isActive={activeNav === "account"} />
              )}
              <LanguageSwitcher />
            </div>

            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-800 text-gray-300 transition-colors hover:border-neutral-700 hover:bg-neutral-900 hover:text-gray-100 md:hidden"
              aria-expanded={menuOpen}
              aria-controls="mobile-nav-overlay"
              aria-label={
                menuOpen
                  ? t("header.menu.close", { defaultValue: "Close menu" })
                  : t("header.menu.open", { defaultValue: "Open menu" })
              }
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                  <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-nav-overlay"
          className="fixed inset-0 z-50 flex flex-col bg-[#0b0b0b] md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t("header.menu.label", { defaultValue: "Navigation" })}
        >
          <div className="flex items-center justify-between border-b border-neutral-900 px-4 py-3">
            <Link
              to={withLangPrefix("/", activeLang)}
              className="font-anton text-md tracking-wide text-gray-300"
              onClick={closeMenu}
            >
              {t("header.brand", { defaultValue: "DitheringStudio" })}
            </Link>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-800 text-gray-300"
              aria-label={t("header.menu.close", { defaultValue: "Close menu" })}
              onClick={closeMenu}
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
                <path d="M3 3l12 12M15 3L3 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Main">
            <ul className="flex flex-col gap-1">
              {navItems.map((item) => (
                <li key={item.key}>
                  <Link
                    to={withLangPrefix(item.href, activeLang)}
                    className={`block rounded-md px-3 py-3 font-mono text-[15px] transition-colors ${
                      activeNav === item.key
                        ? "bg-neutral-800 text-gray-100"
                        : "text-gray-300 hover:bg-neutral-900 hover:text-gray-100"
                    }`}
                    onClick={closeMenu}
                    onMouseEnter={item.prefetch}
                    onPointerDown={item.prefetch}
                  >
                    {t(item.labelKey, { defaultValue: item.defaultLabel })}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 space-y-6 border-t border-neutral-900 pt-6">
              {features.accounts && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
                    {t("header.menu.accountSection", { defaultValue: "Account" })}
                  </p>
                  <HeaderAccountLink
                    lang={activeLang}
                    isActive={activeNav === "account"}
                    variant="menu"
                    onNavigate={closeMenu}
                  />
                </div>
              )}

              <LanguageSwitcher variant="list" onAfterChange={closeMenu} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
