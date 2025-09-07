import React, { createContext, useContext } from 'react';
import type { UploadedImage } from '../components/ImagesPanel';

export interface SettingsContextValue {
  images: UploadedImage[];
  setImages: React.Dispatch<React.SetStateAction<UploadedImage[]>>;
  activeImageId: string | null;
  setActiveImageId: React.Dispatch<React.SetStateAction<string | null>>;
  pattern: number; setPattern: React.Dispatch<React.SetStateAction<number>>;
  threshold: number; setThreshold: React.Dispatch<React.SetStateAction<number>>;
  workingResolution: number; setWorkingResolution: React.Dispatch<React.SetStateAction<number>>;
  workingResInput: string; setWorkingResInput: React.Dispatch<React.SetStateAction<string>>;
  webpSupported: boolean; setWebpSupported: React.Dispatch<React.SetStateAction<boolean>>;
  paletteId: string | null; setPaletteId: React.Dispatch<React.SetStateAction<string | null>>;
  activePaletteColors: [number, number, number][] | null; setActivePaletteColors: React.Dispatch<React.SetStateAction<[number, number, number][] | null>>;
  invert: boolean; setInvert: React.Dispatch<React.SetStateAction<boolean>>;
  serpentine: boolean; setSerpentine: React.Dispatch<React.SetStateAction<boolean>>;
  asciiRamp: string; setAsciiRamp: React.Dispatch<React.SetStateAction<string>>;
  showGrid: boolean; setShowGrid: React.Dispatch<React.SetStateAction<boolean>>;
  gridSize: number; setGridSize: React.Dispatch<React.SetStateAction<number>>;
  focusMode: boolean; setFocusMode: React.Dispatch<React.SetStateAction<boolean>>;
  videoMode: boolean; setVideoMode: React.Dispatch<React.SetStateAction<boolean>>;
  videoItem: { url: string; name?: string } | null; setVideoItem: React.Dispatch<React.SetStateAction<{ url: string; name?: string } | null>>;
  videoPlaying: boolean; setVideoPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  videoFps: number; setVideoFps: React.Dispatch<React.SetStateAction<number>>;
  showDownload: boolean; setShowDownload: React.Dispatch<React.SetStateAction<boolean>>;
}

export const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within a SettingsContext.Provider');
  return ctx;
}

export default SettingsContext;
