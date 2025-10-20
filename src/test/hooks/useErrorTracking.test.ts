import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useErrorTracking } from '../../hooks/useErrorTracking';
import type { ErrorCategory } from '../../hooks/useErrorTracking';

describe('useErrorTracking', () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  
  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('Error categorization', () => {
    it('should categorize validation errors', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackError('Invalid input value');
      });

      const errors = result.current.getErrors();
      expect(errors[0].category).toBe('validation');
    });

    it('should categorize network errors', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackError('Network request timeout');
      });

      const errors = result.current.getErrors();
      expect(errors[0].category).toBe('network');
    });

    it('should categorize memory errors', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackError('Out of memory allocation failed');
      });

      const errors = result.current.getErrors();
      expect(errors[0].category).toBe('memory');
    });

    it('should categorize feature-unsupported errors', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackError('Feature not supported in this browser');
      });

      const errors = result.current.getErrors();
      expect(errors[0].category).toBe('feature-unsupported');
    });

    it('should categorize processing errors', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackError('Canvas processing failed');
      });

      const errors = result.current.getErrors();
      expect(errors[0].category).toBe('processing');
    });

    it('should categorize unknown errors', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackError('Some random error message');
      });

      const errors = result.current.getErrors();
      expect(errors[0].category).toBe('unknown');
    });
  });

  describe('Error tracking', () => {
    it('should track errors with Error objects', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackError(new Error('Test error'));
      });

      const errors = result.current.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Test error');
      expect(errors[0].stack).toBeDefined();
    });

    it('should track errors with string messages', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackError('String error message');
      });

      const errors = result.current.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('String error message');
      expect(errors[0].stack).toBeUndefined();
    });

    it('should include context in error logs', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackError('Test error', { userId: 123, action: 'upload' });
      });

      const errors = result.current.getErrors();
      expect(errors[0].context).toEqual({ userId: 123, action: 'upload' });
    });

    it('should generate unique IDs for errors', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackError('Error 1');
        result.current.trackError('Error 2');
      });

      const errors = result.current.getErrors();
      expect(errors[0].id).not.toBe(errors[1].id);
    });

    it('should include timestamps', () => {
      const { result } = renderHook(() => useErrorTracking());
      const beforeTimestamp = Date.now();

      act(() => {
        result.current.trackError('Test error');
      });

      const errors = result.current.getErrors();
      expect(errors[0].timestamp).toBeGreaterThanOrEqual(beforeTimestamp);
      expect(errors[0].timestamp).toBeLessThanOrEqual(Date.now());
    });

    it('should include user agent', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackError('Test error');
      });

      const errors = result.current.getErrors();
      expect(errors[0].userAgent).toBe(navigator.userAgent);
    });
  });

  describe('Specialized tracking methods', () => {
    it('should track validation errors', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackValidationError('email', 'invalid@', 'Invalid format');
      });

      const errors = result.current.getErrors();
      expect(errors[0].message).toContain('email');
      expect(errors[0].message).toContain('Invalid format');
      expect(errors[0].context).toEqual({
        field: 'email',
        value: 'invalid@',
        category: 'validation'
      });
    });

    it('should track processing errors', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackProcessingError('dithering', { algorithm: 'floyd-steinberg' });
      });

      const errors = result.current.getErrors();
      expect(errors[0].message).toContain('dithering');
      expect(errors[0].context).toMatchObject({
        operation: 'dithering',
        algorithm: 'floyd-steinberg',
        category: 'processing'
      });
    });

    it('should track feature unsupported errors', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackFeatureUnsupported('WebGL', 'canvas2d');
      });

      const errors = result.current.getErrors();
      expect(errors[0].message).toContain('WebGL');
      expect(errors[0].context).toEqual({
        feature: 'WebGL',
        fallback: 'canvas2d',
        category: 'feature-unsupported'
      });
    });
  });

  describe('Error retrieval', () => {
    it('should get all errors', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackError('Error 1');
        result.current.trackError('Error 2');
        result.current.trackError('Error 3');
      });

      const errors = result.current.getErrors();
      expect(errors).toHaveLength(3);
    });

    it('should get errors by category', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackError('Invalid input');
        result.current.trackError('Network timeout');
        result.current.trackError('Validation failed');
      });

      const validationErrors = result.current.getErrorsByCategory('validation');
      expect(validationErrors).toHaveLength(2);
      validationErrors.forEach(error => {
        expect(error.category).toBe('validation');
      });
    });

    it('should get recent errors with default count', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        for (let i = 0; i < 15; i++) {
          result.current.trackError(`Error ${i}`);
        }
      });

      const recentErrors = result.current.getRecentErrors();
      expect(recentErrors).toHaveLength(10);
      expect(recentErrors[9].message).toBe('Error 14');
    });

    it('should get recent errors with custom count', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.trackError(`Error ${i}`);
        }
      });

      const recentErrors = result.current.getRecentErrors(5);
      expect(recentErrors).toHaveLength(5);
      expect(recentErrors[4].message).toBe('Error 9');
    });
  });

  describe('Error statistics', () => {
    it('should get error statistics', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackError('Invalid input');
        result.current.trackError('Invalid input');
        result.current.trackError('Network timeout');
        result.current.trackError('Processing failed');
      });

      const stats = result.current.getErrorStats();
      expect(stats.total).toBe(4);
      expect(stats.byCategory.validation).toBe(2);
      expect(stats.byCategory.network).toBe(1);
      expect(stats.byCategory.processing).toBe(1);
      expect(stats.mostRecent.message).toBe('Processing failed');
      expect(stats.oldestTimestamp).toBeDefined();
    });

    it('should handle empty statistics', () => {
      const { result } = renderHook(() => useErrorTracking());

      const stats = result.current.getErrorStats();
      expect(stats.total).toBe(0);
      expect(stats.mostRecent).toBeUndefined();
      expect(stats.oldestTimestamp).toBeUndefined();
    });
  });

  describe('Error management', () => {
    it('should clear all errors', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackError('Error 1');
        result.current.trackError('Error 2');
      });

      expect(result.current.getErrors()).toHaveLength(2);

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.getErrors()).toHaveLength(0);
    });

    it('should respect maxErrors limit', () => {
      const { result } = renderHook(() => useErrorTracking({ maxErrors: 5 }));

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.trackError(`Error ${i}`);
        }
      });

      const errors = result.current.getErrors();
      expect(errors).toHaveLength(5);
      expect(errors[0].message).toBe('Error 5');
      expect(errors[4].message).toBe('Error 9');
    });

    it('should export errors as JSON', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackError('Test error');
      });

      const exported = result.current.exportErrors();
      const parsed = JSON.parse(exported);
      
      expect(parsed.exportedAt).toBeDefined();
      expect(parsed.errorCount).toBe(1);
      expect(parsed.errors).toHaveLength(1);
      expect(parsed.errors[0].message).toBe('Test error');
    });
  });

  describe('Configuration options', () => {
    it('should respect reportToConsole option', () => {
      const { result } = renderHook(() => useErrorTracking({ reportToConsole: false }));

      act(() => {
        result.current.trackError('Test error');
      });

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should report to console by default', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackError('Test error');
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[Error Tracked]',
        expect.objectContaining({
          message: 'Test error'
        })
      );
    });

    it('should call reportCallback when provided', () => {
      const callback = vi.fn();
      const { result } = renderHook(() => useErrorTracking({ reportCallback: callback }));

      act(() => {
        result.current.trackError('Test error');
      });

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Test error'
        })
      );
    });

    it('should ignore errors matching ignore patterns', () => {
      const { result } = renderHook(() =>
        useErrorTracking({
          ignorePatterns: [/ResizeObserver/, /script error/i]
        })
      );

      act(() => {
        result.current.trackError('ResizeObserver loop limit exceeded');
        result.current.trackError('Script error occurred');
        result.current.trackError('Valid error message');
      });

      const errors = result.current.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Valid error message');
    });
  });

  describe('Global error handling', () => {
    it('should track unhandled window errors', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        const errorEvent = new ErrorEvent('error', {
          message: 'Unhandled error',
          filename: 'test.js',
          lineno: 10,
          colno: 5
        });
        window.dispatchEvent(errorEvent);
      });

      const errors = result.current.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Unhandled error');
      expect(errors[0].context).toMatchObject({
        filename: 'test.js',
        lineno: 10,
        colno: 5
      });
    });

    it('should track unhandled promise rejections', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        const rejectionEvent = new Event('unhandledrejection') as PromiseRejectionEvent;
        Object.defineProperty(rejectionEvent, 'reason', {
          value: new Error('Promise rejected'),
          writable: false
        });
        window.dispatchEvent(rejectionEvent);
      });

      const errors = result.current.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('Promise rejected');
      expect(errors[0].context).toMatchObject({
        type: 'unhandled-promise-rejection'
      });
    });

    it('should handle string rejection reasons', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        const rejectionEvent = new Event('unhandledrejection') as PromiseRejectionEvent;
        Object.defineProperty(rejectionEvent, 'reason', {
          value: 'String rejection reason',
          writable: false
        });
        window.dispatchEvent(rejectionEvent);
      });

      const errors = result.current.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('String rejection reason');
    });

    it('should cleanup event listeners on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      const { unmount } = renderHook(() => useErrorTracking());
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
      expect(removeEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
      
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty error messages', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackError('');
      });

      const errors = result.current.getErrors();
      expect(errors).toHaveLength(1);
      expect(errors[0].message).toBe('');
    });

    it('should handle errors with special characters', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackError('Error with "quotes" and \'apostrophes\' and <tags>');
      });

      const errors = result.current.getErrors();
      expect(errors[0].message).toBe('Error with "quotes" and \'apostrophes\' and <tags>');
    });

    it('should handle concurrent error tracking', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.trackError(`Concurrent error ${i}`);
        }
      });

      const errors = result.current.getErrors();
      expect(errors).toHaveLength(100);
    });

    it('should return a copy of errors array', () => {
      const { result } = renderHook(() => useErrorTracking());

      act(() => {
        result.current.trackError('Test error');
      });

      const errors1 = result.current.getErrors();
      const errors2 = result.current.getErrors();
      
      expect(errors1).not.toBe(errors2);
      expect(errors1).toEqual(errors2);
    });
  });
});
