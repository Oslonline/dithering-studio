import { describe, it, expect } from 'vitest';
import { mulberry32, hashStringToSeed } from '../../utils/prng';

describe('PRNG Utilities', () => {
  describe('mulberry32', () => {
    it('should generate deterministic random numbers', () => {
      const rng1 = mulberry32(12345);
      const rng2 = mulberry32(12345);
      
      const values1 = [rng1(), rng1(), rng1()];
      const values2 = [rng2(), rng2(), rng2()];
      
      expect(values1).toEqual(values2);
    });

    it('should generate numbers between 0 and 1', () => {
      const rng = mulberry32(54321);
      
      for (let i = 0; i < 100; i++) {
        const value = rng();
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThan(1);
      }
    });

    it('should generate different sequences for different seeds', () => {
      const rng1 = mulberry32(111);
      const rng2 = mulberry32(222);
      
      const values1 = [rng1(), rng1(), rng1()];
      const values2 = [rng2(), rng2(), rng2()];
      
      expect(values1).not.toEqual(values2);
    });

    it('should have good distribution', () => {
      const rng = mulberry32(99999);
      const buckets = new Array(10).fill(0);
      
      for (let i = 0; i < 10000; i++) {
        const value = rng();
        const bucket = Math.floor(value * 10);
        buckets[bucket]++;
      }
      
      // Each bucket should have roughly 1000 values (10% of 10000)
      // Allow 20% deviation (800-1200)
      buckets.forEach(count => {
        expect(count).toBeGreaterThan(800);
        expect(count).toBeLessThan(1200);
      });
    });

    it('should handle seed 0', () => {
      const rng = mulberry32(0);
      const value = rng();
      
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    });

    it('should handle maximum seed value', () => {
      const rng = mulberry32(0xFFFFFFFF);
      const value = rng();
      
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    });
  });

  describe('hashStringToSeed', () => {
    it('should generate consistent seeds for same string', () => {
      const seed1 = hashStringToSeed('test');
      const seed2 = hashStringToSeed('test');
      
      expect(seed1).toBe(seed2);
    });

    it('should generate different seeds for different strings', () => {
      const seed1 = hashStringToSeed('hello');
      const seed2 = hashStringToSeed('world');
      
      expect(seed1).not.toBe(seed2);
    });

    it('should handle empty string', () => {
      const seed = hashStringToSeed('');
      
      expect(typeof seed).toBe('number');
      expect(seed).toBeGreaterThanOrEqual(0);
    });

    it('should handle special characters', () => {
      const seed = hashStringToSeed('!@#$%^&*()_+-={}[]|\\:";\'<>?,./');
      
      expect(typeof seed).toBe('number');
      expect(seed).toBeGreaterThanOrEqual(0);
    });

    it('should handle unicode characters', () => {
      const seed = hashStringToSeed('🎨🎭🎪🎬');
      
      expect(typeof seed).toBe('number');
      expect(seed).toBeGreaterThanOrEqual(0);
    });

    it('should be case-sensitive', () => {
      const seed1 = hashStringToSeed('Test');
      const seed2 = hashStringToSeed('test');
      
      expect(seed1).not.toBe(seed2);
    });

    it('should work with PRNG for reproducible randomness', () => {
      const str = 'my-random-seed';
      const seed = hashStringToSeed(str);
      const rng1 = mulberry32(seed);
      const rng2 = mulberry32(seed);
      
      expect(rng1()).toBe(rng2());
    });
  });
});



