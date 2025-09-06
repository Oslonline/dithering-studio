import { AlgorithmRunContext } from './types';
import { mapGrayWithCell } from './paletteUtil';

// Shared recursive Bayer generator (power-of-two size up to 64 for current needs)
function buildBayer(n: number): number[][] {
  let m: number[][] = [[0]]; let size = 1;
  while (size < n) {
    const newSize = size * 2;
    const next: number[][] = Array.from({ length: newSize }, () => Array(newSize).fill(0));
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const v = m[y][x];
        next[y][x] = 4 * v;
        next[y][x + size] = 4 * v + 2;
        next[y + size][x] = 4 * v + 3;
        next[y + size][x + size] = 4 * v + 1;
      }
    }
    m = next; size = newSize;
  }
  return m;
}

// Generic ordered Bayer runner (size must be 2^k)
function runBayerGeneric(ctx: AlgorithmRunContext, size: number) {
  const { srcData, width, height, params } = ctx;
  const out = new Uint8ClampedArray(srcData);
  const pal = params.palette;
  const userT = params.threshold ?? 128;
  const bias = ((userT - 128) / 255) * 2; // small bias reused for palette cell weighting
  const matrix = buildBayer(size);
  const denom = size * size;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const g = out[i];
      const cellNorm = matrix[y % size][x % size] / (denom - 1);
      if (pal && pal.length) {
        const c = mapGrayWithCell(g, cellNorm, pal, bias);
        out[i] = c[0]; out[i + 1] = c[1]; out[i + 2] = c[2];
      } else {
        // Derive per-pixel threshold from matrix then shift by user threshold offset
        const matrixT = (matrix[y % size][x % size] / denom) * 255;
        let t = matrixT + (userT - 128);
        if (t < 0) t = 0; else if (t > 255) t = 255;
        const v = g < t ? 0 : 255;
        out[i] = out[i + 1] = out[i + 2] = v;
      }
      out[i + 3] = 255;
    }
  }
  if (params.invert && !pal) {
    for (let i = 0; i < out.length; i += 4) {
      out[i] = 255 - out[i]; out[i + 1] = 255 - out[i + 1]; out[i + 2] = 255 - out[i + 2];
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