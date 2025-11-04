import { AlgorithmRunContext } from './types';

/**
 * Generic error diffusion kernel runner
 * Time: O(n × k), Space: O(n)
 */
function createKernelRunner(matrix: number[][], divisor: number, serpentineDefault = false) {
  return function runKernel({ srcData, width, height, params }: AlgorithmRunContext) {
    const out = new Uint8ClampedArray(srcData);
    const pal = params.palette;
    const palLums = pal ? pal.map(c => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) : null;
    const paletteBias = ((params.threshold ?? 128) - 128) / 255 * 64;
    const useSerpentine = params.serpentine ?? serpentineDefault;
    for (let y = 0; y < height; y++) {
      const leftToRight = !useSerpentine || y % 2 === 0;
      for (let xi = leftToRight ? 0 : width - 1; leftToRight ? xi < width : xi >= 0; leftToRight ? xi++ : xi--) {
        const x = xi;
        const idx = (y * width + x) * 4;
        const oldLum = out[idx];
        let newLum: number; let r: number; let g: number; let b: number;
        if (pal && palLums) {
          const biased = Math.max(0, Math.min(255, oldLum + paletteBias));
          let bestI = 0; let bestD = Infinity;
          for (let i = 0; i < palLums.length; i++) { const d = Math.abs(palLums[i] - biased); if (d < bestD) { bestD = d; bestI = i; } }
          const c = pal[bestI]; r = c[0]; g = c[1]; b = c[2]; newLum = palLums[bestI];
        } else {
          newLum = oldLum < (params.threshold ?? 128) ? 0 : 255; r = g = b = newLum;
        }
        const err = oldLum - newLum;
        out[idx] = r; out[idx + 1] = g; out[idx + 2] = b;
        for (let j = 0; j < matrix.length; j++) {
          for (let i = 0; i < matrix[j].length; i++) {
            const w = matrix[j][i]; if (!w) continue;
            const dx = i - Math.floor(matrix[j].length / 2);
            const dy = j;
            const nx = x + (leftToRight ? dx : -dx);
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = (ny * width + nx) * 4;
              const diff = (err * w) / divisor;
              out[nIdx] += diff; out[nIdx + 1] += diff; out[nIdx + 2] += diff;
            }
          }
        }
      }
    }
    if (params.invert && !pal) {
      for (let i = 0; i < out.length; i += 4) { out[i] = 255 - out[i]; out[i + 1] = 255 - out[i + 1]; out[i + 2] = 255 - out[i + 2]; }
    }
    return out;
  };
}

