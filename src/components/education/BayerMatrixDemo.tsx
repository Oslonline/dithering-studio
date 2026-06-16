"use client";

import { useTranslation } from "react-i18next";

const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

export default function BayerMatrixDemo() {
  const { t } = useTranslation();

  return (
    <figure className="rounded-lg border border-neutral-800 bg-[#0a0a0a] p-4 sm:p-5">
      <figcaption className="mb-3 text-[10px] uppercase tracking-wide text-gray-500">
        {t("education.guide.part2.bayerDemo.caption", {
          defaultValue: "4×4 Bayer threshold map (values 0–15)",
        })}
      </figcaption>
      <div className="mx-auto grid w-full max-w-[200px] grid-cols-4 gap-1">
        {BAYER_4X4.flat().map((value, index) => {
          const shade = 0.12 + (value / 15) * 0.78;
          return (
            <div
              key={index}
              className="flex aspect-square items-center justify-center rounded-sm border border-neutral-800 font-mono text-[9px] text-gray-400"
              style={{ backgroundColor: `rgba(230, 230, 230, ${shade})` }}
            >
              {value}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-center text-[10px] leading-relaxed text-gray-600">
        {t("education.guide.part2.bayerDemo.hint", {
          defaultValue: "Each cell is a threshold. Brighter input pixels turn white when they exceed their cell’s value.",
        })}
      </p>
    </figure>
  );
}
