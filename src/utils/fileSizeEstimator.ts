/**
 * File size estimation utilities for various export formats
 * Provides rough size estimates before encoding/download
 */

/**
 * Estimate PNG file size from canvas
 * PNG size depends on complexity and compressibility
 */
export const estimatePNGSize = (canvas: HTMLCanvasElement): number => {
  const width = canvas.width;
  const height = canvas.height;
  const pixels = width * height;

  // Base estimation: 4 bytes per pixel (RGBA)
  const uncompressedSize = pixels * 4;

  // PNG compression ratio varies:
  // - High detail/dithered images: 40-60% compression
  // - Simple images: 80-95% compression
  // For dithered images, assume ~50% compression
  const estimatedSize = uncompressedSize * 0.5;

  // Add PNG overhead (headers, chunks, etc): ~5-10KB
  return Math.round(estimatedSize + 8192);
};

/**
 * Estimate JPEG file size from canvas
 * JPEG size depends on quality and complexity
 */
export const estimateJPEGSize = (canvas: HTMLCanvasElement, quality = 0.92): number => {
  const width = canvas.width;
  const height = canvas.height;
  const pixels = width * height;

  // JPEG compression is much better than PNG
  // Quality 0.92 (default): ~3-8% of uncompressed
  // Dithered images compress less well due to noise
  const baseSize = pixels * 4;
  const compressionRatio = 0.1 - (quality * 0.05); // Lower quality = smaller
  const estimatedSize = baseSize * compressionRatio;

  return Math.round(estimatedSize);
};

/**
 * Estimate WebP file size from canvas
 * WebP typically 25-35% smaller than PNG for dithered images
 */
export const estimateWebPSize = (canvas: HTMLCanvasElement): number => {
  const pngSize = estimatePNGSize(canvas);
  // WebP is typically 25-35% smaller than PNG
  return Math.round(pngSize * 0.7);
};

/**
 * Estimate SVG file size
 * SVG size depends heavily on number of unique colors and shapes
 */
export const estimateSVGSize = (canvas: HTMLCanvasElement): number => {
  const width = canvas.width;
  const height = canvas.height;
  const pixels = width * height;

  // SVG creates a rect for each unique color region
  // Dithered images have many small rects
  // Rough estimate: ~100 bytes per rect
  // Assume ~10% of pixels are rect definitions
  const estimatedRects = pixels * 0.1;
  const estimatedSize = estimatedRects * 100;

  // SVG can be HUGE for dithered images
  return Math.round(estimatedSize);
};

/**
 * Estimate video file size
 * Based on duration, resolution, and codec
 */
export const estimateVideoSize = (
  width: number,
  height: number,
  duration: number, // seconds
  format: 'mp4' | 'webm' = 'webm'
): number => {
  const pixels = width * height;

  // Bitrate estimates (bytes per second per megapixel)
  // These are rough estimates for dithered/simple content
  const bitrates = {
    mp4: 150000,  // ~150KB/s per MP (H.264)
    webm: 100000, // ~100KB/s per MP (VP9, better compression)
  };

  const megapixels = pixels / 1000000;
  const bytesPerSecond = bitrates[format] * megapixels;
  const totalSize = bytesPerSecond * duration;

  return Math.round(totalSize);
};

/**
 * Format bytes to human-readable string
 */
export const formatBytes = (bytes: number, decimals = 1): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  return `${value.toFixed(decimals)} ${sizes[i]}`;
};

/**
 * Get all format size estimates for a canvas
 */
export const getAllFormatSizes = (canvas: HTMLCanvasElement | null) => {
  if (!canvas) {
    return {
      png: null,
      jpeg: null,
      webp: null,
      svg: null,
    };
  }

  return {
    png: estimatePNGSize(canvas),
    jpeg: estimateJPEGSize(canvas),
    webp: estimateWebPSize(canvas),
    svg: estimateSVGSize(canvas),
  };
};
