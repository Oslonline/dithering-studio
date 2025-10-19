/**
 * Testing utilities specifically for dithering algorithms
 */

import { expect } from 'vitest';
import { createTestImageData, testPalettes } from './fixtures';
import type { DitheringAlgorithm } from '../types/dither';

/**
 * Performance measurement result
 */
export interface PerformanceResult {
  algorithm: string;
  imageSize: string;
  executionTime: number;
  pixelsPerSecond: number;
}

/**
 * Measures algorithm performance
 */
export function measureAlgorithmPerformance(
  algorithm: DitheringAlgorithm,
  imageData: ImageData,
  palette: [number, number, number][],
  iterations: number = 3
): PerformanceResult {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    algorithm(imageData, palette);
    const end = performance.now();
    times.push(end - start);
  }
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
  const pixelCount = imageData.width * imageData.height;
  const pixelsPerSecond = (pixelCount / avgTime) * 1000;
  
  return {
    algorithm: algorithm.name || 'unknown',
    imageSize: `${imageData.width}×${imageData.height}`,
    executionTime: avgTime,
    pixelsPerSecond
  };
}

/**
 * Verifies that algorithm output only contains palette colors
 */
export function expectOnlyPaletteColors(
  result: ImageData,
  palette: [number, number, number][]
): void {
  const paletteSet = new Set(palette.map(c => `${c[0]},${c[1]},${c[2]}`));
  
  for (let i = 0; i < result.data.length; i += 4) {
    const r = result.data[i];
    const g = result.data[i + 1];
    const b = result.data[i + 2];
    const color = `${r},${g},${b}`;
    
    expect(
      paletteSet.has(color),
      `Found non-palette color at pixel ${i / 4}: RGB(${r}, ${g}, ${b})`
    ).toBe(true);
  }
}

/**
 * Verifies that algorithm modified the input
 */
export function expectImageModified(
  original: ImageData,
  result: ImageData
): void {
  expect(result.width).toBe(original.width);
  expect(result.height).toBe(original.height);
  
  // Check that at least some pixels changed
  let changedPixels = 0;
  for (let i = 0; i < original.data.length; i++) {
    if (original.data[i] !== result.data[i]) {
      changedPixels++;
    }
  }
  
  expect(changedPixels).toBeGreaterThan(0);
}

/**
 * Compares two ImageData objects pixel by pixel
 */
export function compareImageData(
  img1: ImageData,
  img2: ImageData,
  tolerance: number = 0
): boolean {
  if (img1.width !== img2.width || img1.height !== img2.height) {
    return false;
  }
  
  for (let i = 0; i < img1.data.length; i++) {
    if (Math.abs(img1.data[i] - img2.data[i]) > tolerance) {
      return false;
    }
  }
  
  return true;
}

/**
 * Calculates histogram of pixel values (grayscale)
 */
export function calculateHistogram(imageData: ImageData): number[] {
  const histogram = new Array(256).fill(0);
  
  for (let i = 0; i < imageData.data.length; i += 4) {
    // Convert to grayscale
    const gray = Math.floor(
      0.299 * imageData.data[i] +
      0.587 * imageData.data[i + 1] +
      0.114 * imageData.data[i + 2]
    );
    histogram[gray]++;
  }
  
  return histogram;
}

/**
 * Verifies deterministic behavior (same input = same output)
 */
export function expectDeterministicOutput(
  algorithm: DitheringAlgorithm,
  imageData: ImageData,
  palette: [number, number, number][]
): void {
  const result1 = algorithm(
    new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    ),
    palette
  );
  
  const result2 = algorithm(
    new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    ),
    palette
  );
  
  expect(compareImageData(result1, result2)).toBe(true);
}

/**
 * Creates a snapshot key for algorithm output
 */
export function createSnapshotKey(
  algorithmName: string,
  imageSize: { width: number; height: number },
  paletteName: string
): string {
  return `${algorithmName}_${imageSize.width}x${imageSize.height}_${paletteName}`;
}

/**
 * Converts ImageData to a comparable array for snapshots
 */
export function imageDataToArray(imageData: ImageData): number[] {
  return Array.from(imageData.data);
}

/**
 * Test that algorithm handles edge cases
 */
export function testAlgorithmEdgeCases(
  algorithm: DitheringAlgorithm,
  algorithmName: string
): void {
  // Test with 1x1 image
  const tiny = createTestImageData(1, 1, [128, 128, 128, 255]);
  expect(() => algorithm(tiny, testPalettes.blackAndWhite as any)).not.toThrow();
  
  // Test with minimal palette (2 colors)
  const small = createTestImageData(4, 4, [128, 128, 128, 255]);
  expect(() => algorithm(small, testPalettes.blackAndWhite as any)).not.toThrow();
  
  // Test with all-black image
  const black = createTestImageData(8, 8, [0, 0, 0, 255]);
  const blackResult = algorithm(black, testPalettes.blackAndWhite as any);
  expectOnlyPaletteColors(blackResult, testPalettes.blackAndWhite as any);
  
  // Test with all-white image
  const white = createTestImageData(8, 8, [255, 255, 255, 255]);
  const whiteResult = algorithm(white, testPalettes.blackAndWhite as any);
  expectOnlyPaletteColors(whiteResult, testPalettes.blackAndWhite as any);
}

/**
 * Benchmark suite for all algorithms
 */
export interface BenchmarkSuite {
  algorithms: Array<{
    name: string;
    fn: DitheringAlgorithm;
  }>;
  imageSizes: Array<{ width: number; height: number; label: string }>;
  palettes: Array<{
    name: string;
    colors: [number, number, number][];
  }>;
}

export function runBenchmarkSuite(suite: BenchmarkSuite): PerformanceResult[] {
  const results: PerformanceResult[] = [];
  
  for (const algo of suite.algorithms) {
    for (const size of suite.imageSizes) {
      for (const palette of suite.palettes) {
        const imageData = createTestImageData(size.width, size.height);
        const result = measureAlgorithmPerformance(
          algo.fn,
          imageData,
          palette.colors
        );
        
        result.algorithm = `${algo.name} (${palette.name})`;
        result.imageSize = size.label;
        results.push(result);
      }
    }
  }
  
  return results;
}

/**
 * Assert that execution time is within reasonable bounds
 */
export function expectReasonablePerformance(
  result: PerformanceResult,
  maxTimeMs: number
): void {
  expect(
    result.executionTime,
    `${result.algorithm} took ${result.executionTime.toFixed(2)}ms, expected < ${maxTimeMs}ms`
  ).toBeLessThan(maxTimeMs);
}
