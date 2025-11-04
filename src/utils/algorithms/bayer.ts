import { AlgorithmRunContext } from './types';

const BAYER_2: number[] = [0, 2, 3, 1];
const BAYER_4: number[] = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5
];
const BAYER_8: number[] = [
  0, 32, 8, 40, 2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37,
  63, 31, 55, 23, 61, 29, 53, 21
];

function buildBayer(n: number): number[] {
  if (n === 2) return BAYER_2;
  if (n === 4) return BAYER_4;
  if (n === 8) return BAYER_8;
  
  let m: number[] = [0];
  let size = 1;
  while (size < n) {
    const newSize = size * 2;
    const next = new Array(newSize * newSize);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const v = m[y * size + x];
        next[y * newSize + x] = 4 * v;
        next[y * newSize + (x + size)] = 4 * v + 2;
        next[(y + size) * newSize + x] = 4 * v + 3;
        next[(y + size) * newSize + (x + size)] = 4 * v + 1;
      }
    }
    m = next;
    size = newSize;
  }
  return m;
}

function runBayerGeneric(ctx: AlgorithmRunContext, size: number) {
  const { srcData, width, height, params } = ctx;
  const out = new Uint8ClampedArray(srcData);
  const pal = params.palette;
  const userT = params.threshold ?? 128;
  const bias = ((userT - 128) / 255) * 2;
  const matrix = buildBayer(size);
  const denom = size * size;
  const denomMinus1 = denom - 1;
  const sizeMask = size - 1; // Power-of-2 optimization for modulo
  const thresholdOffset = userT - 128;
  const scale255 = 255 / denom;
  
  if (pal && pal.length) {
    const palLen = pal.length;
    const palSize = palLen;
    
    for (let y = 0; y < height; y++) {
      const rowMod = y & sizeMask;
      const rowOffset = rowMod * size;
      
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const g = out[i];
        const colMod = x & sizeMask;
        const cellValue = matrix[rowOffset + colMod];
        const cellNorm = cellValue / denomMinus1;
        
        const base = (g / 255) + bias;
        const adj = base + (cellNorm - 0.5) / palSize;
        let pi = Math.round(adj * (palSize - 1));
        if (pi < 0) pi = 0;
        else if (pi >= palLen) pi = palLen - 1;
        
        const c = pal[pi];
        out[i] = c[0];
        out[i + 1] = c[1];
        out[i + 2] = c[2];
        out[i + 3] = 255;
      }
    }
  } else {
    // Grayscale path
    for (let y = 0; y < height; y++) {
      const rowMod = y & sizeMask;
      const rowOffset = rowMod * size;
      
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const g = out[i];
        const colMod = x & sizeMask;
        const matrixT = matrix[rowOffset + colMod] * scale255;
        const t = matrixT + thresholdOffset;
        const clampedT = t < 0 ? 0 : (t > 255 ? 255 : t);
        const v = g < clampedT ? 0 : 255;
        
        out[i] = v;
        out[i + 1] = v;
        out[i + 2] = v;
        out[i + 3] = 255;
      }
    }
  }
  
  if (params.invert && !pal) {
    for (let i = 0; i < out.length; i += 4) {
      out[i] = 255 - out[i];
      out[i + 1] = 255 - out[i + 1];
      out[i + 2] = 255 - out[i + 2];
    }
  }
  return out;
}

export function runBayer2(ctx: AlgorithmRunContext) { return runBayerGeneric(ctx, 2); }
export function runBayer4(ctx: AlgorithmRunContext) { return runBayerGeneric(ctx, 4); }
export function runBayer8(ctx: AlgorithmRunContext) { return runBayerGeneric(ctx, 8); }
export function runBayer16(ctx: AlgorithmRunContext) { return runBayerGeneric(ctx, 16); }
export function runBayer32(ctx: AlgorithmRunContext) { return runBayerGeneric(ctx, 32); }

export default { runBayer2, runBayer4, runBayer8, runBayer16, runBayer32 };