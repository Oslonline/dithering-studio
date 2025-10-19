import { describe, it, expect } from 'vitest';
import { runBlueNoise } from './orderedAndOther';
import type { AlgorithmRunContext } from './types';
import {
  createTestImageData,
  createGradientImageData,
  testPalettes,
} from '../../test/fixtures';
import {
  expectOnlyPaletteColors,
  expectImageModified,
} from '../../test/algorithmTestUtils';

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

describe('Blue Noise Dithering', () => {
  const palette = testPalettes.blackAndWhite as [number, number, number][];

  describe('Basic Functionality', () => {
    it('should produce only palette colors', () => {
      const input = createTestImageData(64, 64, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runBlueNoise(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      expectOnlyPaletteColors(result, palette);
    });

    it('should modify the image', () => {
      const input = createTestImageData(64, 64, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runBlueNoise(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      expectImageModified(input, result);
    });

    it('should handle edge cases', () => {
      // All black
      const black = createTestImageData(64, 64, [0, 0, 0, 255]);
      expect(() => runBlueNoise(createContext(black, { palette }))).not.toThrow();
      
      // All white
      const white = createTestImageData(64, 64, [255, 255, 255, 255]);
      expect(() => runBlueNoise(createContext(white, { palette }))).not.toThrow();
      
      // Tiny image
      const tiny = createTestImageData(4, 4, [128, 128, 128, 255]);
      expect(() => runBlueNoise(createContext(tiny, { palette }))).not.toThrow();
    });

    it('should work with larger palettes', () => {
      const input = createGradientImageData(64, 64);
      const ctx = createContext(input, { palette: testPalettes.grayscale4 as any });
      const resultData = runBlueNoise(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      expectOnlyPaletteColors(result, testPalettes.grayscale4 as any);
    });
  });

  describe('Noise Characteristics', () => {
    it('should tile seamlessly (64×64 repeating pattern)', () => {
      const input = createTestImageData(128, 128, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runBlueNoise(ctx);
      
      // Blue noise pattern should repeat every 64 pixels
      const getPixel = (x: number, y: number) => {
        const idx = (y * 128 + x) * 4;
        return resultData[idx];
      };

      // Check tiling (pattern repeats every 64 pixels)
      expect(getPixel(0, 0)).toBe(getPixel(64, 0));
      expect(getPixel(0, 0)).toBe(getPixel(0, 64));
      expect(getPixel(32, 32)).toBe(getPixel(96, 32));
    });

    it('should produce different results than Bayer', () => {
      const input = createTestImageData(64, 64, [128, 128, 128, 255]);
      
      const blueNoiseResult = runBlueNoise(createContext(input, { palette }));
      
      // Import Bayer for comparison
      const { runBayer8 } = require('./bayer');
      const bayerResult = runBayer8(createContext(input, { palette }));
      
      // Blue noise and Bayer should produce different patterns
      let different = false;
      for (let i = 0; i < blueNoiseResult.length; i++) {
        if (blueNoiseResult[i] !== bayerResult[i]) {
          different = true;
          break;
        }
      }
      expect(different).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should complete in reasonable time', () => {
      const input = createTestImageData(256, 256);
      const ctx = createContext(input, { palette });
      
      const start = performance.now();
      runBlueNoise(ctx);
      const time = performance.now() - start;
      
      expect(time).toBeLessThan(300); // 300ms max for 256×256
    });

    it('should handle large images efficiently', () => {
      const input = createTestImageData(512, 512);
      const ctx = createContext(input, { palette });
      
      const start = performance.now();
      runBlueNoise(ctx);
      const time = performance.now() - start;
      
      expect(time).toBeLessThan(1000); // 1s max for 512×512
    });
  });

  describe('Threshold Parameter', () => {
    it('should handle different thresholds', () => {
      const input = createTestImageData(64, 64, [128, 128, 128, 255]);
      const ctx1 = createContext(input, { palette, threshold: 64 });
      const ctx2 = createContext(input, { palette, threshold: 192 });
      
      const result1 = runBlueNoise(ctx1);
      const result2 = runBlueNoise(ctx2);
      
      // Different thresholds should affect the distribution
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

  describe('Gradient Handling', () => {
    it('should smoothly handle gradients', () => {
      const input = createGradientImageData(128, 128);
      const ctx = createContext(input, { palette });
      const resultData = runBlueNoise(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      
      // Should produce valid output
      expectOnlyPaletteColors(result, palette);
      expectImageModified(input, result);
    });
  });
});
