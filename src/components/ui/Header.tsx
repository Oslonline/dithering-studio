import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

interface HeaderProps {
  page: "tool" | "explorer";
  videoMode?: boolean;
  onModeSwitch?: () => void;
}

const Header: React.FC<HeaderProps> = ({ page, videoMode, onModeSwitch }) => {
  const { t } = useTranslation();

  return (
    <header className="flex items-center justify-between border-b border-neutral-900 bg-[#0b0b0b] px-4 py-3">
      <div className="flex items-center gap-4">
        <h1 className="font-mono text-xs tracking-wide text-gray-300">
          {page === "tool" ? t("tool.intro.title") : t("explorer.header.title")}
        </h1>
      </div>
      <div className="flex items-center gap-3">
        {/* Mode Switch (only for tool page) */}
        {page === "tool" && onModeSwitch && (
          <>
            <div className="flex items-center gap-1 rounded-md border border-neutral-800 bg-neutral-900/40 p-0.5">
              <button
                type="button"
                onClick={onModeSwitch}
                className={`px-3 py-1.5 text-[10px] font-medium tracking-wide rounded transition-all ${!videoMode ? "bg-blue-600/90 text-white" : "text-gray-400 hover:text-gray-200"}`}
                aria-label={t("tool.switchToImages")}
                aria-pressed={!videoMode}
              >
                {t("tool.imageMode")}
              </button>
              <button
                type="button"
                onClick={onModeSwitch}
                className={`px-3 py-1.5 text-[10px] font-medium tracking-wide rounded transition-all ${videoMode ? "bg-blue-600/90 text-white" : "text-gray-400 hover:text-gray-200"}`}
                aria-label={t("tool.switchToVideo")}
                aria-pressed={videoMode}
              >
                {t("tool.videoMode")}
              </button>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-neutral-800"></div>
          </>
        )}

        {/* Navigation */}
        {page === "tool" ? (
          <>
            <Link to="/Algorithms" className="clean-btn px-3 py-1.5 !text-[10px] hover:bg-neutral-800" title={t("tool.algorithmReference")}>
              {t("tool.explore")}
            </Link>
            <Link to="/" className="clean-btn px-3 py-1.5 !text-[10px] hover:bg-neutral-800">
              {t("tool.home")}
            </Link>
          </>
        ) : (
          <>
            <Link to="/Dithering" className="clean-btn px-3 py-1.5 !text-[10px] hover:bg-neutral-800">
              {t("explorer.header.tool")}
            </Link>
            <Link to="/" className="clean-btn px-3 py-1.5 !text-[10px] hover:bg-neutral-800">
              {t("explorer.header.home")}
            </Link>
          </>
        )}

        {/* Divider */}
        <div className="hidden sm:block h-6 w-px bg-neutral-800"></div>

        {/* Language Switcher */}
        <LanguageSwitcher />
      </div>
    </header>
  );
};

export default Header;
