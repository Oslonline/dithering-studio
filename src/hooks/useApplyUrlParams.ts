import { useEffect } from 'react';
import { algorithms } from '../utils/algorithms';

interface Params {
  setPattern: (n: number) => void;
  setThreshold: (n: number) => void;
  setWorkingResolution: (n: number) => void;
  setWorkingResInput?: (s: string) => void;
  setInvert: (b: boolean) => void;
  setSerpentine: (b: boolean) => void;
  setAsciiRamp: (s: string) => void;
  setPaletteId: (s: string | null) => void;
  paletteFromURL: React.MutableRefObject<[number, number, number][] | null>;
  setContrast?: (n: number) => void;
  setMidtones?: (n: number) => void;
  setHighlights?: (n: number) => void;
  setBlurRadius?: (n: number) => void;
}

export function useApplyUrlParams(p: Params) {
  const { setPattern, setThreshold, setWorkingResolution, setWorkingResInput, setInvert, setSerpentine, setAsciiRamp, setPaletteId, paletteFromURL, setContrast, setMidtones, setHighlights, setBlurRadius } = p;
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.size === 0) return;
    const num = (key: string, min: number, max: number) => {
      const v = parseInt(params.get(key) || '', 10);
      if (isNaN(v)) return undefined;
      return Math.min(max, Math.max(min, v));
    };
    const pid = num('p', 1, 999);
    if (typeof pid === 'number' && algorithms.some(a => a.id === pid)) setPattern(pid);
    const t = num('t', 0, 255);
    if (typeof t === 'number') setThreshold(t);
    const r = num('r', 16, 4096);
  if (typeof r === 'number') { setWorkingResolution(r); if (setWorkingResInput) setWorkingResInput(String(r)); }
  const c = num('c', -100, 100); if (typeof c === 'number' && setContrast) setContrast(c);
  const g = (()=>{ const v = parseFloat(params.get('g') || ''); return isNaN(v) ? undefined : Math.min(2, Math.max(0.5, v)); })();
  if (typeof g === 'number' && setMidtones) setMidtones(g);
  const h = num('h', 0, 100); if (typeof h === 'number' && setHighlights) setHighlights(h);
  const b = (()=>{ const v = parseFloat(params.get('b') || ''); return isNaN(v) ? undefined : Math.min(10, Math.max(0, v)); })();
  if (typeof b === 'number' && setBlurRadius) setBlurRadius(b);
  const inv = params.get('inv');
  if (inv === '1') setInvert(true); else if (inv === '0') setInvert(false);
  const ser = params.get('ser');
  if (ser === '1') setSerpentine(true); else if (ser === '0') setSerpentine(false);
    const ramp = params.get('ramp');
    if (ramp) {
      const decoded = decodeURIComponent(ramp).replace(/\s/g, ' ').slice(0, 64);
      if (decoded.length >= 2) setAsciiRamp(decoded);
    }
    const pal = params.get('pal');
    if (pal) {
      const cols = params.get('cols');
      if (cols) {
        const parsed: [number, number, number][] = [];
        cols.split('-').forEach(part => {
          const seg = part.split('.');
            if (seg.length === 3) {
              const r = +seg[0], g = +seg[1], b = +seg[2];
              if ([r,g,b].every(n => n >= 0 && n <= 255)) parsed.push([r,g,b]);
            }
        });
        if (parsed.length >= 2) paletteFromURL.current = parsed;
      }
      setPaletteId(pal);
    }
  try {
      const clean = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', clean || '/');
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export default useApplyUrlParams;
