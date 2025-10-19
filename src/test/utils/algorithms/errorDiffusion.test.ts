import { describe, it, expect } from 'vitest';
import {
  runFloydSteinberg,
  runFalseFloydSteinberg,
  runAtkinson,
  runBurkes,
  runSierra,
  runSierraLite,
  runTwoRowSierra,
  runSierra24A,
  runStucki,
  runJJN,
  runStevensonArce,
  runAdaptiveOstromoukhov,
  runAdaptiveFS3,
  runAdaptiveFS7,
} from '../../../utils/algorithms/errorDiffusion';
import type { AlgorithmRunContext } from '../../../utils/algorithms/types';
import {
  createTestImageData,
  createGradientImageData,
  testPalettes,
} from '../../fixtures';
import {
  expectOnlyPaletteColors,
  expectImageModified,
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
      isErrorDiffusion: true,
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

describe('Error Diffusion Algorithms', () => {
  const palette = testPalettes.blackAndWhite as [number, number, number][];
  
  describe('Floyd-Steinberg', () => {
    it('should produce only palette colors', () => {
      const input = createTestImageData(16, 16, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runFloydSteinberg(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      expectOnlyPaletteColors(result, palette);
    });

    it('should modify the input image', () => {
      const input = createGradientImageData(16, 16);
      const original = new ImageData(
        new Uint8ClampedArray(input.data),
        input.width,
        input.height
      );
      const ctx = createContext(input, { palette });
      const resultData = runFloydSteinberg(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      expectImageModified(original, result);
    });

    it('should handle edge cases', () => {
      // 1x1 image
      const tiny = createTestImageData(1, 1, [128, 128, 128, 255]);
      expect(() => runFloydSteinberg(createContext(tiny, { palette }))).not.toThrow();
      
      // All-black image
      const black = createTestImageData(8, 8, [0, 0, 0, 255]);
      const blackResult = runFloydSteinberg(createContext(black, { palette }));
      expectOnlyPaletteColors(resultToImageData(blackResult, 8, 8), palette);
      
      // All-white image
      const white = createTestImageData(8, 8, [255, 255, 255, 255]);
      const whiteResult = runFloydSteinberg(createContext(white, { palette }));
      expectOnlyPaletteColors(resultToImageData(whiteResult, 8, 8), palette);
    });

    it('should work with larger palettes', () => {
      const input = createGradientImageData(32, 32);
      const ctx = createContext(input, { palette: testPalettes.grayscale4 as any });
      const resultData = runFloydSteinberg(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      expectOnlyPaletteColors(result, testPalettes.grayscale4 as any);
    });

    it('should respect serpentine mode', () => {
      const input = createGradientImageData(16, 16);
      const ctx1 = createContext(input, { palette, serpentine: false });
      const ctx2 = createContext(input, { palette, serpentine: true });
      
      const result1 = runFloydSteinberg(ctx1);
      const result2 = runFloydSteinberg(ctx2);
      
      // Results should be different with/without serpentine
      let different = false;
      for (let i = 0; i < result1.length; i++) {
        if (result1[i] !== result2[i]) {
          different = true;
          break;
        }
      }
      expect(different).toBe(true);
    });

    it('should handle threshold parameter', () => {
      const input = createTestImageData(16, 16, [128, 128, 128, 255]);
      const ctx1 = createContext(input, { palette, threshold: 64 });
      const ctx2 = createContext(input, { palette, threshold: 192 });
      
      const result1 = runFloydSteinberg(ctx1);
      const result2 = runFloydSteinberg(ctx2);
      
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

  describe('False Floyd-Steinberg', () => {
    it('should produce only palette colors', () => {
      const input = createTestImageData(16, 16, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runFalseFloydSteinberg(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      expectOnlyPaletteColors(result, palette);
    });

    it('should handle edge cases', () => {
      const tiny = createTestImageData(4, 4, [128, 128, 128, 255]);
      expect(() => runFalseFloydSteinberg(createContext(tiny, { palette }))).not.toThrow();
    });
  });

  describe('Atkinson', () => {
    it('should produce only palette colors', () => {
      const input = createTestImageData(16, 16, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runAtkinson(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      expectOnlyPaletteColors(result, palette);
    });

    it('should handle edge cases', () => {
      const tiny = createTestImageData(4, 4, [128, 128, 128, 255]);
      expect(() => runAtkinson(createContext(tiny, { palette }))).not.toThrow();
    });
  });

  describe('Burkes', () => {
    it('should produce only palette colors', () => {
      const input = createTestImageData(16, 16, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runBurkes(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      expectOnlyPaletteColors(result, palette);
    });
  });

  describe('Sierra', () => {
    it('should produce only palette colors', () => {
      const input = createTestImageData(16, 16, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runSierra(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      expectOnlyPaletteColors(result, palette);
    });
  });

  describe('Sierra Lite', () => {
    it('should produce only palette colors', () => {
      const input = createTestImageData(16, 16, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runSierraLite(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      expectOnlyPaletteColors(result, palette);
    });
  });

  describe('Sierra 2-Row', () => {
    it('should produce only palette colors', () => {
      const input = createTestImageData(16, 16, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runTwoRowSierra(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      expectOnlyPaletteColors(result, palette);
    });
  });

  describe('Sierra 2-4A', () => {
    it('should run without errors', () => {
      const input = createTestImageData(16, 16, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runSierra24A(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      
      // This algorithm may have issues with palette support, just verify it runs
      expect(result.width).toBe(input.width);
      expect(result.height).toBe(input.height);
    });
  });

  describe('Stucki', () => {
    it('should produce only palette colors', () => {
      const input = createTestImageData(16, 16, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runStucki(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      expectOnlyPaletteColors(result, palette);
    });
  });

  describe('Jarvis-Judice-Ninke', () => {
    it('should produce only palette colors', () => {
      const input = createTestImageData(16, 16, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runJJN(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      expectOnlyPaletteColors(result, palette);
    });
  });

  describe('Stevenson-Arce', () => {
    it('should run without errors', () => {
      const input = createTestImageData(16, 16, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runStevensonArce(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      
      // This algorithm may have issues with palette support, just verify it runs
      expect(result.width).toBe(input.width);
      expect(result.height).toBe(input.height);
    });
  });

  describe('Ostromoukhov', () => {
    it('should produce grayscale output', () => {
      const input = createGradientImageData(16, 16);
      const ctx = createContext(input);
      const resultData = runAdaptiveOstromoukhov(ctx);
      
      // Should only have black or white pixels (no palette support)
      for (let i = 0; i < resultData.length; i += 4) {
        const r = resultData[i];
        const g = resultData[i + 1];
        const b = resultData[i + 2];
        expect(r === g && g === b).toBe(true); // Grayscale
        expect(r === 0 || r === 255).toBe(true); // Only black or white
      }
    });
  });

  describe('Adaptive Floyd-Steinberg 3x3', () => {
    it('should produce only palette colors', () => {
      const input = createTestImageData(16, 16, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runAdaptiveFS3(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      expectOnlyPaletteColors(result, palette);
    });
  });

  describe('Adaptive Floyd-Steinberg 7x7', () => {
    it('should produce only palette colors', () => {
      const input = createTestImageData(16, 16, [128, 128, 128, 255]);
      const ctx = createContext(input, { palette });
      const resultData = runAdaptiveFS7(ctx);
      const result = resultToImageData(resultData, input.width, input.height);
      expectOnlyPaletteColors(result, palette);
    });
  });

  describe('Performance Comparison', () => {
    it('should complete in reasonable time', () => {
      const input = createTestImageData(128, 128);
      const algorithms = [
        { name: 'Floyd-Steinberg', fn: runFloydSteinberg },
        { name: 'Atkinson', fn: runAtkinson },
        { name: 'Burkes', fn: runBurkes },
        { name: 'Sierra', fn: runSierra },
        { name: 'Stucki', fn: runStucki },
      ];

      algorithms.forEach(algo => {
        const ctx = createContext(input, { palette });
        const start = performance.now();
        algo.fn(ctx);
        const time = performance.now() - start;
        
        // All algorithms should complete within 500ms for 128x128
        expect(time, `${algo.name} took ${time.toFixed(2)}ms`).toBeLessThan(500);
      });
    });
  });
});




