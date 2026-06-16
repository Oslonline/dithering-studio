import type { SerpentinePattern } from "../../types/serpentinePatterns";

export const PRESET_SETTINGS_VERSION = 2 as const;

export interface PresetSettingsV2 {
  version: typeof PRESET_SETTINGS_VERSION;
  pattern: number;
  threshold: number;
  workingResolution: number;
  contrast: number;
  midtones: number;
  highlights: number;
  blurRadius: number;
  paletteId: string | null;
  customPalette: [number, number, number][] | null;
  invert: boolean;
  serpentine: boolean;
  serpentinePattern: SerpentinePattern;
  errorDiffusionStrength: number;
  asciiRamp: string;
  asciiCellSize: number;
  showGrid: boolean;
  gridSize: number;
  mode: "image" | "video";
}

export interface PresetFolderRow {
  id: string;
  user_id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface UserPresetRow {
  id: string;
  user_id: string;
  folder_id: string | null;
  name: string;
  settings: PresetSettingsV2;
  settings_version: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface LocalPresetV2 {
  id: string;
  name: string;
  settings: PresetSettingsV2;
  createdAt: number;
  updatedAt: number;
}
