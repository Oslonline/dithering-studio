import { useEffect, useRef, useState } from "react";
import { perf } from "../utils/perf";
import { findPalette } from "../utils/palettes";
import { findAlgorithm } from "../utils/algorithms";

interface Params { image: string | null; pattern: number; threshold: number; workingResolution: number; invert: boolean; serpentine: boolean; isErrorDiffusion: boolean; paletteId?: string | null; paletteColors?: [number, number, number][]; asciiRamp?: string; }

const useDithering = ({ image, pattern, threshold, workingResolution, invert, serpentine, isErrorDiffusion, paletteId, paletteColors, asciiRamp }: Params) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));
  const originalDimensions = useRef({ width: 0, height: 0 });
  const [hasApplied, setHasApplied] = useState(false);
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
    const width = Math.min(Math.max(16, workingResolution), img.width);
    const height = Math.round((width / img.width) * img.height);
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
    procCtx.drawImage(img, 0, 0, width, height);
    perf.phaseEnd('scale-draw');
    const src = procCtx.getImageData(0, 0, width, height);
    const srcData = src.data;

    // Use palette only if it has at least 2 colors; otherwise fall back to predefined or null
    const palette = ((paletteColors && paletteColors.length >= 2) ? paletteColors : null) || findPalette(paletteId || null)?.colors || null;

    {
      let out: ImageData | null = null;
      perf.phaseStart('dither');
      const algo = findAlgorithm(pattern);
      if (algo) {
        const res = algo.run({ srcData, width, height, params: { pattern, threshold, invert, serpentine, isErrorDiffusion, palette: palette || undefined, asciiRamp } as any });
        if (res instanceof ImageData) { out = res; } else { out = new ImageData(width, height); out.data.set(res); }
      } else {
        out = new ImageData(width, height); out.data.set(srcData); // fallback (should not happen once all migrated)
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
        // Estimate PNG size of current canvas for perf overlay (KB display)
        try {
          const dataUrl = displayCanvas.toDataURL('image/png');
          // Strip header 'data:image/png;base64,' then compute bytes from base64 length
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
  }, [pattern, threshold, workingResolution, invert, serpentine, isErrorDiffusion, renderBump, paletteId, layoutTick, paletteColors, asciiRamp]);

  const resetCanvas = () => {
    const c = canvasRef.current;
    if (c) {
      const ctx = c.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, c.width, c.height);
    }
    setHasApplied(false);
  };

  return { canvasRef, processedCanvasRef, hasApplied, canvasUpdatedFlag, originalDimensions, resetCanvas, busy, processedSizeBytes };
};

export default useDithering;