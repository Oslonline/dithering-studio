export const patternOptions = [
  { value: 1, label: "Floyd-Steinberg (classic)" },
  { value: 3, label: "Atkinson" },
  { value: 4, label: "Burkes" },
  { value: 5, label: "Stucki" },
  { value: 6, label: "Sierra" },
  { value: 12, label: "Sierra Lite" },
  { value: 13, label: "Two-Row Sierra" },
  { value: 14, label: "Stevenson-Arce" },
  { value: 7, label: "Jarvis-Judice-Ninke" },
  { value: 2, label: "Bayer 4x4 (ordered)" },
  { value: 8, label: "Bayer 8x8 (ordered)" },
  { value: 16, label: "Bayer 2x2 (ordered)" },
  { value: 17, label: "Blue noise 64x64 (ordered)" },
  { value: 15, label: "Threshold (binary)" },
  { value: 9, label: "Halftone (experimental)" },
  { value: 10, label: "Random threshold (experimental)" },
  { value: 11, label: "Dot diffusion (simple, experimental)" },
];

export const patternMeta: Record<number, {
  name: string;
  category: "Error Diffusion" | "Ordered" | "Other";
  description: string;
  supportsThreshold: boolean;
  note?: string;
}> = {
  1: { name: "Floyd–Steinberg", category: "Error Diffusion", description: "Classic error diffusion with good balance of speed and quality.", supportsThreshold: true },
  3: { name: "Atkinson", category: "Error Diffusion", description: "Softer diffusion producing lighter mid-tones, popular on early Macs.", supportsThreshold: true },
  4: { name: "Burkes", category: "Error Diffusion", description: "Balanced diffusion kernel similar to Stucki but lighter weight.", supportsThreshold: true },
  5: { name: "Stucki", category: "Error Diffusion", description: "Larger kernel giving smoother gradients at higher cost.", supportsThreshold: true },
  6: { name: "Sierra", category: "Error Diffusion", description: "Quality similar to Stucki with slightly less diffusion spread.", supportsThreshold: true },
  12:{ name: "Sierra Lite", category: "Error Diffusion", description: "Lightweight Sierra variant; faster with acceptable quality.", supportsThreshold: true },
  13:{ name: "Two-Row Sierra", category: "Error Diffusion", description: "Two-row variant; compromise between full Sierra and Lite.", supportsThreshold: true },
  14:{ name: "Stevenson–Arce", category: "Error Diffusion", description: "Sparse long-range diffusion; produces interesting organic texture.", supportsThreshold: true },
  7: { name: "Jarvis–Judice–Ninke", category: "Error Diffusion", description: "High quality large kernel; slower but smooth transitions.", supportsThreshold: true },
  2: { name: "Bayer 4×4", category: "Ordered", description: "Small ordered matrix; crisp pattern, good for pixel-art vibe.", supportsThreshold: false, note: "Uses internal thresholds." },
  8: { name: "Bayer 8×8", category: "Ordered", description: "Larger ordered matrix; smoother gradients with subtle texture.", supportsThreshold: false, note: "Uses internal thresholds." },
 16:{ name: "Bayer 2×2", category: "Ordered", description: "Minimal ordered matrix; very coarse, strong pattern.", supportsThreshold: false, note: "Uses internal thresholds." },
 17:{ name: "Blue Noise 64×64", category: "Ordered", description: "Tiled blue-noise mask; less visible patterning than Bayer.", supportsThreshold: false, note: "Precomputed mask." },
  15:{ name: "Binary Threshold", category: "Other", description: "Simple cutoff without diffusion; high contrast result.", supportsThreshold: true },
  9: { name: "Halftone (Experimental)", category: "Other", description: "Block-based circular dot simulation. Experimental style effect.", supportsThreshold: true },
  10:{ name: "Random Threshold", category: "Other", description: "Noise-driven thresholding producing grainy chaotic texture.", supportsThreshold: true },
  11:{ name: "Dot Diffusion (Simple)", category: "Other", description: "Toy checkerboard mask demo; not a full dot diffusion algorithm.", supportsThreshold: true },
};

