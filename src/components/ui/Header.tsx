import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import { normalizeLang, withLangPrefix } from "../../utils/localePath";
import { prefetchEducationRoutes, prefetchRoute } from "../../utils/routePrefetch";

interface HeaderProps {
  page: "tool" | "explorer" | "education";
  videoMode?: boolean;
  onModeSwitch?: () => void;
}

const Header: React.FC<HeaderProps> = ({ page, videoMode, onModeSwitch }) => {
  const { t, i18n } = useTranslation();
  const activeLang = normalizeLang(i18n.language);

  const navItems = (
    <>
      {/* Navigation */}
      {page === "tool" ? (
        <>
          <Link to={withLangPrefix("/", activeLang)} className="clean-btn px-2 py-1 !text-[10px] hover:bg-neutral-800 lg:!text-[12px]">
            {t("tool.home")}
          </Link>
          <Link to={withLangPrefix("/Education", activeLang)} className="clean-btn px-2 py-1 !text-[10px] hover:bg-neutral-800 lg:!text-[12px]" title={t("tool.educationNav")} onMouseEnter={prefetchEducationRoutes} onPointerDown={prefetchEducationRoutes}>
            {t("tool.educationNav")}
          </Link>
        </>
      ) : page === "education" ? (
        <>
          <Link to={withLangPrefix("/", activeLang)} className="clean-btn px-2 py-1 !text-[10px] hover:bg-neutral-800 lg:!text-[12px]" onMouseEnter={() => prefetchRoute("home")} onPointerDown={() => prefetchRoute("home")}>
            {t("education.header.navHome")}
          </Link>
          <Link to={withLangPrefix("/Dithering", activeLang)} className="clean-btn px-2 py-1 !text-[10px] hover:bg-neutral-800 lg:!text-[12px]" onMouseEnter={() => prefetchRoute("tool")} onPointerDown={() => prefetchRoute("tool")}>
            {t("education.header.navTool")}
          </Link>
          <Link to={withLangPrefix("/Education/Algorithms", activeLang)} className="clean-btn px-2 py-1 !text-[10px] hover:bg-neutral-800 lg:!text-[12px]" onMouseEnter={() => prefetchRoute("explorer")} onPointerDown={() => prefetchRoute("explorer")}>
            {t("education.header.navReference")}
          </Link>
        </>
      ) : (
        <>
          <Link to={withLangPrefix("/", activeLang)} className="clean-btn px-2 py-1 !text-[10px] hover:bg-neutral-800 lg:!text-[12px]" onMouseEnter={() => prefetchRoute("home")} onPointerDown={() => prefetchRoute("home")}>
            {t("explorer.header.home")}
          </Link>
          <Link to={withLangPrefix("/Dithering", activeLang)} className="clean-btn px-2 py-1 !text-[10px] hover:bg-neutral-800 lg:!text-[12px]" onMouseEnter={() => prefetchRoute("tool")} onPointerDown={() => prefetchRoute("tool")}>
            {t("explorer.header.tool")}
          </Link>
          <Link to={withLangPrefix("/Education", activeLang)} className="clean-btn px-2 py-1 !text-[10px] hover:bg-neutral-800 lg:!text-[12px]" onMouseEnter={prefetchEducationRoutes} onPointerDown={prefetchEducationRoutes}>
            {t("education.header.navEducation")}
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="border-b border-neutral-900 bg-[#0b0b0b] px-4 py-3">
      <div className="mx-auto w-full max-w-6xl">
        {/* Desktop layout: title left, nav centered, language right */}
        <div className="flex items-center justify-between md:grid md:grid-cols-3 md:items-center">
          <div className="flex items-center gap-4 md:justify-start">
            <h1 className="font-anton text-md tracking-wide text-gray-300 lg:text-lg xl:text-xl">{page === "tool" ? t("tool.intro.title") : page === "education" ? t("education.header.title") : t("explorer.header.title")}</h1>
          </div>

          <nav className="hidden items-center justify-center gap-3 md:flex">{navItems}</nav>

          <div className="flex items-center justify-end gap-3">
            {page === "tool" && onModeSwitch && (
              <div className="flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-900/40 p-0.5">
                <button type="button" onClick={onModeSwitch} className={`rounded px-3 py-1.5 text-[10px] font-medium tracking-wide transition-all ${!videoMode ? "bg-blue-600/90 text-white" : "text-gray-400 hover:text-gray-200"}`} aria-label={t("tool.switchToImages")} aria-pressed={!videoMode}>
                  {t("tool.imageMode")}
                </button>
                <button type="button" onClick={onModeSwitch} className={`rounded px-3 py-1.5 text-[10px] font-medium tracking-wide transition-all ${videoMode ? "bg-blue-600/90 text-white" : "text-gray-400 hover:text-gray-200"}`} aria-label={t("tool.switchToVideo")} aria-pressed={videoMode}>
                  {t("tool.videoMode")}
                </button>
              </div>
            )}
            <LanguageSwitcher />
          </div>
        </div>

        {/* Mobile layout: nav on second row to avoid overflow */}
        <nav className="mt-2 flex flex-wrap items-center justify-center gap-2 md:hidden">{navItems}</nav>
      </div>
    </header>
  );
};

export default Header;
