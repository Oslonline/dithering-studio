"use client";

import { useTranslation } from "react-i18next";

interface VisualRamblingCardProps {
  part: 1 | 2;
  href: string;
}

export default function VisualRamblingCard({ part, href }: VisualRamblingCardProps) {
  const { t } = useTranslation();
  const prefix = `education.guide.part${part}.visualRambling`;

  return (
    <aside className="rounded-lg border border-neutral-800 bg-[#0d0d0d] p-5 sm:p-6">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gray-500">
        {t(`${prefix}.kicker`, { defaultValue: "Interactive essay" })}
      </p>
      <h3 className="mt-2 text-[13px] font-medium tracking-wide text-gray-100 sm:text-[14px]">
        {t(`${prefix}.title`, {
          defaultValue: part === 1 ? "Dithering — Part 1 on visualrambling.space" : "Dithering — Part 2 on visualrambling.space",
        })}
      </h3>
      <p className="mt-2 text-[11px] leading-relaxed text-gray-500 sm:text-[12px]">
        {t(`${prefix}.body`, {
          defaultValue:
            part === 1
              ? "Damar’s scroll-driven piece covers the same foundations with WebGL visuals. We summarize the ideas below in text; open his article if you want the animated walkthrough!"
              : "The second essay explains threshold maps and Bayer matrices visually. Read it alongside the section below !",
        })}
      </p>
      <p className="mt-3 text-[10px] text-gray-600">
        {t(`${prefix}.credit`, { defaultValue: "By Damar · visualrambling.space" })}
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex text-[11px] text-gray-300 underline decoration-gray-600 underline-offset-4 transition-colors hover:text-white hover:decoration-gray-400"
      >
        {t(`${prefix}.link`, {
          defaultValue: part === 1 ? "Open Part 1 (new tab)" : "Open Part 2 (new tab)",
        })}
        <span aria-hidden className="ml-1">
          ↗
        </span>
      </a>
    </aside>
  );
}
