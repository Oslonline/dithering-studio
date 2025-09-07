import React, { useState, useMemo } from 'react';
import { SettingsContext } from './SettingsContext';
import type { UploadedImage } from '../components/ImagesPanel';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Core media & algorithm state (mirrors existing initialization logic; persistence still handled externally)
  const [images, setImages] = useState<UploadedImage[]>(() => {
    try { const raw = localStorage.getItem('ds_images'); if (raw) return JSON.parse(raw); } catch {}; return []; });
  const [activeImageId, setActiveImageId] = useState<string | null>(() => { try { return localStorage.getItem('ds_activeImageId'); } catch { return null; } });
  const [pattern, setPattern] = useState<number>(() => { try { return +(localStorage.getItem('ds_pattern') || 1); } catch { return 1; } });
  const [threshold, setThreshold] = useState<number>(() => { try { return +(localStorage.getItem('ds_threshold') || 128); } catch { return 128; } });
  const [workingResolution, setWorkingResolution] = useState<number>(() => { try { return +(localStorage.getItem('ds_workingResolution') || 512); } catch { return 512; } });
  const [workingResInput, setWorkingResInput] = useState<string>(() => String(workingResolution));
  const [webpSupported, setWebpSupported] = useState(true);
  const [paletteId, setPaletteId] = useState<string | null>(() => { try { return localStorage.getItem('ds_paletteId'); } catch { return null; } });
  const [activePaletteColors, setActivePaletteColors] = useState<[number, number, number][] | null>(() => { try { const raw = localStorage.getItem('ds_customPalette'); if (raw) { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) return parsed; } } catch {}; return null; });
  const [invert, setInvert] = useState<boolean>(() => { try { return localStorage.getItem('ds_invert') === '1'; } catch { return false; } });
  const [serpentine, setSerpentine] = useState<boolean>(() => { try { return localStorage.getItem('ds_serpentine') !== '0'; } catch { return true; } });
  const [asciiRamp, setAsciiRamp] = useState<string>(() => { try { const v = localStorage.getItem('ds_asciiRamp'); return v && v.length >= 2 ? v : '@%#*+=-:. '; } catch { return '@%#*+=-:. '; } });
  const [showGrid, setShowGrid] = useState<boolean>(() => { try { return localStorage.getItem('ds_showGrid') === '1'; } catch { return false; } });
  const [gridSize, setGridSize] = useState<number>(() => { try { const v = +(localStorage.getItem('ds_gridSize') || 8); return [4,6,8,12,16].includes(v) ? v : 8; } catch { return 8; } });
  const [focusMode, setFocusMode] = useState(false);
  const [videoMode, setVideoMode] = useState(false);
  const [videoItem, setVideoItem] = useState<{ url: string; name?: string } | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoFps, setVideoFps] = useState(12);
  const [showDownload, setShowDownload] = useState(false);

  const value = useMemo(() => ({
    images, setImages,
    activeImageId, setActiveImageId,
    pattern, setPattern,
    threshold, setThreshold,
    workingResolution, setWorkingResolution,
    workingResInput, setWorkingResInput,
    webpSupported, setWebpSupported,
    paletteId, setPaletteId,
    activePaletteColors, setActivePaletteColors,
    invert, setInvert,
    serpentine, setSerpentine,
    asciiRamp, setAsciiRamp,
    showGrid, setShowGrid,
    gridSize, setGridSize,
    focusMode, setFocusMode,
    videoMode, setVideoMode,
    videoItem, setVideoItem,
    videoPlaying, setVideoPlaying,
    videoFps, setVideoFps,
    showDownload, setShowDownload,
  }), [images, activeImageId, pattern, threshold, workingResolution, workingResInput, webpSupported, paletteId, activePaletteColors, invert, serpentine, asciiRamp, showGrid, gridSize, focusMode, videoMode, videoItem, videoPlaying, videoFps, showDownload]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export default SettingsProvider;
