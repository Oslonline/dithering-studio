import { describe, it, expect, beforeEach } from 'vitest';
import {
  estimatePNGSize,
  estimateJPEGSize,
  estimateWebPSize,
  estimateSVGSize,
  estimateVideoSize,
  formatBytes,
  getAllFormatSizes,
} from '../../utils/fileSizeEstimator';

describe('File Size Estimator', () => {
  let mockCanvas: HTMLCanvasElement;

  beforeEach(() => {
    // Create mock canvas
    mockCanvas = document.createElement('canvas');
  });

  describe('estimatePNGSize', () => {
    it('should estimate size for small canvas', () => {
      mockCanvas.width = 100;
      mockCanvas.height = 100;
      
      const size = estimatePNGSize(mockCanvas);
      
      expect(size).toBeGreaterThan(0);
      expect(size).toBeLessThan(100000); // Should be reasonable
    });

    it('should estimate larger size for bigger canvas', () => {
      mockCanvas.width = 100;
      mockCanvas.height = 100;
      const smallSize = estimatePNGSize(mockCanvas);
      
      mockCanvas.width = 500;
      mockCanvas.height = 500;
      const largeSize = estimatePNGSize(mockCanvas);
      
      expect(largeSize).toBeGreaterThan(smallSize);
    });

    it('should return reasonable size for typical image', () => {
      mockCanvas.width = 800;
      mockCanvas.height = 600;
      
      const size = estimatePNGSize(mockCanvas);
      
      // 800x600 = 480,000 pixels
      // Roughly 1-2MB for PNG
      expect(size).toBeGreaterThan(500000);
      expect(size).toBeLessThan(3000000);
    });
  });

  describe('estimateJPEGSize', () => {
    it('should estimate size for default quality', () => {
      mockCanvas.width = 100;
      mockCanvas.height = 100;
      
      const size = estimateJPEGSize(mockCanvas);
      
      expect(size).toBeGreaterThan(0);
    });

    it('should estimate different sizes for different quality', () => {
      mockCanvas.width = 500;
      mockCanvas.height = 500;
      
      const highQuality = estimateJPEGSize(mockCanvas, 0.95);
      const lowQuality = estimateJPEGSize(mockCanvas, 0.5);
      
      // Both should produce valid estimates
      expect(highQuality).toBeGreaterThan(0);
      expect(lowQuality).toBeGreaterThan(0);
    });

    it('should be smaller than PNG for same canvas', () => {
      mockCanvas.width = 800;
      mockCanvas.height = 600;
      
      const pngSize = estimatePNGSize(mockCanvas);
      const jpegSize = estimateJPEGSize(mockCanvas);
      
      expect(jpegSize).toBeLessThan(pngSize);
    });
  });

  describe('estimateWebPSize', () => {
    it('should estimate size', () => {
      mockCanvas.width = 100;
      mockCanvas.height = 100;
      
      const size = estimateWebPSize(mockCanvas);
      
      expect(size).toBeGreaterThan(0);
    });

    it('should be smaller than PNG', () => {
      mockCanvas.width = 500;
      mockCanvas.height = 500;
      
      const pngSize = estimatePNGSize(mockCanvas);
      const webpSize = estimateWebPSize(mockCanvas);
      
      expect(webpSize).toBeLessThan(pngSize);
    });

    it('should be roughly 70% of PNG size', () => {
      mockCanvas.width = 800;
      mockCanvas.height = 600;
      
      const pngSize = estimatePNGSize(mockCanvas);
      const webpSize = estimateWebPSize(mockCanvas);
      
      const ratio = webpSize / pngSize;
      expect(ratio).toBeGreaterThan(0.65);
      expect(ratio).toBeLessThan(0.75);
    });
  });

  describe('estimateSVGSize', () => {
    it('should estimate size', () => {
      mockCanvas.width = 100;
      mockCanvas.height = 100;
      
      const size = estimateSVGSize(mockCanvas);
      
      expect(size).toBeGreaterThan(0);
    });

    it('should be large for complex images', () => {
      mockCanvas.width = 800;
      mockCanvas.height = 600;
      
      const size = estimateSVGSize(mockCanvas);
      
      // SVG can be huge for dithered images
      expect(size).toBeGreaterThan(1000000); // > 1MB
    });

    it('should scale with canvas size', () => {
      mockCanvas.width = 100;
      mockCanvas.height = 100;
      const smallSize = estimateSVGSize(mockCanvas);
      
      mockCanvas.width = 500;
      mockCanvas.height = 500;
      const largeSize = estimateSVGSize(mockCanvas);
      
      expect(largeSize).toBeGreaterThan(smallSize);
    });
  });

  describe('estimateVideoSize', () => {
    it('should estimate size for MP4', () => {
      const size = estimateVideoSize(1920, 1080, 10, 'mp4');
      
      expect(size).toBeGreaterThan(0);
    });

    it('should estimate size for WebM', () => {
      const size = estimateVideoSize(1920, 1080, 10, 'webm');
      
      expect(size).toBeGreaterThan(0);
    });

    it('should scale with duration', () => {
      const size5s = estimateVideoSize(1920, 1080, 5, 'webm');
      const size10s = estimateVideoSize(1920, 1080, 10, 'webm');
      
      expect(size10s).toBeGreaterThan(size5s);
      expect(size10s).toBeCloseTo(size5s * 2, -3); // Roughly double
    });

    it('should scale with resolution', () => {
      const size720p = estimateVideoSize(1280, 720, 10, 'webm');
      const size1080p = estimateVideoSize(1920, 1080, 10, 'webm');
      
      expect(size1080p).toBeGreaterThan(size720p);
    });

    it('should estimate WebM smaller than MP4', () => {
      const mp4Size = estimateVideoSize(1920, 1080, 10, 'mp4');
      const webmSize = estimateVideoSize(1920, 1080, 10, 'webm');
      
      expect(webmSize).toBeLessThan(mp4Size);
    });

    it('should use webm as default format', () => {
      const defaultSize = estimateVideoSize(1920, 1080, 10);
      const webmSize = estimateVideoSize(1920, 1080, 10, 'webm');
      
      expect(defaultSize).toBe(webmSize);
    });
  });

  describe('formatBytes', () => {
    it('should format bytes', () => {
      expect(formatBytes(0)).toBe('0 B');
      expect(formatBytes(500)).toBe('500.0 B');
      expect(formatBytes(1024)).toBe('1.0 KB');
    });

    it('should format kilobytes', () => {
      expect(formatBytes(1024)).toBe('1.0 KB');
      expect(formatBytes(2048)).toBe('2.0 KB');
      expect(formatBytes(1536)).toBe('1.5 KB');
    });

    it('should format megabytes', () => {
      expect(formatBytes(1024 * 1024)).toBe('1.0 MB');
      expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
      expect(formatBytes(1.5 * 1024 * 1024)).toBe('1.5 MB');
    });

    it('should format gigabytes', () => {
      expect(formatBytes(1024 * 1024 * 1024)).toBe('1.0 GB');
      expect(formatBytes(2.5 * 1024 * 1024 * 1024)).toBe('2.5 GB');
    });

    it('should respect decimal places', () => {
      expect(formatBytes(1536, 0)).toBe('2 KB');
      expect(formatBytes(1536, 2)).toBe('1.50 KB');
      expect(formatBytes(1536, 3)).toBe('1.500 KB');
    });

    it('should handle small decimals correctly', () => {
      expect(formatBytes(1100, 2)).toBe('1.07 KB');
      expect(formatBytes(1500000, 2)).toBe('1.43 MB');
    });
  });

  describe('getAllFormatSizes', () => {
    it('should return null for all formats when canvas is null', () => {
      const sizes = getAllFormatSizes(null);
      
      expect(sizes.png).toBeNull();
      expect(sizes.jpeg).toBeNull();
      expect(sizes.webp).toBeNull();
      expect(sizes.svg).toBeNull();
    });

    it('should return sizes for all formats', () => {
      mockCanvas.width = 800;
      mockCanvas.height = 600;
      
      const sizes = getAllFormatSizes(mockCanvas);
      
      expect(sizes.png).toBeGreaterThan(0);
      expect(sizes.jpeg).toBeGreaterThan(0);
      expect(sizes.webp).toBeGreaterThan(0);
      expect(sizes.svg).toBeGreaterThan(0);
    });

    it('should have correct size ordering (typically JPEG < WebP < PNG < SVG)', () => {
      mockCanvas.width = 800;
      mockCanvas.height = 600;
      
      const sizes = getAllFormatSizes(mockCanvas);
      
      expect(sizes.jpeg!).toBeLessThan(sizes.png!);
      expect(sizes.webp!).toBeLessThan(sizes.png!);
      // SVG is often huge for dithered images
      expect(sizes.svg!).toBeGreaterThan(sizes.png!);
    });
  });
});



