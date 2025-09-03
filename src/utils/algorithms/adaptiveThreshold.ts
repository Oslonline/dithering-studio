import runFS from './floydSteinberg';
import { AlgorithmRunContext } from './types';

function computeMeanMap(src: Uint8ClampedArray, width: number, height: number, radius: number): Float32Array {
  const lum = new Float32Array(width * height);
  for (let i = 0, p = 0; i < src.length; i += 4, p++) lum[p] = 0.299 * src[i] + 0.587 * src[i + 1] + 0.114 * src[i + 2];
  const stride = width + 1;
  const integral = new Float32Array(stride * (height + 1));
  for (let y = 0; y < height; y++) {
    let rowSum = 0;
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      rowSum += lum[idx];
      integral[(y + 1) * stride + (x + 1)] = integral[y * stride + (x + 1)] + rowSum;
    }
  }
  const out = new Float32Array(width * height);
  const r = radius;
  for (let y = 0; y < height; y++) {
    const y0 = Math.max(0, y - r);
    const y1 = Math.min(height - 1, y + r);
    for (let x = 0; x < width; x++) {
      const x0 = Math.max(0, x - r);
      const x1 = Math.min(width - 1, x + r);
      const A = integral[y0 * stride + x0];
      const B = integral[y0 * stride + (x1 + 1)];
      const C = integral[(y1 + 1) * stride + x0];
      const D = integral[(y1 + 1) * stride + (x1 + 1)];
      const area = (x1 - x0 + 1) * (y1 - y0 + 1);
      out[y * width + x] = (D - B - C + A) / area;
    }
  }
  return out;
}

export function createAdaptiveFSDiffusion(radius: number) {
  return function runAdaptive(ctx: AlgorithmRunContext) {
    const { srcData, width, height, params } = ctx;
    const { threshold = 128, invert, serpentine, palette } = params as any;
    if (palette && palette.length) return runFS({ srcData, width, height, params });
    const meanMap = computeMeanMap(srcData, width, height, radius);
    const work = new Float32Array(width * height);
    for (let i = 0, p = 0; i < srcData.length; i += 4, p++) work[p] = 0.299 * srcData[i] + 0.587 * srcData[i + 1] + 0.114 * srcData[i + 2];
    const bias = threshold - 128;
    for (let y = 0; y < height; y++) {
      const serp = serpentine && (y & 1) === 1;
      if (!serp) {
        for (let x = 0; x < width; x++) {
          const idx = y * width + x;
          const localT = meanMap[idx] + bias;
          const oldVal = work[idx];
          const newVal = oldVal < localT ? 0 : 255;
          const err = oldVal - newVal;
          work[idx] = newVal;
          if (x + 1 < width) work[idx + 1] += (err * 7) / 16;
          if (y + 1 < height) {
            if (x > 0) work[idx + width - 1] += (err * 3) / 16;
            work[idx + width] += (err * 5) / 16;
            if (x + 1 < width) work[idx + width + 1] += (err * 1) / 16;
          }
        }
      } else {
        for (let x = width - 1; x >= 0; x--) {
          const idx = y * width + x;
          const localT = meanMap[idx] + bias;
          const oldVal = work[idx];
          const newVal = oldVal < localT ? 0 : 255;
          const err = oldVal - newVal;
          work[idx] = newVal;
          if (x - 1 >= 0) work[idx - 1] += (err * 7) / 16;
          if (y + 1 < height) {
            if (x + 1 < width) work[idx + width + 1] += (err * 3) / 16;
            work[idx + width] += (err * 5) / 16;
            if (x - 1 >= 0) work[idx + width - 1] += (err * 1) / 16;
          }
        }
      }
    }
    const out = new Uint8ClampedArray(srcData.length);
    for (let p = 0, i = 0; p < work.length; p++, i += 4) {
      let v = work[p];
      if (v < 0) v = 0; else if (v > 255) v = 255;
      if (invert) v = 255 - v;
      out[i] = out[i + 1] = out[i + 2] = v;
      out[i + 3] = 255;
    }
    return out;
  };
}
