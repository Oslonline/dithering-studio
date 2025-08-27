import { useEffect, useRef, useState } from "react";
import PatternDrawer from "../components/PatternDrawer";
import floydSteinberg from "../utils/floydSteinberg";
import { findPalette } from "../utils/palettes";

interface Params {
  image: string | null;
  pattern: number;
  threshold: number;
  workingResolution: number;
  invert: boolean;
  serpentine: boolean;
  isErrorDiffusion: boolean;
  paletteId?: string | null;
}

const useDithering = ({ image, pattern, threshold, workingResolution, invert, serpentine, isErrorDiffusion, paletteId }: Params) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(document.createElement("canvas"));
  const originalDimensions = useRef({ width: 0, height: 0 });
  const [hasApplied, setHasApplied] = useState(false);
  const [canvasUpdatedFlag, setCanvasUpdatedFlag] = useState(false);
  const baseImageRef = useRef<HTMLImageElement | null>(null);
  const renderTokenRef = useRef(0);
  const [renderBump, setRenderBump] = useState(0);
  const [layoutTick, setLayoutTick] = useState(0);

  // Track resize for responsive scaling
  useEffect(() => {
    const onResize = () => setLayoutTick((v) => v + 1);
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
  setRenderBump((v) => v + 1);
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

  const width = Math.min(Math.max(16, workingResolution), img.width);
  const height = Math.round((width / img.width) * img.height);

    if (procCanvas.width !== width || procCanvas.height !== height) {
      procCanvas.width = width;
      procCanvas.height = height;
    }
    if (displayCanvas.width !== width || displayCanvas.height !== height) {
      displayCanvas.width = width;
      displayCanvas.height = height;
    }

    procCtx.clearRect(0, 0, width, height);
    procCtx.drawImage(img, 0, 0, width, height);
    const src = procCtx.getImageData(0, 0, width, height);
    const srcData = src.data;

    let out: ImageData;
    const palette = findPalette(paletteId || null)?.colors || null;
  if (pattern === 1) {
      const processed = floydSteinberg({ data: srcData, width, height, threshold, invert, serpentine, palette: palette || undefined });
      out = new ImageData(width, height);
      out.data.set(processed);
  } else {
      out = PatternDrawer(srcData, width, height, pattern, threshold, { invert, serpentine: isErrorDiffusion ? serpentine : false });
  if (palette) {
        const d = out.data;
        for (let i = 0; i < d.length; i += 4) {
          const r = d[i], g = d[i + 1], b = d[i + 2];
          let best = 0; let bestDist = Infinity;
          for (let p = 0; p < palette.length; p++) {
            const pr = palette[p][0], pg = palette[p][1], pb = palette[p][2];
            const dr = r - pr, dg = g - pg, db = b - pb;
            const dist = dr*dr + dg*dg + db*db;
            if (dist < bestDist) { bestDist = dist; best = p; }
          }
          d[i] = palette[best][0];
          d[i + 1] = palette[best][1];
          d[i + 2] = palette[best][2];
        }
      }
    }

  if (token !== renderTokenRef.current) return;

    displayCtx.putImageData(out, 0, 0);
    displayCanvas.classList.add("pixelated");

  // Responsive sizing
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

    procCtx.putImageData(out, 0, 0);

    setHasApplied(true);
    setCanvasUpdatedFlag(true);
    const t = setTimeout(() => token === renderTokenRef.current && setCanvasUpdatedFlag(false), 400);
    return () => clearTimeout(t);
  }, [pattern, threshold, workingResolution, invert, serpentine, isErrorDiffusion, renderBump, paletteId, layoutTick]);

  const resetCanvas = () => {
    const c = canvasRef.current;
    if (c) {
      const ctx = c.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, c.width, c.height);
    }
    setHasApplied(false);
  };

  return { canvasRef, processedCanvasRef, hasApplied, canvasUpdatedFlag, originalDimensions, resetCanvas };
};

export default useDithering;