export function runFloydSteinberg({ srcData, width, height, params }: AlgorithmRunContext) {
  const { threshold = 128, invert, serpentine, palette } = params as any;
  const data = srcData;
  const out = new Uint8ClampedArray(data.length);

  // Pre-computed Floyd-Steinberg coefficients (avoid 16 divisions per pixel)
  const FS_7_16 = 7 / 16;
  const FS_3_16 = 3 / 16;
  const FS_5_16 = 5 / 16;
  const FS_1_16 = 1 / 16;

  if (palette && palette.length) {
    const work = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) work[i] = data[i];
    const bias = ((threshold - 128) / 255) * 64;
    const palLen = palette.length;

    for (let y = 0; y < height; y++) {
      const serp = serpentine && (y & 1) === 1;
      const rowOffset = y * width * 4;

      if (!serp) {
        for (let x = 0; x < width; x++) {
          const base = rowOffset + x * 4;
          let r = work[base], g = work[base + 1], b = work[base + 2];
          if (invert) { r = 255 - r; g = 255 - g; b = 255 - b; }

          // Apply bias with single clamp
          r = r + bias; if (r < 0) r = 0; else if (r > 255) r = 255;
          g = g + bias; if (g < 0) g = 0; else if (g > 255) g = 255;
          b = b + bias; if (b < 0) b = 0; else if (b > 255) b = 255;

          // Inline palette quantization (avoid function call overhead)
          let bestIdx = 0, bestDist = Infinity;
          for (let i = 0; i < palLen; i++) {
            const pr = palette[i][0], pg = palette[i][1], pb = palette[i][2];
            const dr = r - pr, dg = g - pg, db = b - pb;
            const dist = dr * dr + dg * dg + db * db;
            if (dist < bestDist) { bestDist = dist; bestIdx = i; }
          }
          const [nr, ng, nb] = palette[bestIdx];
          const er = r - nr, eg = g - ng, eb = b - nb;

          work[base] = nr; work[base + 1] = ng; work[base + 2] = nb; work[base + 3] = 255;

          // Distribute error with pre-computed coefficients
          if (x + 1 < width) {
            const i2 = base + 4;
            work[i2] += er * FS_7_16; work[i2 + 1] += eg * FS_7_16; work[i2 + 2] += eb * FS_7_16;
          }
          if (y + 1 < height) {
            const nextRow = base + width * 4;
            if (x > 0) {
              const i2 = nextRow - 4;
              work[i2] += er * FS_3_16; work[i2 + 1] += eg * FS_3_16; work[i2 + 2] += eb * FS_3_16;
            }
            work[nextRow] += er * FS_5_16; work[nextRow + 1] += eg * FS_5_16; work[nextRow + 2] += eb * FS_5_16;
            if (x + 1 < width) {
              const i2 = nextRow + 4;
              work[i2] += er * FS_1_16; work[i2 + 1] += eg * FS_1_16; work[i2 + 2] += eb * FS_1_16;
            }
          }
        }
      } else {
        for (let x = width - 1; x >= 0; x--) {
          const base = rowOffset + x * 4;
          let r = work[base], g = work[base + 1], b = work[base + 2];
          if (invert) { r = 255 - r; g = 255 - g; b = 255 - b; }

          r = r + bias; if (r < 0) r = 0; else if (r > 255) r = 255;
          g = g + bias; if (g < 0) g = 0; else if (g > 255) g = 255;
          b = b + bias; if (b < 0) b = 0; else if (b > 255) b = 255;

          let bestIdx = 0, bestDist = Infinity;
          for (let i = 0; i < palLen; i++) {
            const pr = palette[i][0], pg = palette[i][1], pb = palette[i][2];
            const dr = r - pr, dg = g - pg, db = b - pb;
            const dist = dr * dr + dg * dg + db * db;
            if (dist < bestDist) { bestDist = dist; bestIdx = i; }
          }
          const [nr, ng, nb] = palette[bestIdx];
          const er = r - nr, eg = g - ng, eb = b - nb;

          work[base] = nr; work[base + 1] = ng; work[base + 2] = nb; work[base + 3] = 255;

          if (x - 1 >= 0) {
            const i2 = base - 4;
            work[i2] += er * FS_7_16; work[i2 + 1] += eg * FS_7_16; work[i2 + 2] += eb * FS_7_16;
          }
          if (y + 1 < height) {
            const nextRow = base + width * 4;
            if (x + 1 < width) {
              const i2 = nextRow + 4;
              work[i2] += er * FS_3_16; work[i2 + 1] += eg * FS_3_16; work[i2 + 2] += eb * FS_3_16;
            }
            work[nextRow] += er * FS_5_16; work[nextRow + 1] += eg * FS_5_16; work[nextRow + 2] += eb * FS_5_16;
            if (x - 1 >= 0) {
              const i2 = nextRow - 4;
              work[i2] += er * FS_1_16; work[i2 + 1] += eg * FS_1_16; work[i2 + 2] += eb * FS_1_16;
            }
          }
        }
      }
    }

    for (let i = 0; i < data.length; i++) out[i] = work[i];
    if (invert) {
      for (let i = 0; i < out.length; i += 4) {
        out[i] = 255 - out[i]; out[i + 1] = 255 - out[i + 1]; out[i + 2] = 255 - out[i + 2];
      }
    }
    return out;
  }

  // Grayscale branch
  const lum = new Float32Array(width * height);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    lum[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  }

  for (let y = 0; y < height; y++) {
    const serp = serpentine && (y & 1) === 1;
    const rowOffset = y * width;

    if (!serp) {
      for (let x = 0; x < width; x++) {
        const idx = rowOffset + x;
        const oldVal = lum[idx];
        const newVal = oldVal < threshold ? 0 : 255;
        const err = oldVal - newVal;
        lum[idx] = newVal;

        if (x + 1 < width) lum[idx + 1] += err * FS_7_16;
        if (y + 1 < height) {
          const nextRow = idx + width;
          if (x > 0) lum[nextRow - 1] += err * FS_3_16;
          lum[nextRow] += err * FS_5_16;
          if (x + 1 < width) lum[nextRow + 1] += err * FS_1_16;
        }
      }
    } else {
      for (let x = width - 1; x >= 0; x--) {
        const idx = rowOffset + x;
        const oldVal = lum[idx];
        const newVal = oldVal < threshold ? 0 : 255;
        const err = oldVal - newVal;
        lum[idx] = newVal;

        if (x - 1 >= 0) lum[idx - 1] += err * FS_7_16;
        if (y + 1 < height) {
          const nextRow = idx + width;
          if (x + 1 < width) lum[nextRow + 1] += err * FS_3_16;
          lum[nextRow] += err * FS_5_16;
          if (x - 1 >= 0) lum[nextRow - 1] += err * FS_1_16;
        }
      }
    }
  }

  for (let p = 0, i = 0; p < lum.length; p++, i += 4) {
    const v = lum[p] < 0 ? 0 : (lum[p] > 255 ? 255 : lum[p]);
    out[i] = out[i + 1] = out[i + 2] = v;
    out[i + 3] = 255;
  }

  if (invert) {
    for (let i = 0; i < out.length; i += 4) {
      out[i] = 255 - out[i]; out[i + 1] = 255 - out[i + 1]; out[i + 2] = 255 - out[i + 2];
    }
  }
  return out;
}

