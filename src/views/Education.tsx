"use client";

import { useTranslation } from "react-i18next";
import Header from "../components/ui/Header";
import SiteFooter from "../components/ui/SiteFooter";
import EducationHero from "../components/marketing/EducationHero";
import LearningPathPreview from "../components/marketing/LearningPathPreview";
import SectionDivider from "../components/marketing/SectionDivider";
import LiveDitherExample from "../components/education/LiveDitherExample";

export default function Education() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-50">
      <Header activeNav="education" />
      <main id="main-content" className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-6 py-10 md:px-8 md:py-12">
          <EducationHero />

          <div className="my-10 lg:my-14">
            <SectionDivider />
          </div>

          <LearningPathPreview showHubLink={false} />

          <div className="my-10 lg:my-14">
            <SectionDivider />
          </div>

          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="font-anton text-xl tracking-tight text-gray-100 sm:text-2xl">
                {t("education.visual.title", { defaultValue: "See it, don’t just read it" })}
              </h2>
              <p className="text-[12px] leading-relaxed text-gray-400 sm:text-[13px]">
                {t("education.visual.subtitle", {
                  defaultValue:
                    "Compare before/after on sample media, then contrast ordered vs error-diffusion textures.",
                })}
              </p>
            </div>
            <LiveDitherExample />
          </section>
        </div>
        <div className="mx-auto w-full max-w-4xl px-6 md:px-8">
          <SiteFooter />
        </div>
      </main>
    </div>
  );
}
