"use client";

import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getAlgorithmsByCategory } from "../../utils/algorithms";
import {
  orderRampDarkToLight,
  DEFAULT_ASCII_RAMP,
} from "../../utils/algorithms/asciiMosaic";
import { ASCII_RAMP_PRESETS } from "../../utils/algorithms/asciiPresets";
import CollapsiblePanel from "../ui/CollapsiblePanel";

interface AsciiPanelProps {
  pattern: number;
  setPattern: (id: number) => void;
  threshold: number;
  setThreshold: (t: number) => void;
  invert: boolean;
  setInvert: React.Dispatch<React.SetStateAction<boolean>>;
  asciiRamp: string;
  setAsciiRamp: (v: string) => void;
  asciiCellSize: number;
  setAsciiCellSize: (n: number) => void;
}

function normalizeRamp(raw: string): string {
  return Array.from(new Set(raw.split("").filter((ch) => ch !== "\n" && ch !== "\r")))
    .join("")
    .slice(0, 128);
}

const AsciiPanel: React.FC<AsciiPanelProps> = ({
  pattern,
  setPattern,
  threshold,
  setThreshold,
  invert,
  setInvert,
  asciiRamp,
  setAsciiRamp,
  asciiCellSize,
  setAsciiCellSize,
}) => {
  const { t } = useTranslation();
  const normalizedRamp = useMemo(
    () => normalizeRamp(asciiRamp || DEFAULT_ASCII_RAMP),
    [asciiRamp]
  );

  return (
    <div className="space-y-4" data-panel="ascii-tool">
      <CollapsiblePanel
        title={t("tool.asciiPanel.title")}
        subtitle={t("tool.asciiPanel.subtitle")}
        defaultOpen
      >
        <div className="space-y-3">
          <div>
            <label htmlFor="ascii-algo-select" className="sr-only">
              {t("tool.algorithmPanel.title")}
            </label>
            <select
              id="ascii-algo-select"
              className="clean-input"
              value={pattern}
              onChange={(e) => setPattern(Number(e.target.value))}
            >
              {(() => {
                const groups = getAlgorithmsByCategory();
                const order: ("Error Diffusion" | "Ordered" | "Other")[] = [
                  "Error Diffusion",
                  "Ordered",
                  "Other",
                ];
                return order.map((cat) => {
                  const list = groups[cat];
                  if (!list) return null;
                  const labelKey =
                    cat === "Error Diffusion"
                      ? "tool.algorithmPanel.errorDiffusion"
                      : cat === "Ordered"
                        ? "tool.algorithmPanel.ordered"
                        : "tool.algorithmPanel.other";
                  return (
                    <optgroup key={cat} label={t(labelKey)}>
                      {list.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name}
                        </option>
                      ))}
                    </optgroup>
                  );
                });
              })()}
            </select>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-wide text-gray-400">
                {t("tool.algorithmPanel.luminanceThreshold")}
              </span>
              <span className="text-[10px] text-gray-500">{threshold}</span>
            </div>
            <input
              type="range"
              min={0}
              max={255}
              value={threshold}
              className="clean-range"
              onChange={(e) => setThreshold(Number(e.target.value))}
              aria-label={t("tool.algorithmPanel.luminanceThreshold")}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-wide text-gray-400">
                {t("tool.asciiPanel.cellSize")}
              </span>
              <span className="text-[10px] text-gray-500">
                {asciiCellSize}px
              </span>
            </div>
            <input
              type="range"
              min={4}
              max={24}
              step={1}
              value={asciiCellSize}
              className="clean-range"
              onChange={(e) => setAsciiCellSize(Number(e.target.value))}
              aria-label={t("tool.asciiPanel.cellSize")}
            />
            <p className="text-[9px] leading-snug text-gray-500">
              {t("tool.asciiPanel.cellSizeHint")}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setInvert((v) => !v)}
            className={`clean-btn w-full justify-center text-[10px] ${invert ? "border-blue-600 text-blue-400" : ""}`}
          >
            {t("tool.algorithmPanel.invert")}
          </button>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel
        title={t("tool.asciiPanel.rampTitle")}
        subtitle={`${normalizedRamp.length} ${t("tool.algorithmPanel.chars")}`}
        defaultOpen
      >
        <div className="space-y-3">
          <div className="space-y-2">
            <span className="font-mono text-[10px] tracking-wide text-gray-400">
              {t("tool.asciiPanel.presets")}
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {ASCII_RAMP_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`clean-btn justify-start px-2 py-1.5 !text-[10px] ${
                    normalizedRamp === normalizeRamp(preset.ramp)
                      ? "border-blue-600 text-blue-300"
                      : ""
                  }`}
                  onClick={() => setAsciiRamp(normalizeRamp(preset.ramp))}
                  title={preset.ramp}
                >
                  <span className="truncate font-mono">
                    {t(`tool.asciiPanel.preset.${preset.id}`, {
                      defaultValue: preset.id,
                    })}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] tracking-wide text-gray-400">
                {t("tool.algorithmPanel.asciiRamp")}
              </span>
              <span className="text-[9px] text-gray-500">
                {normalizedRamp.length} {t("tool.algorithmPanel.chars")}
              </span>
            </div>
            <textarea
              value={asciiRamp || DEFAULT_ASCII_RAMP}
              onChange={(e) => {
                const raw = e.target.value.replace(/\s+/g, " ");
                setAsciiRamp(normalizeRamp(raw));
              }}
              rows={2}
              className="clean-input !px-2 !py-1 resize-none font-mono text-[11px]"
              aria-label={t("tool.algorithmPanel.asciiRamp")}
            />
            <div className="flex flex-wrap gap-2 font-mono text-[9px]">
              <button
                type="button"
                className="clean-btn !text-[10px] px-2 py-1"
                onClick={() => setAsciiRamp(orderRampDarkToLight(normalizedRamp))}
              >
                {t("tool.algorithmPanel.autoOrder")}
              </button>
              <button
                type="button"
                className="clean-btn !text-[10px] px-2 py-1"
                onClick={() => setAsciiRamp(DEFAULT_ASCII_RAMP)}
              >
                {t("tool.algorithmPanel.reset")}
              </button>
              <button
                type="button"
                className="clean-btn !text-[10px] px-2 py-1"
                onClick={() =>
                  setAsciiRamp(normalizedRamp.split("").reverse().join(""))
                }
              >
                {t("tool.algorithmPanel.reverse")}
              </button>
              <button
                type="button"
                className="clean-btn !text-[10px] px-2 py-1"
                onClick={() =>
                  setAsciiRamp(
                    normalizedRamp.trimEnd() +
                      (normalizedRamp.endsWith(" ") ? "" : " ")
                  )
                }
              >
                {t("tool.algorithmPanel.ensureSpace")}
              </button>
              <button
                type="button"
                className="clean-btn !text-[10px] px-2 py-1"
                onClick={() => {
                  const arr = normalizedRamp.split("");
                  for (let i = arr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [arr[i], arr[j]] = [arr[j], arr[i]];
                  }
                  setAsciiRamp(arr.join(""));
                }}
              >
                {t("tool.algorithmPanel.randomize")}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap gap-1">
              {normalizedRamp.split("").map((ch, i) => (
                <span
                  key={`${ch}-${i}`}
                  className="inline-flex h-5 w-5 items-center justify-center rounded border border-neutral-700 bg-neutral-900 text-[11px]"
                >
                  {ch === " " ? "·" : ch}
                </span>
              ))}
            </div>
            <p className="text-[9px] leading-snug text-gray-500">
              {t("tool.algorithmPanel.asciiNote")}
            </p>
          </div>
        </div>
      </CollapsiblePanel>
    </div>
  );
};

export default AsciiPanel;
