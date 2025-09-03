export interface DitherParams {
  pattern: number;
  threshold: number;
  invert: boolean;
  serpentine: boolean;
  isErrorDiffusion: boolean;
  palette?: [number, number, number][];
}

export interface DitherPreset extends DitherParams {
  id: string; name: string; workingResolution: number;
  paletteId?: string | null; activePaletteColors?: [number, number, number][] | null;
  createdAt: number; updatedAt?: number; version: 1;
}

const LS_KEY = 'ds_presets_v1';

export function loadPresets(): DitherPreset[] {
  try {
    const raw = localStorage.getItem(LS_KEY); if (!raw) return [];
    const parsed = JSON.parse(raw) as any[]; if (!Array.isArray(parsed)) return [];
    return parsed.map(p => {
      const id = (p && typeof p.id === 'string') ? p.id : `${p.createdAt || Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      return { ...p, id } as DitherPreset;
    });
  } catch { return []; }
}

export function savePresets(list: DitherPreset[]) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list.slice(0, 100))); } catch {}
}

export function createPreset(name: string, params: Omit<DitherPreset, 'id' | 'name' | 'createdAt' | 'updatedAt' | 'version'>): DitherPreset {
  const createdAt = Date.now();
  return { id: `${createdAt}-${Math.random().toString(36).slice(2,10)}`, name, createdAt, updatedAt: createdAt, version: 1, ...params };
}

export function serializePreset(p: DitherPreset): string {
  return btoa(unescape(encodeURIComponent(JSON.stringify(p))));
}
export function deserializePreset(s: string): DitherPreset | null {
  try { return JSON.parse(decodeURIComponent(escape(atob(s)))); } catch { return null; }
}
