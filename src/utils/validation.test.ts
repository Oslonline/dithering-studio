import { describe, it, expect } from 'vitest';
import { validateImage, validateVideo, validateResolution, validateThreshold, validatePalette } from '../utils/validation';
import { createMockFile, createMockVideoFile } from '../test/fixtures';

describe('validation utilities', () => {
  describe('validateImage', () => {
    it('should accept valid image files', async () => {
      const file = createMockFile('test.png', 1024, 'image/png');
      const result = await validateImage(file);
      
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should reject non-image files', async () => {
      const file = createMockFile('test.txt', 1024, 'text/plain');
      const result = await validateImage(file);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported image format');
    });

    it('should reject oversized files', async () => {
      const file = createMockFile('huge.png', 51 * 1024 * 1024, 'image/png');
      const result = await validateImage(file);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Image file too large');
    });

    it('should accept files within size limit', async () => {
      const file = createMockFile('small.png', 1024 * 1024, 'image/png');
      const result = await validateImage(file);
      
      expect(result.valid).toBe(true);
    });

    it('should respect custom size limits', async () => {
      const file = createMockFile('medium.png', 5 * 1024 * 1024, 'image/png');
      const result = await validateImage(file, { maxFileSize: 1024 * 1024 });
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Image file too large');
    });
  });

  describe('validateVideo', () => {
    // Skip video metadata tests as they require real video elements
    it.skip('should accept valid video files', async () => {
      const file = createMockVideoFile('test.mp4', 1024 * 1024, 'video/mp4');
      const result = await validateVideo(file);
      
      expect(result.valid).toBe(true);
    });

    it('should reject non-video files', async () => {
      const file = createMockFile('test.txt', 1024, 'text/plain');
      const result = await validateVideo(file);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Unsupported video format');
    });

    it('should reject oversized video files', async () => {
      const file = createMockVideoFile('huge.mp4', 101 * 1024 * 1024, 'video/mp4');
      const result = await validateVideo(file);
      
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Video file too large');
    });

    it.skip('should accept files within video size limit', async () => {
      const file = createMockVideoFile('medium.mp4', 50 * 1024 * 1024, 'video/mp4');
      const result = await validateVideo(file);
      
      expect(result.valid).toBe(true);
    });
  });

  describe('validateResolution', () => {
    it('should accept valid resolutions', () => {
      expect(validateResolution(100).valid).toBe(true);
      expect(validateResolution(1920).valid).toBe(true);
      expect(validateResolution(4096).valid).toBe(true);
    });

    it('should reject resolutions below minimum', () => {
      const result = validateResolution(0);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Resolution must be at least');
    });

    it('should reject resolutions above maximum', () => {
      const result = validateResolution(20000);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Resolution cannot exceed');
    });

    it('should accept edge case values', () => {
      expect(validateResolution(16).valid).toBe(true);
      expect(validateResolution(8192).valid).toBe(true);
    });
  });

  describe('validateThreshold', () => {
    it('should accept valid thresholds', () => {
      expect(validateThreshold(0).valid).toBe(true);
      expect(validateThreshold(128).valid).toBe(true);
      expect(validateThreshold(255).valid).toBe(true);
    });

    it('should reject negative thresholds', () => {
      const result = validateThreshold(-1);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be between 0 and 255');
    });

    it('should reject thresholds above 255', () => {
      const result = validateThreshold(256);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('must be between 0 and 255');
    });
  });

  describe('validatePalette', () => {
    it('should accept valid palettes', () => {
      const palette: [number, number, number][] = [
        [0, 0, 0],
        [255, 255, 255]
      ];
      expect(validatePalette(palette).valid).toBe(true);
    });

    it('should reject empty palettes', () => {
      const result = validatePalette([]);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 2 colors');
    });

    it('should reject palettes with only one color', () => {
      const palette: [number, number, number][] = [[128, 128, 128]];
      const result = validatePalette(palette);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('at least 2 colors');
    });

    it('should accept large palettes', () => {
      const palette: [number, number, number][] = Array.from({ length: 256 }, (_, i) => [i, i, i] as [number, number, number]);
      expect(validatePalette(palette).valid).toBe(true);
    });
  });
});
