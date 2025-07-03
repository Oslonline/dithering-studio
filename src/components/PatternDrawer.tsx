export const patternOptions = [
  { value: 1, label: "Floyd-Steinberg (classic)" },
  { value: 2, label: "Bayer 4x4 (ordered)" },
  { value: 3, label: "Atkinson" },
  { value: 4, label: "Burkes" },
  { value: 5, label: "Stucki" },
  { value: 6, label: "Sierra" },
  { value: 7, label: "Jarvis-Judice-Ninke" },
  { value: 8, label: "Bayer 8x8 (ordered)" },
  { value: 9, label: "Halftone (experimental)" },
  { value: 10, label: "Random threshold (experimental)" },
  { value: 11, label: "Dot diffusion (simple, experimental)" },
  { value: 12, label: "Sierra Lite" },
  { value: 13, label: "Two-Row Sierra" },
  { value: 14, label: "Stevenson-Arce" },
  { value: 15, label: "Threshold (binary)" },
];

const PatternDrawer = (data: Uint8ClampedArray, width: number, height: number, pattern: number, threshold: number = 128) => {
  // For Floyd-Steinberg, the main algorithm is handled outside.
  if (pattern === 1) {
    return new ImageData(data, width, height);
  }

  // Helper for error diffusion
  const errorDiffusion = (matrix: number[][], divisor: number, serpentine = false) => {
    const out = new Uint8ClampedArray(data);
    for (let y = 0; y < height; y++) {
      const yOffset = y * width * 4;
      const leftToRight = !serpentine || y % 2 === 0;
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
    return new ImageData(out, width, height);
  };

  // Bayer 4x4 ordered dithering
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
    return new ImageData(out, width, height);
  }

  // Atkinson
  if (pattern === 3) {
    // Matrix: [ [0, 0, 1, 1], [1, 1, 1, 0], [0, 1, 0, 0] ]
    // Actually: 1/8 to 6 neighbors
    // Atkinson: right, right2, below-left, below, below-right, below2
    // We'll use a custom loop for this
    const out = new Uint8ClampedArray(data);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pxIndex = (y * width + x) * 4;
        const oldPixel = out[pxIndex];
        const newPixel = oldPixel < threshold ? 0 : 255;
        const error = (oldPixel - newPixel) / 8;
        out[pxIndex] = out[pxIndex + 1] = out[pxIndex + 2] = newPixel;
        // Distribute error
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
    return new ImageData(out, width, height);
  }

  // Burkes
  if (pattern === 4) {
    // Matrix: [0, 0, 0, 8, 4], [2, 4, 8, 4, 2] / 32
    const matrix = [
      [0, 0, 0, 8, 4],
      [2, 4, 8, 4, 2],
    ];
    return errorDiffusion(matrix, 32, true);
  }

  // Stucki
  if (pattern === 5) {
    // Matrix: [0, 0, 0, 8, 4], [2, 4, 8, 4, 2], [1, 2, 4, 2, 1] / 42
    const matrix = [
      [0, 0, 0, 8, 4],
      [2, 4, 8, 4, 2],
      [1, 2, 4, 2, 1],
    ];
    return errorDiffusion(matrix, 42, true);
  }

  // Sierra
  if (pattern === 6) {
    // Matrix: [0, 0, 0, 5, 3], [2, 4, 5, 4, 2], [0, 2, 3, 2, 0] / 32
    const matrix = [
      [0, 0, 0, 5, 3],
      [2, 4, 5, 4, 2],
      [0, 2, 3, 2, 0],
    ];
    return errorDiffusion(matrix, 32, true);
  }

  // Jarvis-Judice-Ninke
  if (pattern === 7) {
    // Matrix: [0, 0, 0, 7, 5], [3, 5, 7, 5, 3], [1, 3, 5, 3, 1] / 48
    const matrix = [
      [0, 0, 0, 7, 5],
      [3, 5, 7, 5, 3],
      [1, 3, 5, 3, 1],
    ];
    return errorDiffusion(matrix, 48, true);
  }

  // Bayer 8x8 ordered dithering
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
    return new ImageData(out, width, height);
  }

  // Halftone (experimental, simple circular threshold)
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
              // Draw a dot in the center of the block
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
    return new ImageData(out, width, height);
  }

  // Random threshold (experimental)
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
    return new ImageData(out, width, height);
  }

  // Dot diffusion (simple, experimental)
  if (pattern === 11) {
    // Simple checkerboard mask for demonstration
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
    return new ImageData(out, width, height);
  }

  // Sierra Lite
  if (pattern === 12) {
    // Matrix: [0, 0, 2], [1, 1, 0] / 4
    const matrix = [
      [0, 0, 2],
      [1, 1, 0],
    ];
    return errorDiffusion(matrix, 4, true);
  }

  // Two-Row Sierra
  if (pattern === 13) {
    // Matrix: [0, 0, 0, 4, 3], [1, 2, 3, 2, 1] / 16
    const matrix = [
      [0, 0, 0, 4, 3],
      [1, 2, 3, 2, 1],
    ];
    return errorDiffusion(matrix, 16, true);
  }

  // Stevenson-Arce
  if (pattern === 14) {
    // Matrix: [0,0,0,0,0,32,0,0,0,0,0],
    //         [12,0,26,0,30,0,30,0,26,0,12],
    //         [0,12,0,26,0,12,0,26,0,12,0] / 200
    const matrix = [
      [0, 0, 0, 0, 0, 32, 0, 0, 0, 0, 0],
      [12, 0, 26, 0, 30, 0, 30, 0, 26, 0, 12],
      [0, 12, 0, 26, 0, 12, 0, 26, 0, 12, 0],
    ];
    return errorDiffusion(matrix, 200, false);
  }

  // Simple Threshold (binary)
  if (pattern === 15) {
    const out = new Uint8ClampedArray(data);
    for (let i = 0; i < out.length; i += 4) {
      const value = out[i] < threshold ? 0 : 255;
      out[i] = out[i + 1] = out[i + 2] = value;
      out[i + 3] = 255;
    }
    return new ImageData(out, width, height);
  }

  // fallback: just return as is
  return new ImageData(data, width, height);
};

export default PatternDrawer;
