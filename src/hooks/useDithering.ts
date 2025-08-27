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
    if (pattern === 1) {
      const palette = findPalette(paletteId || null)?.colors;
      const processed = floydSteinberg({ data: srcData, width, height, threshold, invert, serpentine, palette });
      out = new ImageData(width, height);
      out.data.set(processed);
    } else {
      out = PatternDrawer(srcData, width, height, pattern, threshold, { invert, serpentine: isErrorDiffusion ? serpentine : false });
    }

  if (token !== renderTokenRef.current) return;

    displayCtx.putImageData(out, 0, 0);
    displayCanvas.classList.add("pixelated");

    procCtx.putImageData(out, 0, 0);

    setHasApplied(true);
    setCanvasUpdatedFlag(true);
    const t = setTimeout(() => token === renderTokenRef.current && setCanvasUpdatedFlag(false), 400);
    return () => clearTimeout(t);
  }, [pattern, threshold, workingResolution, invert, serpentine, isErrorDiffusion, renderBump, paletteId]);

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