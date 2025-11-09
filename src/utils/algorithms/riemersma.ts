import type { AlgorithmRunContext } from './types';


// Generate Hilbert curve coordinates for space-filling traversal
// Based on the recursive Hilbert curve algorithm

function hilbertCurve(order: number): [number, number][] {
  if (order === 0) return [[0, 0]];
  
  const previous = hilbertCurve(order - 1);
  const size = 1 << (order - 1); // 2^(order-1)
  const result: [number, number][] = [];
  
  // Rotate and reflect the previous curve into four quadrants
  // Bottom-left (rotate 90° clockwise, reflect)
  for (const [x, y] of previous) {
    result.push([y, x]);
  }
  
  // Top-left (no rotation)
  for (const [x, y] of previous) {
    result.push([x, y + size]);
  }
  
  // Top-right (no rotation)
  for (const [x, y] of previous) {
    result.push([x + size, y + size]);
  }
  
  // Bottom-right (rotate 90° counter-clockwise, reflect)
  for (const [x, y] of previous) {
    result.push([2 * size - 1 - y, size - 1 - x]);
  }
  
  return result;
}

// Scale Hilbert curve coordinates to fit image dimensions
function scaleHilbertCurve(
  curve: [number, number][],
  width: number,
  height: number
): [number, number][] {
  const curveSize = Math.sqrt(curve.length);
  const scaleX = width / curveSize;
  const scaleY = height / curveSize;
  
  return curve.map(([x, y]) => [
    Math.floor(x * scaleX),
    Math.floor(y * scaleY)
  ]);
}

/**
 * Riemersma dithering algorithm
 * Uses a space-filling Hilbert curve to traverse the image
 * Maintains a circular error buffer that diffuses error along the curve
 * 
 * @param weights - Error diffusion weights for the circular buffer (default: [1/16, 1/8, 1/4, 1/2])
 * @param bufferSize - Size of the error buffer (default: 16)
 */
export function createRiemersmaRunner(
  weights: number[] = [1/16, 1/8, 1/4, 1/2],
  bufferSize: number = 16
) {
  return function runRiemersma({ srcData, width, height, params }: AlgorithmRunContext) {
    const { threshold = 128, invert, palette } = params as any;
    const data = srcData;
    const out = new Uint8ClampedArray(data.length);
    
    // Calculate appropriate Hilbert curve order
    const maxDim = Math.max(width, height);
    const order = Math.ceil(Math.log2(maxDim));
    
    // Generate and scale Hilbert curve
    const curve = hilbertCurve(order);
    const scaledCurve = scaleHilbertCurve(curve, width, height);
    
    if (palette && palette.length) {
      // Color palette version
      const palLen = palette.length;
      const bias = ((threshold - 128) / 255) * 64;
      
      // Circular error buffers for RGB channels
      const errorBufferR = new Float32Array(bufferSize);
      const errorBufferG = new Float32Array(bufferSize);
      const errorBufferB = new Float32Array(bufferSize);
      let bufferPos = 0;
      
      // Normalize weights to sum to 1
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      const normalizedWeights = weights.map(w => w / totalWeight);
      
      // Traverse image along Hilbert curve
      for (const [x, y] of scaledCurve) {
        // Skip out-of-bounds coordinates
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        
        const idx = (y * width + x) * 4;
        let r = data[idx];
        let g = data[idx + 1];
        let b = data[idx + 2];
        
        if (invert) {
          r = 255 - r;
          g = 255 - g;
          b = 255 - b;
        }
        
        // Add accumulated error from buffer
        for (let i = 0; i < Math.min(weights.length, bufferSize); i++) {
          const bufIdx = (bufferPos - i - 1 + bufferSize) % bufferSize;
          const weight = normalizedWeights[i] || 0;
          r += errorBufferR[bufIdx] * weight;
          g += errorBufferG[bufIdx] * weight;
          b += errorBufferB[bufIdx] * weight;
        }
        
        // Apply bias and clamp
        r = Math.max(0, Math.min(255, r + bias));
        g = Math.max(0, Math.min(255, g + bias));
        b = Math.max(0, Math.min(255, b + bias));
        
        // Find nearest palette color
        let bestIdx = 0;
        let bestDist = Infinity;
        for (let i = 0; i < palLen; i++) {
          const pr = palette[i][0];
          const pg = palette[i][1];
          const pb = palette[i][2];
          const dr = r - pr;
          const dg = g - pg;
          const db = b - pb;
          const dist = dr * dr + dg * dg + db * db;
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = i;
          }
        }
        
        const [nr, ng, nb] = palette[bestIdx];
        out[idx] = nr;
        out[idx + 1] = ng;
        out[idx + 2] = nb;
        out[idx + 3] = 255;
        
        // Calculate error and add to circular buffer
        errorBufferR[bufferPos] = r - nr;
        errorBufferG[bufferPos] = g - ng;
        errorBufferB[bufferPos] = b - nb;
        bufferPos = (bufferPos + 1) % bufferSize;
      }
      
      if (invert) {
        for (let i = 0; i < out.length; i += 4) {
          out[i] = 255 - out[i];
          out[i + 1] = 255 - out[i + 1];
          out[i + 2] = 255 - out[i + 2];
        }
      }
    } else {
      // Grayscale version
      const errorBuffer = new Float32Array(bufferSize);
      let bufferPos = 0;
      
      // Normalize weights
      const totalWeight = weights.reduce((sum, w) => sum + w, 0);
      const normalizedWeights = weights.map(w => w / totalWeight);
      
      // Convert to grayscale first
      const lum = new Float32Array(width * height);
      for (let i = 0, p = 0; i < data.length; i += 4, p++) {
        lum[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      }
      
      // Traverse along Hilbert curve
      for (const [x, y] of scaledCurve) {
        if (x < 0 || x >= width || y < 0 || y >= height) continue;
        
        const lumIdx = y * width + x;
        let value = lum[lumIdx];
        
        // Add accumulated error
        for (let i = 0; i < Math.min(weights.length, bufferSize); i++) {
          const bufIdx = (bufferPos - i - 1 + bufferSize) % bufferSize;
          const weight = normalizedWeights[i] || 0;
          value += errorBuffer[bufIdx] * weight;
        }
        
        // Quantize
        const newValue = value < threshold ? 0 : 255;
        const error = value - newValue;
        
        // Store error in buffer
        errorBuffer[bufferPos] = error;
        bufferPos = (bufferPos + 1) % bufferSize;
        
        // Write output
        const idx = (y * width + x) * 4;
        const finalValue = invert ? 255 - newValue : newValue;
        out[idx] = finalValue;
        out[idx + 1] = finalValue;
        out[idx + 2] = finalValue;
        out[idx + 3] = 255;
      }
    }
    
    return out;
  };
}

export const runRiemersma = createRiemersmaRunner();