// Atkinson
export function runAtkinson({ srcData, width, height, params }: AlgorithmRunContext) {
  const out = new Uint8ClampedArray(srcData);
  const pal = params.palette;
  const palLums = pal ? pal.map(c => 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]) : null;
  const paletteBias = ((params.threshold ?? 128) - 128) / 255 * 64;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pxIndex = (y * width + x) * 4;
      const origLum = out[pxIndex];
      let newLum: number; let setR: number; let setG: number; let setB: number;
      if (pal && palLums) {
        const biased = Math.max(0, Math.min(255, origLum + paletteBias));
        let bestI = 0; let bestD = Infinity;
        for (let i = 0; i < palLums.length; i++) { const d = Math.abs(palLums[i] - biased); if (d < bestD) { bestD = d; bestI = i; } }
        const c = pal[bestI]; setR = c[0]; setG = c[1]; setB = c[2]; newLum = palLums[bestI];
      } else {
        newLum = origLum < (params.threshold ?? 128) ? 0 : 255; setR = setG = setB = newLum;
      }
      const error = (origLum - newLum) / 8;
      out[pxIndex] = setR; out[pxIndex + 1] = setG; out[pxIndex + 2] = setB;
      const coords = [[x + 1, y], [x + 2, y], [x - 1, y + 1], [x, y + 1], [x + 1, y + 1], [x, y + 2]];
      for (const [nx, ny] of coords) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nIdx = (ny * width + nx) * 4;
          out[nIdx] += error; out[nIdx + 1] += error; out[nIdx + 2] += error;
        }
      }
    }
  }
  if (params.invert) {
    for (let i = 0; i < out.length; i += 4) {
      out[i] = 255 - out[i]; out[i + 1] = 255 - out[i + 1]; out[i + 2] = 255 - out[i + 2];
    }
  }
  return out;
}

// False Floyd–Steinberg
export function runFalseFloydSteinberg(ctx: AlgorithmRunContext) {
  const { srcData, width, height, params } = ctx; const out = new Uint8ClampedArray(srcData); const serp = !!params.serpentine; const thresh = params.threshold ?? 128;
  const distribute = (x: number, y: number, err: number, l2r: boolean) => { if (l2r) { if (x + 1 < width) { const i = (y * width + (x + 1)) * 4; out[i] += (err * 3) / 8; out[i + 1] += (err * 3) / 8; out[i + 2] += (err * 3) / 8; } if (y + 1 < height) { { const i = ((y + 1) * width + x) * 4; out[i] += (err * 3) / 8; out[i + 1] += (err * 3) / 8; out[i + 2] += (err * 3) / 8; } if (x + 1 < width) { const i = ((y + 1) * width + (x + 1)) * 4; out[i] += (err * 2) / 8; out[i + 1] += (err * 2) / 8; out[i + 2] += (err * 2) / 8; } } } else { if (x - 1 >= 0) { const i = (y * width + (x - 1)) * 4; out[i] += (err * 3) / 8; out[i + 1] += (err * 3) / 8; out[i + 2] += (err * 3) / 8; } if (y + 1 < height) { { const i = ((y + 1) * width + x) * 4; out[i] += (err * 3) / 8; out[i + 1] += (err * 3) / 8; out[i + 2] += (err * 3) / 8; } if (x - 1 >= 0) { const i = ((y + 1) * width + (x - 1)) * 4; out[i] += (err * 2) / 8; out[i + 1] += (err * 2) / 8; out[i + 2] += (err * 2) / 8; } } } };
  for (let y = 0; y < height; y++) { const l2r = !serp || y % 2 === 0; if (l2r) { for (let x = 0; x < width; x++) { const idx = (y * width + x) * 4; const oldV = out[idx]; const newV = oldV < thresh ? 0 : 255; const err = oldV - newV; out[idx] = out[idx + 1] = out[idx + 2] = newV; distribute(x, y, err, true); } } else { for (let x = width - 1; x >= 0; x--) { const idx = (y * width + x) * 4; const oldV = out[idx]; const newV = oldV < thresh ? 0 : 255; const err = oldV - newV; out[idx] = out[idx + 1] = out[idx + 2] = newV; distribute(x, y, err, false); } } }
  if (params.invert) { for (let i = 0; i < out.length; i += 4) { out[i] = 255 - out[i]; out[i + 1] = 255 - out[i + 1]; out[i + 2] = 255 - out[i + 2]; } }
  return out;
}

