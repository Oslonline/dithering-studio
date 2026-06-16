import { coercePresetSettings } from "../lib/presets/settings";
import { PRESET_SETTINGS_VERSION, type LocalPresetV2, type PresetSettingsV2 } from "../lib/presets/types";

export type { LocalPresetV2, PresetSettingsV2 };

const LS_KEY_V2 = "ds_presets_v2";
const LS_KEY_V1 = "ds_presets_v1";
const LOCAL_PRESET_LIMIT = 100;

/** @deprecated Use LocalPresetV2 + PresetSettingsV2 */
export interface DitherParams {
  pattern: number;
  threshold: number;
  invert: boolean;
  serpentine: boolean;
  isErrorDiffusion: boolean;
  palette?: [number, number, number][];
}

/** @deprecated Use LocalPresetV2 */
export interface DitherPreset extends DitherParams {
  id: string;
  name: string;
  workingResolution: number;
  paletteId?: string | null;
  activePaletteColors?: [number, number, number][] | null;
  createdAt: number;
  updatedAt?: number;
  version: 1;
}

function migrateV1ToV2(legacy: DitherPreset): LocalPresetV2 {
  const settings: PresetSettingsV2 = {
    version: PRESET_SETTINGS_VERSION,
    pattern: legacy.pattern,
    threshold: legacy.threshold,
    workingResolution: legacy.workingResolution,
    contrast: 0,
    midtones: 1,
    highlights: 0,
    blurRadius: 0,
    paletteId: legacy.paletteId ?? null,
    customPalette: legacy.activePaletteColors ?? legacy.palette ?? null,
    invert: legacy.invert,
    serpentine: legacy.serpentine,
    serpentinePattern: "standard",
    errorDiffusionStrength: 1,
    asciiRamp: "",
    asciiCellSize: 10,
    showGrid: false,
    gridSize: 8,
    mode: "image",
  };
  return {
    id: legacy.id,
    name: legacy.name,
    settings,
    createdAt: legacy.createdAt,
    updatedAt: legacy.updatedAt ?? legacy.createdAt,
  };
}

export function loadLocalPresets(): LocalPresetV2[] {
  try {
    const rawV2 = localStorage.getItem(LS_KEY_V2);
    if (rawV2) {
      const parsed = JSON.parse(rawV2) as unknown[];
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((p) => {
          if (!p || typeof p !== "object") return null;
          const row = p as LocalPresetV2;
          const settings = coercePresetSettings(row.settings);
          if (!settings || typeof row.name !== "string") return null;
          return {
            id: typeof row.id === "string" ? row.id : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: row.name,
            settings,
            createdAt: typeof row.createdAt === "number" ? row.createdAt : Date.now(),
            updatedAt: typeof row.updatedAt === "number" ? row.updatedAt : Date.now(),
          } satisfies LocalPresetV2;
        })
        .filter((p): p is LocalPresetV2 => !!p);
    }

    const rawV1 = localStorage.getItem(LS_KEY_V1);
    if (!rawV1) return [];
    const parsedV1 = JSON.parse(rawV1) as DitherPreset[];
    if (!Array.isArray(parsedV1)) return [];
    const migrated = parsedV1.map(migrateV1ToV2);
    saveLocalPresets(migrated);
    return migrated;
  } catch {
    return [];
  }
}

export function saveLocalPresets(list: LocalPresetV2[]): void {
  try {
    localStorage.setItem(LS_KEY_V2, JSON.stringify(list.slice(0, LOCAL_PRESET_LIMIT)));
  } catch {
    /* ignore quota */
  }
}

export function createLocalPreset(name: string, settings: PresetSettingsV2): LocalPresetV2 {
  const now = Date.now();
  return {
    id: `${now}-${Math.random().toString(36).slice(2, 10)}`,
    name,
    settings,
    createdAt: now,
    updatedAt: now,
  };
}

export function serializeLocalPreset(p: LocalPresetV2): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(p))));
}

export function deserializeLocalPreset(token: string): LocalPresetV2 | null {
  try {
    const parsed = JSON.parse(decodeURIComponent(escape(atob(token.trim()))));
    if (!parsed || typeof parsed !== "object") return null;
    const settings = coercePresetSettings(parsed.settings ?? parsed);
    if (!settings) return null;
    const name = typeof parsed.name === "string" ? parsed.name : "Imported preset";
    const now = Date.now();
    return {
      id: typeof parsed.id === "string" ? `${parsed.id}-im` : `${now}-im`,
      name,
      settings,
      createdAt: now,
      updatedAt: now,
    };
  } catch {
    return null;
  }
}

// Backward-compatible aliases used elsewhere
export const loadPresets = loadLocalPresets;
export const savePresets = saveLocalPresets;
export const serializePreset = serializeLocalPreset;
export const deserializePreset = deserializeLocalPreset;

export function createPreset(
  name: string,
  legacy: Omit<DitherPreset, "id" | "name" | "createdAt" | "updatedAt" | "version">,
): LocalPresetV2 {
  return createLocalPreset(
    name,
    migrateV1ToV2({
      id: "",
      name,
      createdAt: Date.now(),
      version: 1,
      ...legacy,
    }).settings,
  );
}
