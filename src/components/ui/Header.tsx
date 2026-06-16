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
  return (
    <header className="site-header shrink-0 border-b border-neutral-900 bg-[#0b0b0b] px-4 py-3">
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
            {features.accounts && (
              <HeaderAccountLink lang={activeLang} isActive={activeNav === "account"} />
            )}
            <LanguageSwitcher />
          </div>
        </div>

        <nav className="mt-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 md:hidden" aria-label="Main">
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
      </div>
    </header>
  );
};

export default Header;
