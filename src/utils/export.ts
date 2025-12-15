// Canvas export helpers (SVG run-length rectangles)

import { findAlgorithm } from './algorithms';
import { applyLuminancePreprocess } from './preprocess';
import type { SerpentinePattern } from '../types/serpentinePatterns';

export interface ExportAtOriginalResolutionParams {
  imageUrl: string;
  pattern: number;
  threshold: number;
  invert: boolean;
  serpentine: boolean;
  serpentinePattern?: SerpentinePattern;
  errorDiffusionStrength?: number;
  isErrorDiffusion: boolean;
  paletteColors?: [number, number, number][] | null;
  asciiRamp?: string;
  contrast?: number;
  midtones?: number;
  highlights?: number;
  blurRadius?: number;
  customKernel?: number[][] | null;
  customKernelDivisor?: number;
  workingResolution: number; // The scale/resolution used in preview
}

/**
 * Export image at original resolution while preserving the dithering effect
 * created by workingResolution. This works by:
 * 1. Processing at workingResolution (same as preview)
 * 2. Upscaling to original size with nearest-neighbor interpolation
 * This preserves the "chunky pixel" aesthetic while outputting a high-res file.
 */
export async function exportAtOriginalResolution(params: ExportAtOriginalResolutionParams): Promise<HTMLCanvasElement> {
  const {
    imageUrl,
    pattern,
    threshold,
    invert,
    serpentine,
    serpentinePattern,
    errorDiffusionStrength = 1.0,
    isErrorDiffusion,
    paletteColors,
    asciiRamp,
    contrast = 0,
    midtones = 1.0,
    highlights = 0,
    blurRadius = 0,
    customKernel,
    customKernelDivisor,
    workingResolution
  } = params;

  // Load the original image
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = imageUrl;
  });

  const originalWidth = img.width;
  const originalHeight = img.height;

  // Calculate working dimensions (same logic as useDithering)
  const maxDim = Math.max(originalWidth, originalHeight);
  const scale = Math.min(1, Math.max(16, workingResolution) / maxDim);
  const workingWidth = Math.max(1, Math.round(originalWidth * scale));
  const workingHeight = Math.max(1, Math.round(originalHeight * scale));

  // Create canvas at working resolution (same as preview)
  const workingCanvas = document.createElement('canvas');
  workingCanvas.width = workingWidth;
  workingCanvas.height = workingHeight;
  const workingCtx = workingCanvas.getContext('2d');
  if (!workingCtx) throw new Error('Cannot get canvas context');

  // Apply blur if needed and draw at working resolution
  if (blurRadius && blurRadius > 0) {
    (workingCtx as any).filter = `blur(${Math.min(10, Math.max(0, blurRadius)).toFixed(1)}px)`;
    workingCtx.drawImage(img, 0, 0, workingWidth, workingHeight);
    (workingCtx as any).filter = 'none';
  } else {
    workingCtx.drawImage(img, 0, 0, workingWidth, workingHeight);
  }

  // Get image data and apply preprocessing
  const imageData = workingCtx.getImageData(0, 0, workingWidth, workingHeight);
  const srcData = imageData.data;
  
  applyLuminancePreprocess(srcData, { contrast, midtones, highlights });

  // Apply invert for palette mode
  const palette = paletteColors && paletteColors.length >= 2 ? paletteColors : null;
  if (palette && invert) {
    for (let i = 0; i < srcData.length; i += 4) {
      srcData[i] = 255 - srcData[i];
      srcData[i + 1] = 255 - srcData[i + 1];
      srcData[i + 2] = 255 - srcData[i + 2];
    }
  }

  // Run the dithering algorithm
  const algorithm = findAlgorithm(pattern);
  let out: ImageData | null = null;

  if (algorithm) {
    const res = algorithm.run({
      srcData,
      width: workingWidth,
      height: workingHeight,
      params: {
        pattern,
        threshold,
        invert: palette ? false : invert,
        serpentine,
        serpentinePattern,
        errorDiffusionStrength,
        isErrorDiffusion,
        palette: palette || undefined,
        asciiRamp,
        customKernel,
        customKernelDivisor
      } as any
    });
    
    if (res instanceof ImageData) {
      out = res;
    } else {
      out = new ImageData(workingWidth, workingHeight);
      out.data.set(res);
    }
  } else {
    out = imageData;
  }

  // Put dithered result on working canvas
  if (out) {
    workingCtx.putImageData(out, 0, 0);
  }

  // Upscale to original resolution using pixel-perfect nearest-neighbor
  return upscaleCanvasNearestNeighbor(workingCanvas, originalWidth, originalHeight);
}

