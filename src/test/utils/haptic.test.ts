import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isHapticSupported, triggerHaptic, cancelHaptic } from '../../utils/haptic';

describe('Haptic Utilities', () => {
  let vibrateMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock navigator.vibrate
    vibrateMock = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      writable: true,
      configurable: true,
      value: vibrateMock,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isHapticSupported', () => {
    it('should return true when vibrate API is available', () => {
      expect(isHapticSupported()).toBe(true);
    });

    it('should return false when vibrate API is not available', () => {
      // @ts-expect-error - Testing undefined scenario
      delete navigator.vibrate;
      expect(isHapticSupported()).toBe(false);
    });
  });

  describe('triggerHaptic', () => {
    it('should trigger light haptic with default parameter', () => {
      const result = triggerHaptic();
      
      expect(vibrateMock).toHaveBeenCalledWith(10);
      expect(result).toBe(true);
    });

    it('should trigger light haptic', () => {
      triggerHaptic('light');
      expect(vibrateMock).toHaveBeenCalledWith(10);
    });

    it('should trigger medium haptic', () => {
      triggerHaptic('medium');
      expect(vibrateMock).toHaveBeenCalledWith(20);
    });

    it('should trigger heavy haptic', () => {
      triggerHaptic('heavy');
      expect(vibrateMock).toHaveBeenCalledWith(30);
    });

    it('should trigger success haptic pattern', () => {
      triggerHaptic('success');
      expect(vibrateMock).toHaveBeenCalledWith([10, 50, 10]);
    });

    it('should trigger warning haptic pattern', () => {
      triggerHaptic('warning');
      expect(vibrateMock).toHaveBeenCalledWith([20, 100, 20]);
    });

    it('should trigger error haptic pattern', () => {
      triggerHaptic('error');
      expect(vibrateMock).toHaveBeenCalledWith([30, 100, 30, 100, 30]);
    });

    it('should return false when vibrate API is not available', () => {
      // @ts-expect-error - Testing undefined scenario
      delete navigator.vibrate;
      const result = triggerHaptic('light');
      
      expect(result).toBe(false);
    });

    it('should handle vibrate API errors gracefully', () => {
      vibrateMock.mockImplementation(() => {
        throw new Error('Vibration failed');
      });
      
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const result = triggerHaptic('light');
      
      expect(result).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      consoleWarnSpy.mockRestore();
    });
  });

  describe('cancelHaptic', () => {
    it('should cancel ongoing vibration', () => {
      cancelHaptic();
      expect(vibrateMock).toHaveBeenCalledWith(0);
    });

    it('should not throw when vibrate API is not available', () => {
      // @ts-expect-error - Testing undefined scenario
      delete navigator.vibrate;
      
      expect(() => cancelHaptic()).not.toThrow();
    });
  });

  describe('haptic patterns', () => {
    it('should have correct pattern durations', () => {
      // Light, medium, heavy should be single values
      triggerHaptic('light');
      expect(vibrateMock).toHaveBeenCalledWith(expect.any(Number));
      
      vibrateMock.mockClear();
      triggerHaptic('medium');
      expect(vibrateMock).toHaveBeenCalledWith(expect.any(Number));
      
      vibrateMock.mockClear();
      triggerHaptic('heavy');
      expect(vibrateMock).toHaveBeenCalledWith(expect.any(Number));
    });

    it('should have correct pattern arrays for success/warning/error', () => {
      triggerHaptic('success');
      expect(vibrateMock).toHaveBeenCalledWith(expect.any(Array));
      
      vibrateMock.mockClear();
      triggerHaptic('warning');
      expect(vibrateMock).toHaveBeenCalledWith(expect.any(Array));
      
      vibrateMock.mockClear();
      triggerHaptic('error');
      expect(vibrateMock).toHaveBeenCalledWith(expect.any(Array));
    });
  });
});



