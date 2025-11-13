import type { AlgorithmRunContext } from './types';
import { quantizeToPalette } from './paletteUtil';

export function runPosterize({ srcData, params }: AlgorithmRunContext) {
  const { threshold = 128, invert, palette } = params as any;
  const out = new Uint8ClampedArray(srcData.length);
  
  // threshold controls levels: 0-31 = 2 levels, 32-63 = 3 levels, 64-95 = 4 levels, etc.
  const levels = Math.max(2, Math.min(16, Math.floor(threshold / 16) + 2));
  
  if (palette && palette.length) {
    const palLen = palette.length;
    const posterLevels = Math.min(levels, palLen);
    
    for (let i = 0; i < srcData.length; i += 4) {
      let r = srcData[i];
      let g = srcData[i + 1];
      let b = srcData[i + 2];
      
      if (invert) {
        r = 255 - r;
        g = 255 - g;
        b = 255 - b;
      }
      
      r = Math.floor(r / 256 * posterLevels) * (256 / posterLevels);
      g = Math.floor(g / 256 * posterLevels) * (256 / posterLevels);
      b = Math.floor(b / 256 * posterLevels) * (256 / posterLevels);
      
      const [pr, pg, pb] = quantizeToPalette(r, g, b, palette, 0);
      
      out[i] = pr;
      out[i + 1] = pg;
      out[i + 2] = pb;
      out[i + 3] = 255;
    }
    
    if (invert) {
      for (let i = 0; i < out.length; i += 4) {
        out[i] = 255 - out[i];
        out[i + 1] = 255 - out[i + 1];
        out[i + 2] = 255 - out[i + 2];
      }
    }
  } else {
    const stepSize = 256 / levels;
    
    for (let i = 0; i < srcData.length; i += 4) {
      let gray = 0.299 * srcData[i] + 0.587 * srcData[i + 1] + 0.114 * srcData[i + 2];
      
      if (invert) {
        gray = 255 - gray;
      }
      
      const level = Math.floor(gray / stepSize);
      const posterized = Math.min(255, level * stepSize);
      
      out[i] = posterized;
      out[i + 1] = posterized;
      out[i + 2] = posterized;
      out[i + 3] = 255;
    }
  }
  
  return out;
}

export function runWoodcut({ srcData, width, height, params }: AlgorithmRunContext) {
  const { threshold = 128, invert, palette } = params as any;
  const out = new Uint8ClampedArray(srcData.length);
  
  const edges = new Float32Array(width * height);
  const gray = new Float32Array(width * height);
  for (let i = 0, p = 0; i < srcData.length; i += 4, p++) {
    gray[p] = 0.299 * srcData[i] + 0.587 * srcData[i + 1] + 0.114 * srcData[i + 2];
  }
  
  // Sobel edge detection for woodcut effect
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      
      const gx = 
        -1 * gray[(y - 1) * width + (x - 1)] + 1 * gray[(y - 1) * width + (x + 1)] +
        -2 * gray[y * width + (x - 1)]       + 2 * gray[y * width + (x + 1)] +
        -1 * gray[(y + 1) * width + (x - 1)] + 1 * gray[(y + 1) * width + (x + 1)];
      
      const gy =
        -1 * gray[(y - 1) * width + (x - 1)] - 2 * gray[(y - 1) * width + x] - 1 * gray[(y - 1) * width + (x + 1)] +
         1 * gray[(y + 1) * width + (x - 1)] + 2 * gray[(y + 1) * width + x] + 1 * gray[(y + 1) * width + (x + 1)];
      
      edges[idx] = Math.sqrt(gx * gx + gy * gy);
    }
  }
  
  let maxEdge = 0;
  for (let i = 0; i < edges.length; i++) {
    if (edges[i] > maxEdge) maxEdge = edges[i];
  }
  
  if (maxEdge > 0) {
    for (let i = 0; i < edges.length; i++) {
      edges[i] = (edges[i] / maxEdge) * 255;
    }
  }
  
  const edgeStrength = (threshold / 255) * 0.7;
  
  if (palette && palette.length >= 2) {
    const darkColor = palette[0];
    const lightColor = palette[palette.length > 1 ? 1 : 0];
    
    for (let i = 0, p = 0; i < srcData.length; i += 4, p++) {
      let value = gray[p];
      
      // Enhance edges
      value = value - edges[p] * edgeStrength;
      value = Math.max(0, Math.min(255, value));
      
      if (invert) value = 255 - value;
      
      const isLight = value > threshold;
      const color = isLight ? lightColor : darkColor;
      
      out[i] = color[0];
      out[i + 1] = color[1];
      out[i + 2] = color[2];
      out[i + 3] = 255;
    }
  } else {
    for (let i = 0, p = 0; i < srcData.length; i += 4, p++) {
      let value = gray[p];
      
      value = value - edges[p] * edgeStrength;
      value = Math.max(0, Math.min(255, value));
      
      if (invert) value = 255 - value;
      
      const result = value > threshold ? 255 : 0;
      
      out[i] = result;
      out[i + 1] = result;
      out[i + 2] = result;
      out[i + 3] = 255;
    }
  }
  
  return out;
}

export function runStipple({ srcData, width, height, params }: AlgorithmRunContext) {
  const { threshold = 128, invert, palette } = params as any;
  const out = new Uint8ClampedArray(srcData.length);
  
  for (let i = 0; i < out.length; i += 4) {
    out[i] = 255;
    out[i + 1] = 255;
    out[i + 2] = 255;
    out[i + 3] = 255;
  }
  
  const density = 1.0 - (threshold / 255) * 0.8;
  const dotSize = 1;
  
  const gray = new Float32Array(width * height);
  for (let i = 0, p = 0; i < srcData.length; i += 4, p++) {
    gray[p] = 0.299 * srcData[i] + 0.587 * srcData[i + 1] + 0.114 * srcData[i + 2];
  }
  
  let dotColor: [number, number, number] = [0, 0, 0];
  if (palette && palette.length) {
    dotColor = palette[0];
  }
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      let brightness = gray[idx];
      
      if (invert) brightness = 255 - brightness;
      
      const darkness = 1.0 - (brightness / 255);
      const probability = darkness * density;
      
      // Quasi-random hash for better dot distribution
      const hashX = (x * 73856093) ^ (y * 19349663);
      const pseudoRandom = (hashX & 0xFFFFFF) / 0xFFFFFF;
      
      if (pseudoRandom < probability) {
        for (let dy = 0; dy < dotSize; dy++) {
          for (let dx = 0; dx < dotSize; dx++) {
            const px = x + dx;
            const py = y + dy;
            if (px < width && py < height) {
              const i = (py * width + px) * 4;
              out[i] = dotColor[0];
              out[i + 1] = dotColor[1];
              out[i + 2] = dotColor[2];
              out[i + 3] = 255;
            }
          }
        }
      }
    }
  }
  
  return out;
}
