"use client";

import { useTranslation } from "react-i18next";

interface ProofStatsProps {
  algorithmCount: number;
}

export default function ProofStats({ algorithmCount }: ProofStatsProps) {
  const { t } = useTranslation();

  const stats = [
    { value: String(algorithmCount), label: t("home.proof.algorithms") },
    { value: t("home.proof.formatsValue"), label: t("home.proof.formats") },
    { value: t("home.proof.localValue"), label: t("home.proof.local") },
    { value: t("home.proof.opensourceValue"), label: t("home.proof.opensource") },
  ];

  return (
    <section className="w-full max-w-5xl" aria-label={t("home.proof.aria")}>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-neutral-800 bg-neutral-900/50 px-4 py-5 text-center"
          >
            <p className="font-anton text-2xl tracking-tight text-gray-100 sm:text-3xl">{stat.value}</p>
            <p className="mt-1 text-[10px] uppercase tracking-wide text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