// Adaptive Ostromoukhov (kept as-is)
export function runAdaptiveOstromoukhov(ctx: AlgorithmRunContext) {
  const { srcData, width, height, params } = ctx; const out = new Uint8ClampedArray(srcData); const thresh = params.threshold ?? 128; const kernels: { w: number[] }[] = [{ w: [7, 3, 5, 1] }, { w: [5, 3, 3, 1] }, { w: [4, 3, 2, 1] }, { w: [3, 2, 2, 1] }, { w: [2, 2, 1, 1] }];
  for (let y = 0; y < height; y++) { const serp = params.serpentine && (y % 2 === 1); for (let xi = 0; xi < width; xi++) { const x = serp ? (width - 1 - xi) : xi; const idx = (y * width + x) * 4; const old = out[idx]; const neu = old < thresh ? 0 : 255; const err = old - neu; out[idx] = out[idx + 1] = out[idx + 2] = neu; const bucket = Math.min(4, Math.max(0, Math.floor(old / 51))); const weights = kernels[bucket].w; const denom = weights.reduce((a, b) => a + b, 0); const coords = serp ? [[x - 1, y], [x - 2, y], [x, y + 1], [x - 1, y + 1]] : [[x + 1, y], [x + 2, y], [x, y + 1], [x + 1, y + 1]]; for (let c = 0; c < coords.length; c++) { const [nx, ny] = coords[c]; if (nx >= 0 && nx < width && ny >= 0 && ny < height) { const nIdx = (ny * width + nx) * 4; const dif = (err * weights[c]) / denom; out[nIdx] += dif; out[nIdx + 1] += dif; out[nIdx + 2] += dif; } } } }
  if (params.invert) { for (let i = 0; i < out.length; i += 4) { out[i] = 255 - out[i]; out[i + 1] = 255 - out[i + 1]; out[i + 2] = 255 - out[i + 2]; } }
  return out;
}

// Adaptive FS (3x3 & 7x7 radius variants) grayscale only unless palette provided (then fallback to standard FS externally)
function makeAdaptiveFS(radius: number) {
  return function runAdaptive(ctx: AlgorithmRunContext) {
    const { srcData, width, height, params } = ctx;
    const { threshold = 128, invert, serpentine, palette } = params as any;
    if (palette && palette.length) return runFloydSteinberg(ctx); // delegate to palette-aware FS
    const meanMap = computeMeanMap(srcData, width, height, radius);
    const work = new Float32Array(width * height);
    for (let i = 0, p = 0; i < srcData.length; i += 4, p++) work[p] = 0.299 * srcData[i] + 0.587 * srcData[i + 1] + 0.114 * srcData[i + 2];
    const bias = threshold - 128;
    for (let y = 0; y < height; y++) {
      const serp = serpentine && (y & 1) === 1;
      if (!serp) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x; const localT = meanMap[idx] + bias; const oldVal = work[idx]; const newVal = oldVal < localT ? 0 : 255; const err = oldVal - newVal; work[idx] = newVal;
          if (x + 1 < width) work[idx + 1] += (err * 7) / 16;
          if (y + 1 < height) { if (x > 0) work[idx + width - 1] += (err * 3) / 16; work[idx + width] += (err * 5) / 16; if (x + 1 < width) work[idx + width + 1] += (err * 1) / 16; }
        }
      } else {
        for (let x = width - 1; x >= 0; x--) {
          const idx = y * width + x; const localT = meanMap[idx] + bias; const oldVal = work[idx]; const newVal = oldVal < localT ? 0 : 255; const err = oldVal - newVal; work[idx] = newVal;
          if (x - 1 >= 0) work[idx - 1] += (err * 7) / 16;
          if (y + 1 < height) { if (x + 1 < width) work[idx + width + 1] += (err * 3) / 16; work[idx + width] += (err * 5) / 16; if (x - 1 >= 0) work[idx + width - 1] += (err * 1) / 16; }
        }
      }
    }
    const out = new Uint8ClampedArray(srcData.length);
    for (let p = 0, i = 0; p < work.length; p++, i += 4) {
      let v = work[p]; if (v < 0) v = 0; else if (v > 255) v = 255; if (invert) v = 255 - v; out[i] = out[i + 1] = out[i + 2] = v; out[i + 3] = 255;
    }
    return out;
  };
}

