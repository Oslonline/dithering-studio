import React, { useState, useMemo, useEffect } from 'react';
import { SettingsContext } from './SettingsContext';
import type { UploadedImage } from '../components/panels/ImagesPanel';
import type { UploadedVideo } from '../components/panels/VideosPanel';
import type { SerpentinePattern } from '../types/serpentinePatterns';
import { defaultSettings, loadSettings, persistSettings } from './settingsPersistence';

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [storageReady, setStorageReady] = useState(false);
  const [images, setImages] = useState<UploadedImage[]>(() => defaultSettings.images as UploadedImage[]);
  const [activeImageId, setActiveImageId] = useState<string | null>(() => defaultSettings.activeImageId);
  const [videos, setVideos] = useState<UploadedVideo[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [pattern, setPattern] = useState<number>(() => defaultSettings.pattern);
  const [threshold, setThreshold] = useState<number>(() => defaultSettings.threshold);
  const [workingResolution, setWorkingResolution] = useState<number>(() => defaultSettings.workingResolution);
  const [workingResInput, setWorkingResInput] = useState<string>(() => String(defaultSettings.workingResolution));
  const [contrast, setContrast] = useState<number>(() => defaultSettings.contrast);
  const [midtones, setMidtones] = useState<number>(() => defaultSettings.midtones);
  const [highlights, setHighlights] = useState<number>(() => defaultSettings.highlights);
  const [blurRadius, setBlurRadius] = useState<number>(() => defaultSettings.blurRadius);
  const [webpSupported, setWebpSupported] = useState(true);
  const [paletteId, setPaletteId] = useState<string | null>(() => defaultSettings.paletteId);
  const [activePaletteColors, setActivePaletteColors] = useState<[number, number, number][] | null>(() => defaultSettings.customPalette);
  const [invert, setInvert] = useState<boolean>(() => defaultSettings.invert);
  const [serpentine, setSerpentine] = useState<boolean>(() => defaultSettings.serpentine);
  const [serpentinePattern, setSerpentinePattern] = useState<SerpentinePattern>('standard');
  const [errorDiffusionStrength, setErrorDiffusionStrength] = useState<number>(100);
  const [asciiRamp, setAsciiRamp] = useState<string>(() => defaultSettings.asciiRamp);
  const [asciiCellSize, setAsciiCellSize] = useState<number>(() => defaultSettings.asciiCellSize);
  const [showGrid, setShowGrid] = useState<boolean>(() => defaultSettings.showGrid);
  const [gridSize, setGridSize] = useState<number>(() => defaultSettings.gridSize);
  const [focusMode, setFocusMode] = useState(false);
  const [customKernel, setCustomKernel] = useState<number[][] | null>(null);
  const [customKernelDivisor, setCustomKernelDivisor] = useState<number>(16);
  const [videoMode, setVideoMode] = useState(false);
  const [videoItem, setVideoItem] = useState<{ url: string; name?: string } | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoFps, setVideoFps] = useState(12);
  const [showDownload, setShowDownload] = useState(false);

  useEffect(() => {
    const initial = loadSettings();
    setImages(initial.images as UploadedImage[]);
    setActiveImageId(initial.activeImageId);
    setPattern(initial.pattern);
    setThreshold(initial.threshold);
    setWorkingResolution(initial.workingResolution);
    setWorkingResInput(String(initial.workingResolution));
    setContrast(initial.contrast);
    setMidtones(initial.midtones);
    setHighlights(initial.highlights);
    setBlurRadius(initial.blurRadius);
    setPaletteId(initial.paletteId);
    setActivePaletteColors(initial.customPalette);
    setInvert(initial.invert);
    setSerpentine(initial.serpentine);
    setAsciiRamp(initial.asciiRamp);
    setAsciiCellSize(initial.asciiCellSize);
    setShowGrid(initial.showGrid);
    setGridSize(initial.gridSize);
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    persistSettings({
      version: 1,
      images,
      activeImageId,
      pattern,
      threshold,
      workingResolution,
      contrast,
      midtones,
      highlights,
      blurRadius,
      paletteId,
      customPalette: paletteId === '__custom' ? activePaletteColors : null,
      invert,
      serpentine,
      asciiRamp,
      asciiCellSize,
      showGrid,
      gridSize,
    });
  }, [storageReady, images, activeImageId, pattern, threshold, workingResolution, contrast, midtones, highlights, blurRadius, paletteId, activePaletteColors, invert, serpentine, asciiRamp, asciiCellSize, showGrid, gridSize]);

  const value = useMemo(() => ({
    images, setImages,
    activeImageId, setActiveImageId,
    videos, setVideos,
    activeVideoId, setActiveVideoId,
    pattern, setPattern,
    threshold, setThreshold,
    workingResolution, setWorkingResolution,
    workingResInput, setWorkingResInput,
  contrast, setContrast,
  midtones, setMidtones,
  highlights, setHighlights,
  blurRadius, setBlurRadius,
    webpSupported, setWebpSupported,
    paletteId, setPaletteId,
    activePaletteColors, setActivePaletteColors,
    invert, setInvert,
    serpentine, setSerpentine,
    serpentinePattern, setSerpentinePattern,
    errorDiffusionStrength, setErrorDiffusionStrength,
    asciiRamp, setAsciiRamp,
    asciiCellSize, setAsciiCellSize,
    showGrid, setShowGrid,
    gridSize, setGridSize,
    focusMode, setFocusMode,
    customKernel, setCustomKernel,
    customKernelDivisor, setCustomKernelDivisor,
    videoMode, setVideoMode,
    videoItem, setVideoItem,
    videoPlaying, setVideoPlaying,
    videoFps, setVideoFps,
    showDownload, setShowDownload,
  }), [images, activeImageId, videos, activeVideoId, pattern, threshold, workingResolution, workingResInput, contrast, midtones, highlights, blurRadius, webpSupported, paletteId, activePaletteColors, invert, serpentine, serpentinePattern, errorDiffusionStrength, asciiRamp, asciiCellSize, showGrid, gridSize, focusMode, customKernel, customKernelDivisor, videoMode, videoItem, videoPlaying, videoFps, showDownload]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export default SettingsProvider;