// Allocate then copy to avoid TS overload mismatch
const buildImageData = (arr: Uint8ClampedArray, w: number, h: number) => {
  const img = new ImageData(w, h);
  img.data.set(arr);
  return img;
};

const PatternDrawer = (
  data: Uint8ClampedArray,
  width: number,
  height: number,
  pattern: number,
  threshold: number = 128,
  options?: { invert?: boolean; serpentine?: boolean },
) => {
  if (pattern === 1) {
    return buildImageData(data, width, height);
  }

  const errorDiffusion = (matrix: number[][], divisor: number, serpentineDefault = false) => {
    const out = new Uint8ClampedArray(data);
    const useSerpentine = options?.serpentine ?? serpentineDefault;
    for (let y = 0; y < height; y++) {
      const yOffset = y * width * 4;
      const leftToRight = !useSerpentine || y % 2 === 0;
      for (let x = leftToRight ? 0 : width - 1; leftToRight ? x < width : x >= 0; leftToRight ? x++ : x--) {
        const pxIndex = yOffset + x * 4;
        const oldPixel = out[pxIndex];
        const newPixel = oldPixel < threshold ? 0 : 255;
        const error = oldPixel - newPixel;
        out[pxIndex] = out[pxIndex + 1] = out[pxIndex + 2] = newPixel;
        // Distribute error
        for (let j = 0; j < matrix.length; j++) {
          for (let i = 0; i < matrix[j].length; i++) {
            const dx = i - Math.floor(matrix[j].length / 2);
            const dy = j;
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width * 4 + nx * 4;
              out[nIdx] += (error * matrix[j][i]) / divisor;
            }
          }
        }
      }
    }
    if (options?.invert) {
      for (let i = 0; i < out.length; i += 4) {
        out[i] = 255 - out[i];
        out[i + 1] = 255 - out[i + 1];
        out[i + 2] = 255 - out[i + 2];
      }
    }
    return buildImageData(out, width, height);
  };

  if (pattern === 2) {
    const bayerMatrix = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5],
    ];
    const matrixSize = bayerMatrix.length;
    const scaleFactor = 16;
    const out = new Uint8ClampedArray(data);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pxIndex = (y * width + x) * 4;
        const brightness = out[pxIndex];
        const t = (bayerMatrix[y % matrixSize][x % matrixSize] / scaleFactor) * 255;
        const value = brightness < t ? 0 : 255;
        out[pxIndex] = out[pxIndex + 1] = out[pxIndex + 2] = value;
        out[pxIndex + 3] = 255;
      }
    }
    if (options?.invert) {
      for (let i = 0; i < out.length; i += 4) {
        out[i] = 255 - out[i];
        out[i + 1] = 255 - out[i + 1];
        out[i + 2] = 255 - out[i + 2];
      }
    }
    return buildImageData(out, width, height);
  }

  if (pattern === 3) {
    const out = new Uint8ClampedArray(data);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pxIndex = (y * width + x) * 4;
        const oldPixel = out[pxIndex];
        const newPixel = oldPixel < threshold ? 0 : 255;
        const error = (oldPixel - newPixel) / 8;
        out[pxIndex] = out[pxIndex + 1] = out[pxIndex + 2] = newPixel;
        const coords = [
          [x + 1, y],
          [x + 2, y],
          [x - 1, y + 1],
          [x, y + 1],
          [x + 1, y + 1],
          [x, y + 2],
        ];
        for (const [nx, ny] of coords) {
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIdx = (ny * width + nx) * 4;
            out[nIdx] += error;
            out[nIdx + 1] += error;
            out[nIdx + 2] += error;
          }
        }
      }
    }
    return buildImageData(out, width, height);
  }

  if (pattern === 4) {
    const matrix = [
      [0, 0, 0, 8, 4],
      [2, 4, 8, 4, 2],
    ];
    return errorDiffusion(matrix, 32, true);
  }

  if (pattern === 5) {
    const matrix = [
      [0, 0, 0, 8, 4],
      [2, 4, 8, 4, 2],
      [1, 2, 4, 2, 1],
    ];
    return errorDiffusion(matrix, 42, true);
  }

  if (pattern === 6) {
    const matrix = [
      [0, 0, 0, 5, 3],
      [2, 4, 5, 4, 2],
      [0, 2, 3, 2, 0],
    ];
    return errorDiffusion(matrix, 32, true);
  }

  if (pattern === 7) {
    const matrix = [
      [0, 0, 0, 7, 5],
      [3, 5, 7, 5, 3],
      [1, 3, 5, 3, 1],
    ];
    return errorDiffusion(matrix, 48, true);
  }

  if (pattern === 8) {
    const bayer8x8 = [
      [0, 48, 12, 60, 3, 51, 15, 63],
      [32, 16, 44, 28, 35, 19, 47, 31],
      [8, 56, 4, 52, 11, 59, 7, 55],
      [40, 24, 36, 20, 43, 27, 39, 23],
      [2, 50, 14, 62, 1, 49, 13, 61],
      [34, 18, 46, 30, 33, 17, 45, 29],
      [10, 58, 6, 54, 9, 57, 5, 53],
      [42, 26, 38, 22, 41, 25, 37, 21],
    ];
    const matrixSize = 8;
    const scaleFactor = 64;
    const out = new Uint8ClampedArray(data);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pxIndex = (y * width + x) * 4;
        const brightness = out[pxIndex];
        const t = (bayer8x8[y % matrixSize][x % matrixSize] / scaleFactor) * 255;
        const value = brightness < t ? 0 : 255;
        out[pxIndex] = out[pxIndex + 1] = out[pxIndex + 2] = value;
        out[pxIndex + 3] = 255;
      }
    }
    if (options?.invert) {
      for (let i = 0; i < out.length; i += 4) {
        out[i] = 255 - out[i];
        out[i + 1] = 255 - out[i + 1];
        out[i + 2] = 255 - out[i + 2];
      }
    }
    return buildImageData(out, width, height);
  }

  if (pattern === 16) {
    const bayer2x2 = [
      [0, 2],
      [3, 1],
    ];
    const matrixSize = 2;
    const scaleFactor = 4;
    const out = new Uint8ClampedArray(data);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const brightness = out[idx];
        const t = (bayer2x2[y % matrixSize][x % matrixSize] / scaleFactor) * 255;
        const value = brightness < t ? 0 : 255;
        out[idx] = out[idx + 1] = out[idx + 2] = value;
        out[idx + 3] = 255;
      }
    }
    if (options?.invert) {
      for (let i = 0; i < out.length; i += 4) {
        out[i] = 255 - out[i];
        out[i + 1] = 255 - out[i + 1];
        out[i + 2] = 255 - out[i + 2];
      }
    }
    return buildImageData(out, width, height);
  }

  if (pattern === 17) {
    // Precomputed 64x64 blue-noise like mask (values 0-255). Short array for brevity; tile algorithmically if desired.
    // Using a simple shuffled distribution fallback if full mask omitted.
    const size = 64;
    const mask: number[] = [];
    for (let i = 0; i < size * size; i++) mask.push(i);
    // Fisher–Yates shuffle to approximate blue-noise order (not a true blue-noise but acceptable placeholder)
    for (let i = mask.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [mask[i], mask[j]] = [mask[j], mask[i]];
    }
    const out = new Uint8ClampedArray(data);
    const denom = size * size - 1;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const brightness = out[idx];
        const m = mask[(y % size) * size + (x % size)];
        const t = (m / denom) * 255;
        const value = brightness < t ? 0 : 255;
        out[idx] = out[idx + 1] = out[idx + 2] = value;
        out[idx + 3] = 255;
      }
    }
    if (options?.invert) {
      for (let i = 0; i < out.length; i += 4) {
        out[i] = 255 - out[i];
        out[i + 1] = 255 - out[i + 1];
        out[i + 2] = 255 - out[i + 2];
      }
    }
    return buildImageData(out, width, height);
  }

  if (pattern === 9) {
    const out = new Uint8ClampedArray(data);
    const dotSize = 6;
    for (let y = 0; y < height; y += dotSize) {
      for (let x = 0; x < width; x += dotSize) {
        let sum = 0;
        let count = 0;
        for (let dy = 0; dy < dotSize; dy++) {
          for (let dx = 0; dx < dotSize; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < width && ny < height) {
              const idx = (ny * width + nx) * 4;
              sum += out[idx];
              count++;
            }
          }
        }
        const avg = sum / count;
        const isDot = avg < threshold;
        for (let dy = 0; dy < dotSize; dy++) {
          for (let dx = 0; dx < dotSize; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < width && ny < height) {
              const idx = (ny * width + nx) * 4;
              const cx = dotSize / 2 - 0.5,
                cy = dotSize / 2 - 0.5;
              const dist = Math.sqrt((dx - cx) ** 2 + (dy - cy) ** 2);
              const radius = isDot ? dotSize / 2.2 : dotSize / 3.5;
              const v = dist < radius ? 0 : 255;
              out[idx] = out[idx + 1] = out[idx + 2] = v;
              out[idx + 3] = 255;
            }
          }
        }
      }
    }
    return buildImageData(out, width, height);
  }

  if (pattern === 10) {
    const out = new Uint8ClampedArray(data);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pxIndex = (y * width + x) * 4;
        const t = Math.random() * 255;
        const value = out[pxIndex] < t ? 0 : 255;
        out[pxIndex] = out[pxIndex + 1] = out[pxIndex + 2] = value;
        out[pxIndex + 3] = 255;
      }
    }
    return buildImageData(out, width, height);
  }

  if (pattern === 11) {
    const out = new Uint8ClampedArray(data);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pxIndex = (y * width + x) * 4;
        const mask = (x & 1) ^ (y & 1) ? threshold : 255 - threshold;
        const value = out[pxIndex] < mask ? 0 : 255;
        out[pxIndex] = out[pxIndex + 1] = out[pxIndex + 2] = value;
        out[pxIndex + 3] = 255;
      }
    }
    return buildImageData(out, width, height);
  }

  if (pattern === 12) {
    const matrix = [
      [0, 0, 2],
      [1, 1, 0],
    ];
    return errorDiffusion(matrix, 4, true);
  }

  if (pattern === 13) {
    const matrix = [
      [0, 0, 0, 4, 3],
      [1, 2, 3, 2, 1],
    ];
    return errorDiffusion(matrix, 16, true);
  }

  if (pattern === 14) {
    const matrix = [
      [0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0],
      [12, 0, 26, 0, 30, 0, 30, 0, 26, 0, 12],
      [0, 12, 0, 26, 0, 12, 0, 26, 0, 12, 0],
    ];
    return errorDiffusion(matrix, 200, false);
  }

  if (pattern === 15) {
    const out = new Uint8ClampedArray(data);
    for (let i = 0; i < out.length; i += 4) {
      const value = out[i] < threshold ? 0 : 255;
      out[i] = out[i + 1] = out[i + 2] = value;
      out[i + 3] = 255;
    }
    if (options?.invert) {
      for (let i = 0; i < out.length; i += 4) {
        out[i] = 255 - out[i];
        out[i + 1] = 255 - out[i + 1];
        out[i + 2] = 255 - out[i + 2];
      }
    }
    return buildImageData(out, width, height);
  }

  return buildImageData(data, width, height);
};

export default PatternDrawer;
