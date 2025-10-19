import { describe, it, expect } from 'vitest';
import {
  runBayer2,
  runBayer4,
  runBayer8,
  runBayer16,
  runBayer32,
} from '../../../utils/algorithms/bayer';
import type { AlgorithmRunContext } from '../../../utils/algorithms/types';
import {
  createTestImageData,
  createGradientImageData,
  testPalettes,
} from '../../fixtures';
import {
  expectOnlyPaletteColors,
} from '../../algorithmTestUtils';

/**
 * Helper to create algorithm run context from ImageData
 */
function createContext(
  imageData: ImageData,
  params: Partial<AlgorithmRunContext['params']> = {}
): AlgorithmRunContext {
  return {
    srcData: imageData.data,
    width: imageData.width,
    height: imageData.height,
    params: {
      pattern: 0,
      threshold: 128,
      invert: false,
      serpentine: false,
      isErrorDiffusion: false,
      palette: [],
      ...params,
    },
  };
}

/**
 * Helper to convert Uint8ClampedArray result back to ImageData
 */
function resultToImageData(
  result: Uint8ClampedArray,
  width: number,
  height: number
): ImageData {
  return new ImageData(new Uint8ClampedArray(result), width, height);
}

describe('Bayer Dithering Algorithms', () => {
  const palette = testPalettes.blackAndWhite as [number, number, number][];

  describe('Bayer 2×2', () => {
    it('should produce only palette colors', () => {
      const input = createTestImageData(16, 16, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runBayer2(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      expectOnlyPaletteColors(result, palette);
    });

    it('should create a repeating 2×2 pattern', () => {
      const input = createTestImageData(8, 8, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runBayer2(ctx);
      
      // Verify pattern repeats every 2 pixels
      const getPixel = (x: number, y: number) => {
        const idx = (y * 8 + x) * 4;
        return resultData[idx];
      };

      // Pattern should repeat
      expect(getPixel(0, 0)).toBe(getPixel(2, 0));
      expect(getPixel(0, 0)).toBe(getPixel(0, 2));
      expect(getPixel(1, 1)).toBe(getPixel(3, 3));
    });

    it('should handle edge cases', () => {
      const tiny = createTestImageData(1, 1, [128, 128, 128, 255]);
      expect(() => runBayer2(createContext(tiny, { palette }))).not.toThrow();
      
      const black = createTestImageData(4, 4, [0, 0, 0, 255]);
      const blackResult = runBayer2(createContext(black, { palette }));
      expectOnlyPaletteColors(resultToImageData(blackResult, 4, 4), palette);
    });

    it('should work with larger palettes', () => {
      const input = createGradientImageData(16, 16);
      const ctx = createContext(input, { palette: testPalettes.grayscale4 as any });
      const resultData = runBayer2(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      expectOnlyPaletteColors(result, testPalettes.grayscale4 as any);
    });
  });

  describe('Bayer 4×4', () => {
    it('should produce only palette colors', () => {
      const input = createTestImageData(16, 16, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runBayer4(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      expectOnlyPaletteColors(result, palette);
    });

    it('should create a repeating 4×4 pattern', () => {
      const input = createTestImageData(16, 16, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runBayer4(ctx);
      
      const getPixel = (x: number, y: number) => {
        const idx = (y * 16 + x) * 4;
        return resultData[idx];
      };

      // Pattern should repeat every 4 pixels
      expect(getPixel(0, 0)).toBe(getPixel(4, 0));
      expect(getPixel(0, 0)).toBe(getPixel(0, 4));
    });

    it('should handle threshold parameter', () => {
      const input = createTestImageData(16, 16, [128, 128, 128, 255]);
      const ctx1 = createContext(input, { palette, threshold: 64 });
      const ctx2 = createContext(input, { palette, threshold: 192 });
      
      const result1 = runBayer4(ctx1);
      const result2 = runBayer4(ctx2);
      
      // Different thresholds should produce different results
      let different = false;
      for (let i = 0; i < result1.length; i++) {
        if (result1[i] !== result2[i]) {
          different = true;
          break;
        }
      }
      expect(different).toBe(true);
    });
  });

  describe('Bayer 8×8', () => {
    it('should produce only palette colors', () => {
      const input = createTestImageData(32, 32, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runBayer8(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      expectOnlyPaletteColors(result, palette);
    });

    it('should create a repeating 8×8 pattern', () => {
      const input = createTestImageData(32, 32, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runBayer8(ctx);
      
      const getPixel = (x: number, y: number) => {
        const idx = (y * 32 + x) * 4;
        return resultData[idx];
      };

      // Pattern should repeat every 8 pixels
      expect(getPixel(0, 0)).toBe(getPixel(8, 0));
      expect(getPixel(0, 0)).toBe(getPixel(0, 8));
    });

    it('should perform reasonably fast', () => {
      const input = createTestImageData(256, 256);
      const ctx = createContext(input, { palette });
      
      const start = performance.now();
      runBayer8(ctx);
      const time = performance.now() - start;
      
      expect(time).toBeLessThan(300); // 300ms max for 256×256
    });
  });

  describe('Bayer 16×16', () => {
    it('should produce only palette colors', () => {
      const input = createTestImageData(64, 64, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runBayer16(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      expectOnlyPaletteColors(result, palette);
    });

    it('should create a repeating 16×16 pattern', () => {
      const input = createTestImageData(64, 64, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runBayer16(ctx);
      
      const getPixel = (x: number, y: number) => {
        const idx = (y * 64 + x) * 4;
        return resultData[idx];
      };

      // Pattern should repeat every 16 pixels
      expect(getPixel(0, 0)).toBe(getPixel(16, 0));
      expect(getPixel(0, 0)).toBe(getPixel(0, 16));
    });
  });

  describe('Bayer 32×32', () => {
    it('should produce only palette colors', () => {
      const input = createTestImageData(64, 64, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runBayer32(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      expectOnlyPaletteColors(result, palette);
    });

    it('should create a repeating 32×32 pattern', () => {
      const input = createTestImageData(128, 128, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runBayer32(ctx);
      
      const getPixel = (x: number, y: number) => {
        const idx = (y * 128 + x) * 4;
        return resultData[idx];
      };

      // Pattern should repeat every 32 pixels
      expect(getPixel(0, 0)).toBe(getPixel(32, 0));
      expect(getPixel(0, 0)).toBe(getPixel(0, 32));
    });

    it('should handle gradients smoothly', () => {
      const input = createGradientImageData(128, 128);
      const ctx = createContext(input, { palette });
      const resultData = runBayer32(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      
      // Should produce valid output
      expectOnlyPaletteColors(result, palette);
    });
  });

  describe('Performance Comparison', () => {
    it('should complete all Bayer algorithms in reasonable time', () => {
      const input = createTestImageData(128, 128);
      const algorithms = [
        { name: 'Bayer 2×2', fn: runBayer2 },
        { name: 'Bayer 4×4', fn: runBayer4 },
        { name: 'Bayer 8×8', fn: runBayer8 },
        { name: 'Bayer 16×16', fn: runBayer16 },
        { name: 'Bayer 32×32', fn: runBayer32 },
      ];

      algorithms.forEach(algo => {
        const ctx = createContext(input, { palette });
        const start = performance.now();
        algo.fn(ctx);
        const time = performance.now() - start;
        
        // All Bayer algorithms should be very fast
        expect(time, `${algo.name} took ${time.toFixed(2)}ms`).toBeLessThan(200);
      });
    });
  });

  describe('Pattern Quality', () => {
    it('should show progressive refinement with larger matrix sizes', () => {
      // Use gradient to better show differences between matrix sizes
      const input = createGradientImageData(64, 64);
      
      const results = [
        runBayer2(createContext(input, { palette })),
        runBayer4(createContext(input, { palette })),
        runBayer8(createContext(input, { palette })),
        runBayer16(createContext(input, { palette })),
        runBayer32(createContext(input, { palette })),
      ];

      // At least some pairs should produce different results
      // (some may be identical for uniform input)
      let foundDifference = false;
      for (let i = 0; i < results.length; i++) {
        for (let j = i + 1; j < results.length; j++) {
          for (let k = 0; k < results[i].length; k++) {
            if (results[i][k] !== results[j][k]) {
              foundDifference = true;
              break;
            }
          }
          if (foundDifference) break;
        }
        if (foundDifference) break;
      }
      
      // With gradient input, different matrix sizes should produce different patterns
      expect(foundDifference).toBe(true);
    });
  });
});




