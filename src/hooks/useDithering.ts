import { useEffect, useRef, useState } from "react";
import { perf } from "../utils/perf";
import { findPalette } from "../utils/palettes";
import { applyLuminancePreprocess } from "../utils/preprocess";
import { findAlgorithm } from "../utils/algorithms";

interface Params { image: string | null; pattern: number; threshold: number; workingResolution: number; invert: boolean; serpentine: boolean; isErrorDiffusion: boolean; paletteId?: string | null; paletteColors?: [number, number, number][]; asciiRamp?: string; contrast?: number; midtones?: number; highlights?: number; blurRadius?: number; }

const useDithering = ({ image, pattern, threshold, workingResolution, invert, serpentine, isErrorDiffusion, paletteId, paletteColors, asciiRamp, contrast = 0, midtones = 1.0, highlights = 0, blurRadius = 0 }: Params) => {
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
  const busy = false;
  const [processedSizeBytes, setProcessedSizeBytes] = useState<number | null>(null);

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
    procCtx.clearRect(0, 0, width, height);
    if (blurRadius && blurRadius > 0) {
      // Use CSS filter blur while drawing for speed; approximate radius in px
      const prev = (procCtx as any).filter as string | undefined;
      (procCtx as any).filter = `blur(${Math.min(10, Math.max(0, blurRadius)).toFixed(1)}px)`;
      procCtx.drawImage(img, 0, 0, width, height);
      (procCtx as any).filter = prev || 'none';
    } else {
      procCtx.drawImage(img, 0, 0, width, height);
    }
    perf.phaseEnd('scale-draw');
    const src = procCtx.getImageData(0, 0, width, height);
    const srcData = src.data;
    // Apply luminance-based tone mapping before dithering
    applyLuminancePreprocess(srcData, { contrast, midtones, highlights });

    const palette = ((paletteColors && paletteColors.length >= 2) ? paletteColors : null) || findPalette(paletteId || null)?.colors || null;
    if (palette && invert) {
      for (let i = 0; i < srcData.length; i += 4) {
        srcData[i] = 255 - srcData[i];
        srcData[i + 1] = 255 - srcData[i + 1];
        srcData[i + 2] = 255 - srcData[i + 2];
      }
    }

    {
      let out: ImageData | null = null;
      perf.phaseStart('dither');
      const algo = findAlgorithm(pattern);
      if (algo) {
        const res = algo.run({ srcData, width, height, params: { pattern, threshold, invert: palette ? false : invert, serpentine, isErrorDiffusion, palette: palette || undefined, asciiRamp } as any });
        if (res instanceof ImageData) { out = res; } else { out = new ImageData(width, height); out.data.set(res); }
      } else {
        out = new ImageData(width, height); out.data.set(srcData);
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
        try {
          const dataUrl = displayCanvas.toDataURL('image/png');
          const comma = dataUrl.indexOf(',');
          if (comma !== -1) {
            const b64 = dataUrl.slice(comma + 1);
            const bytes = Math.floor((b64.length * 3) / 4 - (b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0));
            setProcessedSizeBytes(bytes);
          }
        } catch { }
        const t = setTimeout(() => token === renderTokenRef.current && setCanvasUpdatedFlag(false), 400);
        return () => clearTimeout(t);
      }
      perf.endFrame();
    }
  }, [pattern, threshold, workingResolution, invert, serpentine, isErrorDiffusion, renderBump, paletteId, layoutTick, paletteColors, asciiRamp, contrast, midtones, highlights, blurRadius]);

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