import { describe, it, expect } from 'vitest';
import { runAsciiMosaic, DEFAULT_ASCII_RAMP, orderRampDarkToLight } from '../../../utils/algorithms/asciiMosaic';
import type { AlgorithmRunContext } from '../../../utils/algorithms/types';
import {
  createTestImageData,
  createGradientImageData,
} from '../../fixtures';

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
      pattern: 8, // Character size
      threshold: 128,
      invert: false,
      serpentine: false,
      isErrorDiffusion: false,
      palette: [],
      asciiRamp: DEFAULT_ASCII_RAMP,
      ...params,
    },
  };
}

describe('ASCII Mosaic Algorithm', () => {
  describe('Utility Functions', () => {
    it('should order ASCII ramp correctly', () => {
      const ramp = '@%#*+=-:. ';
      const ordered = orderRampDarkToLight(ramp);
      
      // Should be a string with same length
      expect(ordered.length).toBe(ramp.length);
      
      // Should contain same characters (potentially reordered)
      const originalChars = ramp.split('').sort().join('');
      const orderedChars = ordered.split('').sort().join('');
      expect(orderedChars).toBe(originalChars);
    });

    it('should handle custom ASCII ramps', () => {
      const customRamp = '█▓▒░ ';
      const ordered = orderRampDarkToLight(customRamp);
      expect(ordered.length).toBe(customRamp.length);
    });
  });

  describe('ASCII Mosaic Rendering', () => {
    it('should produce valid Uint8ClampedArray', () => {
      const input = createTestImageData(32, 32, [128, 128, 128, 255]);
      const ctx = createContext(input);
      const result = runAsciiMosaic(ctx);
      
      // Should return Uint8ClampedArray
      expect(result).toBeInstanceOf(Uint8ClampedArray);
      expect(result.length).toBe(input.width * input.height * 4);
    });

    it('should handle different character sizes', () => {
      const input = createTestImageData(32, 32, [128, 128, 128, 255]);
      
      const ctx1 = createContext(input, { pattern: 4 });
      const ctx2 = createContext(input, { pattern: 8 });
      
      const result1 = runAsciiMosaic(ctx1);
      const result2 = runAsciiMosaic(ctx2);
      
      // Both should produce valid output
      expect(result1).toBeInstanceOf(Uint8ClampedArray);
      expect(result2).toBeInstanceOf(Uint8ClampedArray);
      expect(result1.length).toBe(input.width * input.height * 4);
      expect(result2.length).toBe(input.width * input.height * 4);
    });

    it('should handle gradients', () => {
      const input = createGradientImageData(64, 64);
      const ctx = createContext(input);
      const result = runAsciiMosaic(ctx);
      
      expect(result).toBeInstanceOf(Uint8ClampedArray);
      expect(result.length).toBe(input.width * input.height * 4);
    });

    it('should handle custom ASCII ramps', () => {
      const input = createTestImageData(32, 32, [128, 128, 128, 255]);
      const customRamp = '█▓▒░ ';
      const ctx = createContext(input, { asciiRamp: customRamp });
      const result = runAsciiMosaic(ctx);
      
      expect(result).toBeInstanceOf(Uint8ClampedArray);
      expect(result.length).toBe(input.width * input.height * 4);
    });

    it('should handle black and white extremes', () => {
      // All black
      const black = createTestImageData(32, 32, [0, 0, 0, 255]);
      const blackResult = runAsciiMosaic(createContext(black));
      expect(blackResult).toBeInstanceOf(Uint8ClampedArray);
      
      // All white
      const white = createTestImageData(32, 32, [255, 255, 255, 255]);
      const whiteResult = runAsciiMosaic(createContext(white));
      expect(whiteResult).toBeInstanceOf(Uint8ClampedArray);
    });

    it('should handle small images', () => {
      const tiny = createTestImageData(8, 8, [128, 128, 128, 255]);
      const ctx = createContext(tiny, { pattern: 4 });
      const result = runAsciiMosaic(ctx);
      
      expect(result).toBeInstanceOf(Uint8ClampedArray);
      expect(result.length).toBe(tiny.width * tiny.height * 4);
    });

    it('should perform reasonably fast', () => {
      const input = createTestImageData(128, 128);
      const ctx = createContext(input);
      
      const start = performance.now();
      runAsciiMosaic(ctx);
      const time = performance.now() - start;
      
      // ASCII mosaic involves canvas rendering, so may be slower
      expect(time).toBeLessThan(1000); // 1 second max
    });

  });
});





