export const SETTINGS_STORAGE_KEY = 'ds_settings';
export const SETTINGS_VERSION = 1 as const;

export interface PersistedSettingsV1 {
  version: typeof SETTINGS_VERSION;
  images: any[];
  activeImageId: string | null;
  pattern: number;
  threshold: number;
  workingResolution: number;
  paletteId: string | null;
  customPalette: [number, number, number][] | null;
  invert: boolean;
  serpentine: boolean;
  asciiRamp: string;
  showGrid: boolean;
  gridSize: number;
}

export type PersistedSettings = PersistedSettingsV1;

export const defaultSettings: PersistedSettingsV1 = {
  version: SETTINGS_VERSION,
  images: [],
  activeImageId: null,
  pattern: 1,
  threshold: 128,
  workingResolution: 512,
  paletteId: null,
  customPalette: null,
  invert: false,
  serpentine: true,
  asciiRamp: '@%#*+=-:. ',
  showGrid: false,
  gridSize: 8,
};

function coerceNumber(n: any, fallback: number) { return typeof n === 'number' && !isNaN(n) ? n : fallback; }
function coerceBool(b: any, fallback: boolean) { return typeof b === 'boolean' ? b : fallback; }
function coerceArray(a: any) { return Array.isArray(a) ? a : []; }
function coercePalette(p: any) { return Array.isArray(p) ? p.filter((c: any) => Array.isArray(c) && c.length === 3) : null; }

// Attempt migration from legacy scattered keys if unified key missing.
function readLegacy(): PersistedSettingsV1 | null {
  try {
    const legacyPattern = localStorage.getItem('ds_pattern');
  if (legacyPattern == null) return null;
    const imagesRaw = localStorage.getItem('ds_images');
    const customPaletteRaw = localStorage.getItem('ds_customPalette');
    return {
      version: SETTINGS_VERSION,
      images: imagesRaw ? JSON.parse(imagesRaw) : [],
      activeImageId: localStorage.getItem('ds_activeImageId') || null,
      pattern: +(legacyPattern || 1),
      threshold: +(localStorage.getItem('ds_threshold') || 128),
      workingResolution: +(localStorage.getItem('ds_workingResolution') || 512),
      paletteId: localStorage.getItem('ds_paletteId'),
      customPalette: customPaletteRaw ? JSON.parse(customPaletteRaw) : null,
      invert: localStorage.getItem('ds_invert') === '1',
      serpentine: localStorage.getItem('ds_serpentine') !== '0',
      asciiRamp: (() => { const v = localStorage.getItem('ds_asciiRamp'); return v && v.length >= 2 ? v : '@%#*+=-:. '; })(),
      showGrid: localStorage.getItem('ds_showGrid') === '1',
      gridSize: (() => { const v = +(localStorage.getItem('ds_gridSize') || 8); return [4,6,8,12,16].includes(v) ? v : 8; })(),
    };
  } catch {
    return null;
  }
}

export function loadSettings(): PersistedSettingsV1 {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const parsed: any = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
  const v = parsed.version === SETTINGS_VERSION ? SETTINGS_VERSION : SETTINGS_VERSION;
        return {
          version: v,
            images: coerceArray(parsed.images),
            activeImageId: typeof parsed.activeImageId === 'string' && parsed.activeImageId ? parsed.activeImageId : null,
            pattern: coerceNumber(parsed.pattern, 1),
            threshold: coerceNumber(parsed.threshold, 128),
            workingResolution: coerceNumber(parsed.workingResolution, 512),
            paletteId: typeof parsed.paletteId === 'string' ? parsed.paletteId : null,
            customPalette: coercePalette(parsed.customPalette),
            invert: coerceBool(parsed.invert, false),
            serpentine: coerceBool(parsed.serpentine, true),
            asciiRamp: typeof parsed.asciiRamp === 'string' && parsed.asciiRamp.length >= 2 ? parsed.asciiRamp : '@%#*+=-:. ',
            showGrid: coerceBool(parsed.showGrid, false),
            gridSize: (() => { const v = coerceNumber(parsed.gridSize, 8); return [4,6,8,12,16].includes(v) ? v : 8; })(),
        };
      }
    }
    
    const legacy = readLegacy();
    if (legacy) {
      
      persistSettings(legacy);
      
      return legacy;
    }
  } catch {}
  return { ...defaultSettings };
}

let writeTimer: any = null;
export function persistSettings(settings: PersistedSettingsV1, debounceMs = 250) {
  try {
    if (writeTimer) clearTimeout(writeTimer);
    writeTimer = setTimeout(() => {
      try {
        const toStore: PersistedSettingsV1 = { ...settings, version: SETTINGS_VERSION };
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(toStore));
      } catch {}
    }, debounceMs);
  } catch {}
}

// Optional utility to clear legacy keys after successful consolidation
export function clearLegacyKeys() {
  const legacy = ['ds_pattern','ds_threshold','ds_workingResolution','ds_paletteId','ds_customPalette','ds_invert','ds_serpentine','ds_asciiRamp','ds_showGrid','ds_gridSize','ds_activeImageId','ds_images'];
  try { legacy.forEach(k => localStorage.removeItem(k)); } catch {}
}
