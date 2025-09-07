import { useEffect } from 'react';

interface Params {
  pattern: number;
  threshold: number;
  workingResolution: number;
  paletteId: string | null;
  invert: boolean;
  serpentine: boolean;
  showGrid: boolean;
  gridSize: number;
  activeImageId: string | null;
  images: any[];
  activePaletteColors: [number, number, number][] | null;
  asciiRamp: string;
}

export function usePersistSettings(p: Params) {
  const { pattern, threshold, workingResolution, paletteId, invert, serpentine, showGrid, gridSize, activeImageId, images, activePaletteColors, asciiRamp } = p;
  useEffect(() => { try { localStorage.setItem('ds_pattern', String(pattern)); } catch {} }, [pattern]);
  useEffect(() => { try { localStorage.setItem('ds_threshold', String(threshold)); } catch {} }, [threshold]);
  useEffect(() => { try { localStorage.setItem('ds_workingResolution', String(workingResolution)); } catch {} }, [workingResolution]);
  useEffect(() => { try { paletteId ? localStorage.setItem('ds_paletteId', paletteId) : localStorage.removeItem('ds_paletteId'); } catch {} }, [paletteId]);
  useEffect(() => { try { localStorage.setItem('ds_invert', invert ? '1':'0'); } catch {} }, [invert]);
  useEffect(() => { try { localStorage.setItem('ds_serpentine', serpentine ? '1':'0'); } catch {} }, [serpentine]);
  useEffect(() => { try { localStorage.setItem('ds_showGrid', showGrid ? '1':'0'); } catch {} }, [showGrid]);
  useEffect(() => { try { localStorage.setItem('ds_gridSize', String(gridSize)); } catch {} }, [gridSize]);
  useEffect(() => { try { localStorage.setItem('ds_activeImageId', activeImageId || ''); } catch {} }, [activeImageId]);
  useEffect(() => { try { localStorage.setItem('ds_images', JSON.stringify(images)); } catch {} }, [images]);
  useEffect(() => { try { localStorage.setItem('ds_asciiRamp', asciiRamp); } catch {} }, [asciiRamp]);
  useEffect(() => { try { if (paletteId === '__custom' && activePaletteColors && activePaletteColors.length >= 2) { localStorage.setItem('ds_customPalette', JSON.stringify(activePaletteColors)); } } catch {} }, [activePaletteColors, paletteId]);
}

export default usePersistSettings;
