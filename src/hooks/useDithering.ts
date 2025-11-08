import { useEffect, useRef, useState, useMemo } from "react";
import { perf } from "../utils/perf";
import { findPalette } from "../utils/palettes";
import { applyLuminancePreprocess } from "../utils/preprocess";
import { findAlgorithm } from "../utils/algorithms";
import { useDitheringWorker } from "./useDitheringWorker";
import { processImageProgressively, getDefaultTileConfig } from "../utils/progressiveRendering";
import type { Tile } from "../utils/progressiveRendering";
import type { SerpentinePattern } from "../types/serpentinePatterns";

interface Params { image: string | null; pattern: number; threshold: number; workingResolution: number; invert: boolean; serpentine: boolean; serpentinePattern: SerpentinePattern; errorDiffusionStrength: number; isErrorDiffusion: boolean; paletteId?: string | null; paletteColors?: [number, number, number][]; asciiRamp?: string; contrast?: number; midtones?: number; highlights?: number; blurRadius?: number; customKernel?: number[][] | null; customKernelDivisor?: number; }

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const isFirstChangeRef = useRef<boolean>(true);
  
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    
    // Cancel any pending updates
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Immediate update on first change OR if enough time has passed (throttle)
    if (isFirstChangeRef.current || timeSinceLastUpdate > delay * 2) {
      isFirstChangeRef.current = false;
      lastUpdateRef.current = now;
      
      // Use RAF for smooth frame-aligned updates
      rafRef.current = requestAnimationFrame(() => {
        setDebouncedValue(value);
      });
    } else {
      // Subsequent rapid changes: debounce with trailing update
      timeoutRef.current = setTimeout(() => {
        lastUpdateRef.current = Date.now();
        setDebouncedValue(value);
      }, delay);
    }
    
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, delay]);
  
  // Reset first change flag when component unmounts or value settles
  useEffect(() => {
    const resetTimer = setTimeout(() => {
      isFirstChangeRef.current = true;
    }, delay * 3);
    
    return () => clearTimeout(resetTimer);
  }, [debouncedValue, delay]);
  
  return debouncedValue;
}

