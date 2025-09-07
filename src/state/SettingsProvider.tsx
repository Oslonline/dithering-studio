import React, { useState, useMemo, useEffect } from 'react';
import { SettingsContext } from './SettingsContext';
import type { UploadedImage } from '../components/ImagesPanel';
import { loadSettings, persistSettings } from './settingsPersistence';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initial = loadSettings();
  const [images, setImages] = useState<UploadedImage[]>(() => initial.images as UploadedImage[]);
  const [activeImageId, setActiveImageId] = useState<string | null>(() => initial.activeImageId);
  const [pattern, setPattern] = useState<number>(() => initial.pattern);
  const [threshold, setThreshold] = useState<number>(() => initial.threshold);
  const [workingResolution, setWorkingResolution] = useState<number>(() => initial.workingResolution);
  const [workingResInput, setWorkingResInput] = useState<string>(() => String(initial.workingResolution));
  const [webpSupported, setWebpSupported] = useState(true);
  const [paletteId, setPaletteId] = useState<string | null>(() => initial.paletteId);
  const [activePaletteColors, setActivePaletteColors] = useState<[number, number, number][] | null>(() => initial.customPalette);
  const [invert, setInvert] = useState<boolean>(() => initial.invert);
  const [serpentine, setSerpentine] = useState<boolean>(() => initial.serpentine);
  const [asciiRamp, setAsciiRamp] = useState<string>(() => initial.asciiRamp);
  const [showGrid, setShowGrid] = useState<boolean>(() => initial.showGrid);
  const [gridSize, setGridSize] = useState<number>(() => initial.gridSize);
  const [focusMode, setFocusMode] = useState(false);
  const [videoMode, setVideoMode] = useState(false);
  const [videoItem, setVideoItem] = useState<{ url: string; name?: string } | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoFps, setVideoFps] = useState(12);
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    persistSettings({
      version: 1,
      images,
      activeImageId,
      pattern,
      threshold,
      workingResolution,
      paletteId,
      customPalette: paletteId === '__custom' ? activePaletteColors : null,
      invert,
      serpentine,
      asciiRamp,
      showGrid,
      gridSize,
    });
  }, [images, activeImageId, pattern, threshold, workingResolution, paletteId, activePaletteColors, invert, serpentine, asciiRamp, showGrid, gridSize]);

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