export interface ExportVideoFrameParams {
  videoElement: HTMLVideoElement;
  pattern: number;
  threshold: number;
  invert: boolean;
  serpentine: boolean;
  serpentinePattern?: SerpentinePattern;
  errorDiffusionStrength?: number;
  isErrorDiffusion: boolean;
  paletteColors?: [number, number, number][] | null;
  asciiRamp?: string;
  contrast?: number;
  midtones?: number;
  highlights?: number;
  blurRadius?: number;
  workingResolution: number;
}

/**
 * Export video frame at original resolution while preserving the dithering effect.
 * Works exactly like exportAtOriginalResolution but for video frames:
 * 1. Capture current frame from video element
 * 2. Process at workingResolution (same as preview)
 * 3. Upscale to original size with nearest-neighbor interpolation
 */
export function exportVideoFrameAtOriginalResolution(params: ExportVideoFrameParams): HTMLCanvasElement {
  const {
    videoElement,
    pattern,
    threshold,
    invert,
    serpentine,
    serpentinePattern,
    errorDiffusionStrength = 1.0,
    isErrorDiffusion,
    paletteColors,
    asciiRamp,
    contrast = 0,
    midtones = 1.0,
    highlights = 0,
    blurRadius = 0,
    workingResolution
  } = params;

  const originalWidth = videoElement.videoWidth;
  const originalHeight = videoElement.videoHeight;

  if (!originalWidth || !originalHeight) {
    throw new Error('Video dimensions not available');
  }

  // Calculate working dimensions (same logic as useVideoDithering)
  const maxDim = Math.max(originalWidth, originalHeight);
  const scale = Math.min(1, Math.max(16, workingResolution) / maxDim);
  const workingWidth = Math.max(1, Math.round(originalWidth * scale));
  const workingHeight = Math.max(1, Math.round(originalHeight * scale));

  // Create canvas at working resolution (same as preview)
  const workingCanvas = document.createElement('canvas');
  workingCanvas.width = workingWidth;
  workingCanvas.height = workingHeight;
  const workingCtx = workingCanvas.getContext('2d', { willReadFrequently: true });
  if (!workingCtx) throw new Error('Cannot get canvas context');

  // Apply blur if needed and draw video frame at working resolution
  if (blurRadius && blurRadius > 0) {
    (workingCtx as any).filter = `blur(${Math.min(10, Math.max(0, blurRadius)).toFixed(1)}px)`;
    workingCtx.drawImage(videoElement, 0, 0, workingWidth, workingHeight);
    (workingCtx as any).filter = 'none';
  } else {
    workingCtx.drawImage(videoElement, 0, 0, workingWidth, workingHeight);
  }

  // Get image data and apply preprocessing
  const imageData = workingCtx.getImageData(0, 0, workingWidth, workingHeight);
  const srcData = imageData.data;
  
  applyLuminancePreprocess(srcData, { contrast, midtones, highlights });

  // Apply invert for palette mode
  const palette = paletteColors && paletteColors.length >= 2 ? paletteColors : null;
  if (palette && invert) {
    for (let i = 0; i < srcData.length; i += 4) {
      srcData[i] = 255 - srcData[i];
      srcData[i + 1] = 255 - srcData[i + 1];
      srcData[i + 2] = 255 - srcData[i + 2];
    }
  }

  // Run the dithering algorithm
  const algorithm = findAlgorithm(pattern);
  let out: ImageData | null = null;

  if (algorithm) {
    const res = algorithm.run({
      srcData,
      width: workingWidth,
      height: workingHeight,
      params: {
        pattern,
        threshold,
        invert: palette ? false : invert,
        serpentine,
        serpentinePattern,
        errorDiffusionStrength,
        isErrorDiffusion,
        palette: palette || undefined,
        asciiRamp
      } as any
    });
    
    if (res instanceof ImageData) {
      out = res;
    } else {
      out = new ImageData(workingWidth, workingHeight);
      out.data.set(res);
    }
  } else {
    out = imageData;
  }

  // Put dithered result on working canvas
  if (out) {
    workingCtx.putImageData(out, 0, 0);
  }

  // Upscale to original resolution using pixel-perfect nearest-neighbor
  return upscaleCanvasNearestNeighbor(workingCanvas, originalWidth, originalHeight);
}

/**
 * Upscale a canvas to target dimensions using true nearest-neighbor interpolation.
 * This preserves the pixelated/dithered look when exporting at higher resolution.
 * Uses manual pixel duplication to ensure pixel-perfect upscaling.
 */