const useDithering = ({ image, pattern, threshold, workingResolution, invert, serpentine, serpentinePattern, errorDiffusionStrength, isErrorDiffusion, paletteId, paletteColors, asciiRamp, contrast = 0, midtones = 1.0, highlights = 0, blurRadius = 0, customKernel, customKernelDivisor }: Params) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));
  const originalDimensions = useRef({ width: 0, height: 0 });
  const [hasApplied, setHasApplied] = useState(false);
  const [origDims, setOrigDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [canvasUpdatedFlag, setCanvasUpdatedFlag] = useState(false);
  const baseImageRef = useRef<HTMLImageElement | null>(null);
  const renderTokenRef = useRef(0);
  const [renderBump, setRenderBump] = useState(0);
  const [layoutTick, setLayoutTick] = useState(0);
  const [processedSizeBytes, setProcessedSizeBytes] = useState<number | null>(null);
  
  const debouncedThreshold = useDebouncedValue(threshold, 33);
  const debouncedContrast = useDebouncedValue(contrast, 33);
  const debouncedMidtones = useDebouncedValue(midtones, 33);
  const debouncedHighlights = useDebouncedValue(highlights, 33);
  const debouncedBlurRadius = useDebouncedValue(blurRadius, 33);
  
  const useWorkers = false;
  const useProgressive = false;
  const progressiveThreshold = 16 * 1024 * 1024;
  
  const { submitJob, isProcessing: workerBusy } = useDitheringWorker({
    enabled: useWorkers,
    useOffscreenCanvas: false,
    onError: (error) => console.error('[Dithering] Worker error:', error),
    onSuccess: (time) => console.log(`[Dithering] Processed in ${time.toFixed(2)}ms`)
  });
  const busy = workerBusy;
  
  const algorithm = useMemo(() => findAlgorithm(pattern), [pattern]);
  const resolvedPalette = useMemo(() => {
    return ((paletteColors && paletteColors.length >= 2) ? paletteColors : null) || findPalette(paletteId || null)?.colors || null;
  }, [paletteId, paletteColors]);

  useEffect(() => {
    const onResize = () => setLayoutTick((v: number) => v + 1);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  useEffect(() => {
    if (!image) {
      baseImageRef.current = null;
      setHasApplied(false);
      return;
    }
    const img = new Image();
    img.src = image;
    img.onload = () => {
      baseImageRef.current = img;
      originalDimensions.current.width = img.width;
      originalDimensions.current.height = img.height;
      setOrigDims({ width: img.width, height: img.height });
      renderTokenRef.current++;
      setRenderBump((v: number) => v + 1);
      setHasApplied(false);
    };
    img.onerror = () => {
      baseImageRef.current = null;
      setHasApplied(false);
    };
  }, [image]);

  useEffect(() => {
    if (!baseImageRef.current) return;
    const img = baseImageRef.current;
    const displayCanvas = canvasRef.current;
    if (!displayCanvas) return;
    const displayCtx = displayCanvas.getContext("2d");
    if (!displayCtx) return;
    const procCanvas = processedCanvasRef.current;
    const procCtx = procCanvas.getContext("2d");
    if (!procCtx) return;

    const token = ++renderTokenRef.current;
    perf.newFrame(token);

    perf.phaseStart('calc-dimensions');
    const maxDim = Math.max(img.width, img.height);
    const scale = Math.min(1, Math.max(16, workingResolution) / maxDim);
    const width = Math.max(1, Math.round(img.width * scale));
    const height = Math.max(1, Math.round(img.height * scale));
    perf.phaseEnd('calc-dimensions');

    if (procCanvas.width !== width || procCanvas.height !== height) {
      procCanvas.width = width;
      procCanvas.height = height;
    }
    if (displayCanvas.width !== width || displayCanvas.height !== height) {
      displayCanvas.width = width;
      displayCanvas.height = height;
    }

    perf.phaseStart('scale-draw');
    if (debouncedBlurRadius && debouncedBlurRadius > 0) {
      const prev = (procCtx as any).filter as string | undefined;
      (procCtx as any).filter = `blur(${Math.min(10, Math.max(0, debouncedBlurRadius)).toFixed(1)}px)`;
      procCtx.drawImage(img, 0, 0, width, height);
      (procCtx as any).filter = prev || 'none';
    } else {
      procCtx.drawImage(img, 0, 0, width, height);
    }
    perf.phaseEnd('scale-draw');
    const src = procCtx.getImageData(0, 0, width, height);
    const srcData = src.data;
    applyLuminancePreprocess(srcData, { contrast: debouncedContrast, midtones: debouncedMidtones, highlights: debouncedHighlights });

    const palette = resolvedPalette;
    if (palette && invert) {
      for (let i = 0; i < srcData.length; i += 4) {
        srcData[i] = 255 - srcData[i];
        srcData[i + 1] = 255 - srcData[i + 1];
        srcData[i + 2] = 255 - srcData[i + 2];
      }
    }

    const processImage = async () => {
      let out: ImageData | null = null;
      perf.phaseStart('dither');
      
      const pixelCount = width * height;
      const shouldUseProgressive = useProgressive && pixelCount > progressiveThreshold;
      
      if (useWorkers && submitJob) {
        try {
          if (shouldUseProgressive) {
            const tileConfig = getDefaultTileConfig(width, height);
            console.log(`[Dithering] Using progressive rendering with ${tileConfig.tileWidth}x${tileConfig.tileHeight} tiles`);
            
            out = await processImageProgressively(
              src,
              async (tileImageData) => {
                const result = await submitJob({
                  imageData: tileImageData,
                  width: tileImageData.width,
                  height: tileImageData.height,
                  algorithmId: pattern,
                  params: {
                    threshold: debouncedThreshold,
                    invert: palette ? false : invert,
                    serpentine,
                    serpentinePattern,
                    errorDiffusionStrength,
                    palette: palette || undefined,
                    asciiRamp
                  }
                });
                return result || tileImageData;
              },
              (tile: Tile, currentResult: ImageData) => {
                if (token === renderTokenRef.current && displayCanvas && displayCtx) {
                  displayCtx.putImageData(currentResult, 0, 0);
                  setCanvasUpdatedFlag((v) => !v);
                }
                console.log(`[Dithering] Progress: ${tile.index + 1}/${tile.total} tiles`);
              },
              tileConfig
            );
          } else {
            out = await submitJob({
              imageData: src,
              width,
              height,
              algorithmId: pattern,
              params: {
                threshold: debouncedThreshold,
                invert: palette ? false : invert,
                serpentine,
                serpentinePattern,
                errorDiffusionStrength,
                palette: palette || undefined,
                asciiRamp
              }
            });
          }
        } catch (error) {
          console.error('[Dithering] Worker processing failed, falling back to main thread:', error);
          if (algorithm) {
            const res = algorithm.run({ srcData, width, height, params: { pattern, threshold: debouncedThreshold, invert: palette ? false : invert, serpentine, serpentinePattern, errorDiffusionStrength, isErrorDiffusion, palette: palette || undefined, asciiRamp, customKernel, customKernelDivisor } as any });
            if (res instanceof ImageData) { out = res; } else { out = new ImageData(width, height); out.data.set(res); }
          }
        }
      } else {
        if (algorithm) {
          const res = algorithm.run({ srcData, width, height, params: { pattern, threshold: debouncedThreshold, invert: palette ? false : invert, serpentine, serpentinePattern, errorDiffusionStrength, isErrorDiffusion, palette: palette || undefined, asciiRamp, customKernel, customKernelDivisor } as any });
          if (res instanceof ImageData) { out = res; } else { out = new ImageData(width, height); out.data.set(res); }
        } else {
          out = new ImageData(width, height); out.data.set(srcData);
        }
      }
      
      perf.phaseEnd('dither');

      if (token !== renderTokenRef.current) return;

      perf.phaseStart('present');
      if (out) {
        displayCtx.putImageData(out, 0, 0);
        procCtx.putImageData(out, 0, 0);
      } else {
        displayCtx.drawImage(img, 0, 0, width, height);
        procCtx.drawImage(img, 0, 0, width, height);
      }
      perf.phaseEnd('present');
      displayCanvas.classList.add("pixelated");

      const ow = originalDimensions.current.width || width;
      const oh = originalDimensions.current.height || height;
      if (ow && oh) {
        const aside = document.querySelector('aside');
        const sidebarWidth = aside ? aside.getBoundingClientRect().width : 0;
        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;
        const maxW = Math.min(viewportW - sidebarWidth - 40, 1280);
        const maxH = viewportH - 140;
        let dispW = Math.min(maxW, maxH * (ow / oh));
        if (dispW < 120) dispW = 120;
        const dispH = dispW * (oh / ow);
        displayCanvas.style.width = dispW + 'px';
        displayCanvas.style.height = dispH + 'px';
      }

      if (out) {
        setHasApplied(true);
        setCanvasUpdatedFlag(true);
        const rawBytes = width * height * 4;
        const estimatedPngBytes = Math.floor(rawBytes * 0.45);
        setProcessedSizeBytes(estimatedPngBytes);
      }
      perf.endFrame();
    };

    let cancelled = false;
    processImage().catch(error => {
      if (!cancelled) {
        console.error('[Dithering] Processing error:', error);
      }
    });

    // Cleanup function
    return () => {
      cancelled = true;
    };
  }, [pattern, debouncedThreshold, workingResolution, invert, serpentine, serpentinePattern, errorDiffusionStrength, isErrorDiffusion, renderBump, paletteId, layoutTick, paletteColors, asciiRamp, debouncedContrast, debouncedMidtones, debouncedHighlights, debouncedBlurRadius, submitJob, useWorkers]);

  const resetCanvas = () => {
    const c = canvasRef.current;
    if (c) {
      const ctx = c.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, c.width, c.height);
    }
    setHasApplied(false);
  };

  return { canvasRef, processedCanvasRef, hasApplied, canvasUpdatedFlag, originalDimensions, resetCanvas, busy, processedSizeBytes, origDims };
};

export default useDithering;