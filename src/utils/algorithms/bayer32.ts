import { AlgorithmRunContext } from './types';
import { mapGrayWithCell } from './paletteUtil';

// Dynamically generate 32x32 Bayer matrix via recursive construction.
export function runBayer32(ctx: AlgorithmRunContext) {
  const { srcData, width, height, params } = ctx; const out = new Uint8ClampedArray(srcData); const pal = params.palette; const userT = params.threshold ?? 128; const bias = ((userT - 128) / 255) * 2;
  const buildBayer = (n: number): number[][] => { let m: number[][] = [[0]]; let size = 1; while (size < n) { const newSize = size * 2; const next: number[][] = Array.from({ length: newSize }, () => Array(newSize).fill(0)); for (let y = 0; y < size; y++) { for (let x = 0; x < size; x++) { const v = m[y][x]; next[y][x] = 4 * v; next[y][x + size] = 4 * v + 2; next[y + size][x] = 4 * v + 3; next[y + size][x + size] = 4 * v + 1; } } m = next; size = newSize; } return m; };
  const matrix = buildBayer(32); const denom = 1024; // 32^2
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) { const i = (y * width + x) * 4; const g = out[i]; const cellVal = matrix[y % 32][x % 32] / (denom - 1); if (pal && pal.length) { const c = mapGrayWithCell(g, cellVal, pal, bias); out[i] = c[0]; out[i + 1] = c[1]; out[i + 2] = c[2]; } else { const matrixT = (matrix[y % 32][x % 32] / denom) * 255; let t = matrixT + (userT - 128); if (t < 0) t = 0; else if (t > 255) t = 255; const v = g < t ? 0 : 255; out[i] = out[i + 1] = out[i + 2] = v; } out[i + 3] = 255; }
  if (params.invert && !pal) { for (let i = 0; i < out.length; i += 4) { out[i] = 255 - out[i]; out[i + 1] = 255 - out[i + 1]; out[i + 2] = 255 - out[i + 2]; } }
  return out;
}

export default runBayer32;