export function upscaleCanvasNearestNeighbor(
  sourceCanvas: HTMLCanvasElement,
  targetWidth: number,
  targetHeight: number
): HTMLCanvasElement {
  // First, create a clean copy of the source canvas to avoid any rendering issues
  const srcWidth = sourceCanvas.width;
  const srcHeight = sourceCanvas.height;
  
  // Create a snapshot copy of the source canvas
  const snapshotCanvas = document.createElement('canvas');
  snapshotCanvas.width = srcWidth;
  snapshotCanvas.height = srcHeight;
  const snapshotCtx = snapshotCanvas.getContext('2d', { willReadFrequently: true });
  if (!snapshotCtx) throw new Error('Cannot get snapshot canvas context');
  snapshotCtx.drawImage(sourceCanvas, 0, 0);
  
  // If same size, just return the snapshot copy
  if (srcWidth === targetWidth && srcHeight === targetHeight) {
    return snapshotCanvas;
  }

  const finalCanvas = document.createElement('canvas');
  finalCanvas.width = targetWidth;
  finalCanvas.height = targetHeight;
  const finalCtx = finalCanvas.getContext('2d', { willReadFrequently: true });
  if (!finalCtx) throw new Error('Cannot get canvas context');

  // Get source pixel data from the snapshot (not the original canvas)
  const srcData = snapshotCtx.getImageData(0, 0, srcWidth, srcHeight);
  const src = srcData.data;

  // Create destination pixel data
  const dstData = finalCtx.createImageData(targetWidth, targetHeight);
  const dst = dstData.data;

  // Calculate scale factors
  const scaleX = srcWidth / targetWidth;
  const scaleY = srcHeight / targetHeight;

  // Manual nearest-neighbor upscaling
  for (let y = 0; y < targetHeight; y++) {
    const srcY = Math.floor(y * scaleY);
    for (let x = 0; x < targetWidth; x++) {
      const srcX = Math.floor(x * scaleX);
      
      const srcIdx = (srcY * srcWidth + srcX) * 4;
      const dstIdx = (y * targetWidth + x) * 4;
      
      dst[dstIdx] = src[srcIdx];         // R
      dst[dstIdx + 1] = src[srcIdx + 1]; // G
      dst[dstIdx + 2] = src[srcIdx + 2]; // B
      dst[dstIdx + 3] = src[srcIdx + 3]; // A
    }
  }

  finalCtx.putImageData(dstData, 0, 0);
  return finalCanvas;
}

export interface CanvasToSVGOptions { mergeRuns?: boolean; maxElementsWarn?: number; }

export function canvasToSVG(canvas: HTMLCanvasElement, opts: CanvasToSVGOptions = {}): { svg: string; elements: number; } {
  const { mergeRuns = true, maxElementsWarn = 200000 } = opts;
  const w = canvas.width; const h = canvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context not available');
  const id = ctx.getImageData(0,0,w,h);
  const d = id.data;
  let elements = 0;
  let body: string[] = [];
  for (let y=0; y<h; y++) {
    if (mergeRuns) {
      let runColor: string | null = null; let runStart = 0;
      const flush = (xEnd: number) => {
        if (runColor == null) return;
        const width = xEnd - runStart;
        body.push(`<rect x="${runStart}" y="${y}" width="${width}" height="1" fill="${runColor}" />`);
        elements++;
      };
      for (let x=0; x<w; x++) {
        const i = (y*w + x)*4;
        const a = d[i+3];
        if (a === 0) { // treat transparent as skip; flush current run
          if (runColor !== null) { flush(x); runColor = null; }
          continue;
        }
        const r = d[i]; const g = d[i+1]; const b = d[i+2];
        const col = rgbToHex(r,g,b);
        if (col !== runColor) {
          if (runColor !== null) flush(x);
          runColor = col; runStart = x;
        }
      }
      if (runColor !== null) flush(w);
    } else {
      for (let x=0; x<w; x++) {
        const i = (y*w + x)*4; const a = d[i+3]; if (a === 0) continue;
        const r = d[i]; const g = d[i+1]; const b = d[i+2];
        body.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${rgbToHex(r,g,b)}" />`);
        elements++;
      }
    }
  }
  if (elements > maxElementsWarn) {
    // eslint-disable-next-line no-console
    console.warn(`SVG export contains ${elements} elements which may be large.`);
  }
  const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">\n${body.join('\n')}\n</svg>`;
  return { svg, elements };
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + toHex(r) + toHex(g) + toHex(b);
}
function toHex(n: number): string { const s = n.toString(16); return s.length===1 ? '0'+s : s; }