function computeMeanMap(src: Uint8ClampedArray, width: number, height: number, radius: number): Float32Array {
  const lum = new Float32Array(width * height);
  for (let i = 0, p = 0; i < src.length; i += 4, p++) lum[p] = 0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2];
  const stride = width + 1; const integral = new Float32Array(stride * (height + 1));
  for (let y = 0; y < height; y++) { let rowSum = 0; for (let x = 0; x < width; x++) { const idx = y * width + x; rowSum += lum[idx]; integral[(y + 1) * stride + (x + 1)] = integral[y * stride + (x + 1)] + rowSum; } }
  const out = new Float32Array(width * height); const r = radius;
  for (let y = 0; y < height; y++) { const y0 = Math.max(0, y - r); const y1 = Math.min(height - 1, y + r); for (let x = 0; x < width; x++) { const x0 = Math.max(0, x - r); const x1 = Math.min(width - 1, x + r); const A = integral[y0 * stride + x0]; const B = integral[y0 * stride + (x1 + 1)]; const C = integral[(y1 + 1) * stride + x0]; const D = integral[(y1 + 1) * stride + (x1 + 1)]; const area = (x1 - x0 + 1) * (y1 - y0 + 1); out[y * width + x] = (D - B - C + A) / area; } }
  return out;
}

// Kernel-based family definitions
export const runSierraLite = createKernelRunner([[0, 0, 2], [1, 1, 0]], 4, true);
export const runBurkes = createKernelRunner([[0, 0, 0, 8, 4], [2, 4, 8, 4, 2]], 32, true);
export const runStucki = createKernelRunner([[0, 0, 0, 8, 4], [2, 4, 8, 4, 2], [1, 2, 4, 2, 1]], 42, true);
export const runSierra = createKernelRunner([[0, 0, 0, 5, 3], [2, 4, 5, 4, 2], [0, 2, 3, 2, 0]], 32, true);
export const runJJN = createKernelRunner([[0, 0, 0, 7, 5], [3, 5, 7, 5, 3], [1, 3, 5, 3, 1]], 48, true);
export const runTwoRowSierra = createKernelRunner([[0, 0, 0, 4, 3], [1, 2, 3, 2, 1]], 16, true);
export const runStevensonArce = createKernelRunner([[0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0], [12, 0, 26, 0, 30, 0, 30, 0, 26, 0, 12], [0, 12, 0, 26, 0, 12, 0, 26, 0, 12, 0]], 200, false);
export const runSierra24A = createKernelRunner([[0, 0, 4, 5, 4], [2, 4, 5, 4, 2], [0, 2, 3, 2, 0]], 37, true);
export const runAdaptiveFS3 = makeAdaptiveFS(1);
export const runAdaptiveFS7 = makeAdaptiveFS(3);

export function runCustomKernel(ctx: AlgorithmRunContext) {
  const customMatrix = (ctx.params as any).customKernel;
  const customDivisor = (ctx.params as any).customKernelDivisor;

  if (!customMatrix || !customDivisor || !Array.isArray(customMatrix)) {
    return runFloydSteinberg(ctx);
  }

  const runner = createKernelRunner(customMatrix, customDivisor, true);
  return runner(ctx);
}

export default {
  runFloydSteinberg,
  runAtkinson,
  runSierraLite,
  runBurkes,
  runStucki,
  runSierra,
  runJJN,
  runTwoRowSierra,
  runStevensonArce,
  runSierra24A,
  runFalseFloydSteinberg,
  runAdaptiveOstromoukhov,
  runAdaptiveFS3,
  runAdaptiveFS7,
  runCustomKernel,
};