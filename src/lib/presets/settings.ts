import { isAsciiAlgorithm } from "../../utils/algorithms";
import type { SerpentinePattern } from "../../types/serpentinePatterns";
import { PRESET_SETTINGS_VERSION, type PresetSettingsV2 } from "./types";

export interface ToolPresetSnapshot {
  pattern: number;
  threshold: number;
  workingResolution: number;
  contrast: number;
  midtones: number;
  highlights: number;
  blurRadius: number;
  paletteId: string | null;
  activePaletteColors: [number, number, number][] | null;
  invert: boolean;
  serpentine: boolean;
  serpentinePattern: SerpentinePattern;
  errorDiffusionStrength: number;
  asciiRamp: string;
  asciiCellSize: number;
  showGrid: boolean;
  gridSize: number;
  videoMode: boolean;
}

export interface ToolPresetApplyHandlers {
  setPattern: (n: number) => void;
  setThreshold: (n: number) => void;
  setWorkingResolution: (n: number) => void;
  setContrast: (n: number) => void;
  setMidtones: (n: number) => void;
  setHighlights: (n: number) => void;
  setBlurRadius: (n: number) => void;
  setPaletteId: (id: string | null) => void;
  setActivePaletteColors: (colors: [number, number, number][] | null) => void;
  setInvert: (v: boolean) => void;
  setSerpentine: (v: boolean) => void;
  setSerpentinePattern: (p: SerpentinePattern) => void;
  setErrorDiffusionStrength: (n: number) => void;
  setAsciiRamp: (r: string) => void;
  setAsciiCellSize: (n: number) => void;
  setShowGrid: (v: boolean) => void;
  setGridSize: (n: number) => void;
}

export function snapshotFromTool(snapshot: ToolPresetSnapshot): PresetSettingsV2 {
  const customPalette =
    snapshot.paletteId === "__custom" && snapshot.activePaletteColors?.length
      ? snapshot.activePaletteColors
      : snapshot.activePaletteColors?.length
        ? snapshot.activePaletteColors
        : null;

  return {
    version: PRESET_SETTINGS_VERSION,
    pattern: snapshot.pattern,
    threshold: snapshot.threshold,
    workingResolution: snapshot.workingResolution,
    contrast: snapshot.contrast,
    midtones: snapshot.midtones,
    highlights: snapshot.highlights,
    blurRadius: snapshot.blurRadius,
    paletteId: snapshot.paletteId,
    customPalette,
    invert: snapshot.invert,
    serpentine: snapshot.serpentine,
    serpentinePattern: snapshot.serpentinePattern,
    errorDiffusionStrength: snapshot.errorDiffusionStrength,
    asciiRamp: isAsciiAlgorithm(snapshot.pattern) ? snapshot.asciiRamp : "",
    asciiCellSize: snapshot.asciiCellSize,
    showGrid: snapshot.showGrid,
    gridSize: snapshot.gridSize,
    mode: snapshot.videoMode ? "video" : "image",
  };
}

export function applyPresetSettings(settings: PresetSettingsV2, handlers: ToolPresetApplyHandlers): void {
  handlers.setPattern(settings.pattern);
  handlers.setThreshold(settings.threshold);
  handlers.setWorkingResolution(settings.workingResolution);
  handlers.setContrast(settings.contrast);
  handlers.setMidtones(settings.midtones);
  handlers.setHighlights(settings.highlights);
  handlers.setBlurRadius(settings.blurRadius);
  handlers.setInvert(settings.invert);
  handlers.setSerpentine(settings.serpentine);
  handlers.setSerpentinePattern(settings.serpentinePattern);
  handlers.setErrorDiffusionStrength(settings.errorDiffusionStrength);
  handlers.setShowGrid(settings.showGrid);
  handlers.setGridSize(settings.gridSize);

  if (settings.paletteId) {
    handlers.setPaletteId(settings.paletteId);
    if (settings.paletteId === "__custom" && settings.customPalette?.length) {
      handlers.setActivePaletteColors(settings.customPalette);
    } else if (settings.customPalette?.length) {
      handlers.setActivePaletteColors(settings.customPalette);
    }
  } else {
    handlers.setPaletteId(null);
    handlers.setActivePaletteColors(null);
  }

  if (isAsciiAlgorithm(settings.pattern) && settings.asciiRamp.trim().length >= 2) {
    handlers.setAsciiRamp(settings.asciiRamp);
  }
  handlers.setAsciiCellSize(settings.asciiCellSize);
}

export function coercePresetSettings(raw: unknown): PresetSettingsV2 | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.pattern !== "number" || typeof o.threshold !== "number") return null;

  return {
    version: PRESET_SETTINGS_VERSION,
    pattern: o.pattern,
    threshold: o.threshold,
    workingResolution: typeof o.workingResolution === "number" ? o.workingResolution : 512,
    contrast: typeof o.contrast === "number" ? o.contrast : 0,
    midtones: typeof o.midtones === "number" ? o.midtones : 1,
    highlights: typeof o.highlights === "number" ? o.highlights : 0,
    blurRadius: typeof o.blurRadius === "number" ? o.blurRadius : 0,
    paletteId: typeof o.paletteId === "string" ? o.paletteId : null,
    customPalette: Array.isArray(o.customPalette) ? (o.customPalette as [number, number, number][]) : null,
    invert: !!o.invert,
    serpentine: o.serpentine !== false,
    serpentinePattern: (o.serpentinePattern as SerpentinePattern) || "standard",
    errorDiffusionStrength: typeof o.errorDiffusionStrength === "number" ? o.errorDiffusionStrength : 1,
    asciiRamp: typeof o.asciiRamp === "string" ? o.asciiRamp : "",
    asciiCellSize: typeof o.asciiCellSize === "number" ? o.asciiCellSize : 10,
    showGrid: !!o.showGrid,
    gridSize: typeof o.gridSize === "number" ? o.gridSize : 8,
    mode: o.mode === "video" ? "video" : "image",
  };
}
