"use client";

import { useTranslation } from "react-i18next";
import FeatureCardArt from "./FeatureCardArt";

type FeatureCell = {
  tag: string;
  title: string;
  desc: string;
  span: string;
};

export default function FeatureGrid() {
  const { t } = useTranslation();

  const features: FeatureCell[] = [
    {
      tag: "algo",
      title: t("features.algorithms"),
      desc: t("features.algorithmsDesc"),
      span: "lg:col-span-7 lg:row-span-2",
    },
    {
      tag: "media",
      title: t("features.imageVideo"),
      desc: t("features.imageVideoDesc"),
      span: "lg:col-span-5",
    },
    {
      tag: "local",
      title: t("features.clientSide"),
      desc: t("features.clientSideDesc"),
      span: "lg:col-span-5",
    },
    {
      tag: "export",
      title: t("features.export"),
      desc: t("features.exportDesc"),
      span: "lg:col-span-4",
    },
    {
      tag: "palette",
      title: t("features.palette"),
      desc: t("features.paletteDesc"),
      span: "lg:col-span-4",
    },
    {
      tag: "free",
      title: t("features.noAccount"),
      desc: t("features.noAccountDesc"),
      span: "lg:col-span-4",
    },
  ];

  return (
    <section className="w-full max-w-6xl" aria-labelledby="features-heading">
      <header className="mb-8 flex flex-col gap-3 border-b border-neutral-800 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <h2 id="features-heading" className="mt-2 font-anton text-xl tracking-tight sm:text-2xl">
          {t("features.title")}
        </h2>
        <p className="max-w-xs text-[11px] leading-relaxed text-gray-500 sm:text-right sm:text-[12px]">
          {t("features.subtitle")}
        </p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12 lg:grid-rows-[auto_auto_auto]">
        {features.map((feature, index) => (
          <div
            key={feature.tag}
            className={`relative overflow-hidden rounded-md border border-neutral-800/90 bg-neutral-900/20 p-5 sm:p-6 ${feature.span} ${index === 0 ? "min-h-[220px] sm:min-h-[260px]" : ""
              }`}
          >
            <FeatureCardArt tag={feature.tag} large={index === 0} />
            <div className="relative z-10 flex h-full flex-col justify-between">
              <span className="font-mono text-[9px] tracking-widest text-gray-600 uppercase">[{feature.tag}]</span>
              <div className={index === 0 ? "mt-auto space-y-3 pt-8" : "mt-4 space-y-2"}>
                <h3
                  className={`font-medium tracking-wide text-gray-100 ${index === 0 ? "text-[15px] sm:text-base" : "text-[12px] sm:text-[13px]"
                    }`}
                >
                  {feature.title}
                </h3>
                <p className="max-w-[85%] text-[11px] leading-relaxed text-gray-500 sm:text-[12px]">{feature.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
