import { describe, it, expect, beforeEach, vi } from 'vitest';
import { perf } from '../../utils/perf';
import type { PerfFrame, PerfListener } from '../../utils/perf';

describe('Performance Tracker', () => {
  beforeEach(() => {
    perf.reset();
  });

  describe('Frame tracking', () => {
    it('should create a new frame', () => {
      perf.newFrame(1);
      perf.endFrame();
      
      const frames = perf.getFrames();
      expect(frames).toHaveLength(1);
      expect(frames[0].token).toBe(1);
    });

    it('should track multiple frames', () => {
      perf.newFrame(1);
      perf.endFrame();
      
      perf.newFrame(2);
      perf.endFrame();
      
      perf.newFrame(3);
      perf.endFrame();
      
      const frames = perf.getFrames();
      expect(frames).toHaveLength(3);
      expect(frames[0].token).toBe(1);
      expect(frames[1].token).toBe(2);
      expect(frames[2].token).toBe(3);
    });

    it('should auto-flush previous frame when starting new one', () => {
      perf.newFrame(1);
      // Not calling endFrame
      perf.newFrame(2);
      perf.endFrame();
      
      const frames = perf.getFrames();
      expect(frames).toHaveLength(2);
    });

    it('should limit frame history to 40 frames', () => {
      for (let i = 0; i < 50; i++) {
        perf.newFrame(i);
        perf.endFrame();
      }
      
      const frames = perf.getFrames();
      expect(frames).toHaveLength(40);
      // Should keep most recent 40
      expect(frames[0].token).toBe(10);
      expect(frames[39].token).toBe(49);
    });
  });

  describe('Phase tracking', () => {
    it('should track phase duration', () => {
      perf.newFrame(1);
      perf.phaseStart('processing');
      
      // Simulate some work
      const start = performance.now();
      while (performance.now() - start < 10) {}
      
      perf.phaseEnd('processing');
      perf.endFrame();
      
      const frames = perf.getFrames();
      expect(frames[0].phases.processing).toBeGreaterThan(0);
      expect(frames[0].phases.processing).toBeGreaterThanOrEqual(10);
    });

    it('should track multiple phases', () => {
      perf.newFrame(1);
      
      perf.phaseStart('phase1');
      perf.phaseEnd('phase1');
      
      perf.phaseStart('phase2');
      perf.phaseEnd('phase2');
      
      perf.phaseStart('phase3');
      perf.phaseEnd('phase3');
      
      perf.endFrame();
      
      const frames = perf.getFrames();
      expect(frames[0].phases).toHaveProperty('phase1');
      expect(frames[0].phases).toHaveProperty('phase2');
      expect(frames[0].phases).toHaveProperty('phase3');
    });

    it('should accumulate duration for repeated phases', () => {
      perf.newFrame(1);
      
      perf.phaseStart('rendering');
      const start1 = performance.now();
      while (performance.now() - start1 < 5) {}
      perf.phaseEnd('rendering');
      
      perf.phaseStart('rendering');
      const start2 = performance.now();
      while (performance.now() - start2 < 5) {}
      perf.phaseEnd('rendering');
      
      perf.endFrame();
      
      const frames = perf.getFrames();
      expect(frames[0].phases.rendering).toBeGreaterThanOrEqual(10);
    });

    it('should handle mark without duration', () => {
      perf.newFrame(1);
      perf.mark('milestone');
      perf.endFrame();
      
      const frames = perf.getFrames();
      expect(frames[0].phases.milestone).toBe(0);
    });

    it('should handle phase end without start gracefully', () => {
      perf.newFrame(1);
      perf.phaseEnd('nonexistent');
      perf.endFrame();
      
      const frames = perf.getFrames();
      expect(frames[0].phases.nonexistent).toBeUndefined();
    });

    it('should auto-close open phases on endFrame', () => {
      perf.newFrame(1);
      perf.phaseStart('processing');
      
      const start = performance.now();
      while (performance.now() - start < 10) {}
      
      // Not calling phaseEnd
      perf.endFrame();
      
      const frames = perf.getFrames();
      expect(frames[0].phases.processing).toBeGreaterThan(0);
    });
  });

  describe('Frame metadata', () => {
    it('should track frame start time', () => {
      const beforeStart = performance.now();
      perf.newFrame(1);
      const afterStart = performance.now();
      perf.endFrame();
      
      const frames = perf.getFrames();
      expect(frames[0].started).toBeGreaterThanOrEqual(beforeStart);
      expect(frames[0].started).toBeLessThanOrEqual(afterStart);
    });

    it('should calculate total frame duration', () => {
      perf.newFrame(1);
      
      const start = performance.now();
      while (performance.now() - start < 20) {}
      
      perf.endFrame();
      
      const frames = perf.getFrames();
      expect(frames[0].total).toBeGreaterThanOrEqual(20);
    });

    it('should assign sequential sequence numbers', () => {
      perf.newFrame(1);
      perf.endFrame();
      
      perf.newFrame(2);
      perf.endFrame();
      
      perf.newFrame(3);
      perf.endFrame();
      
      const frames = perf.getFrames();
      expect(frames[0].seq).toBe(1);
      expect(frames[1].seq).toBe(2);
      expect(frames[2].seq).toBe(3);
    });
  });

  describe('Subscription and listeners', () => {
    it('should call listener immediately on subscribe', () => {
      perf.newFrame(1);
      perf.endFrame();
      
      const listener = vi.fn();
      perf.subscribe(listener);
      
      expect(listener).toHaveBeenCalledWith(expect.any(Array));
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should call listener when new frame is added', () => {
      const listener = vi.fn();
      perf.subscribe(listener);
      listener.mockClear();
      
      perf.newFrame(1);
      perf.endFrame();
      
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ token: 1 })
      ]));
    });

    it('should support multiple listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      
      perf.subscribe(listener1);
      perf.subscribe(listener2);
      
      listener1.mockClear();
      listener2.mockClear();
      
      perf.newFrame(1);
      perf.endFrame();
      
      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('should unsubscribe listener', () => {
      const listener = vi.fn();
      const unsubscribe = perf.subscribe(listener);
      
      listener.mockClear();
      unsubscribe();
      
      perf.newFrame(1);
      perf.endFrame();
      
      expect(listener).not.toHaveBeenCalled();
    });

    it('should not throw if listener throws error', () => {
      const badListener = vi.fn(() => {
        throw new Error('Listener error');
      });
      
      perf.subscribe(badListener);
      
      expect(() => {
        perf.newFrame(1);
        perf.endFrame();
      }).not.toThrow();
    });
  });

  describe('Reset functionality', () => {
    it('should clear all frames', () => {
      perf.newFrame(1);
      perf.endFrame();
      perf.newFrame(2);
      perf.endFrame();
      
      perf.reset();
      
      const frames = perf.getFrames();
      expect(frames).toHaveLength(0);
    });

    it('should reset sequence numbers', () => {
      perf.newFrame(1);
      perf.endFrame();
      perf.newFrame(2);
      perf.endFrame();
      
      perf.reset();
      
      perf.newFrame(3);
      perf.endFrame();
      
      const frames = perf.getFrames();
      expect(frames[0].seq).toBe(1);
    });

    it('should notify listeners on reset', () => {
      const listener = vi.fn();
      perf.subscribe(listener);
      
      listener.mockClear();
      perf.reset();
      
      expect(listener).toHaveBeenCalledWith([]);
    });
  });

  describe('Edge cases', () => {
    it('should handle operations without active frame gracefully', () => {
      expect(() => {
        perf.phaseStart('test');
        perf.phaseEnd('test');
        perf.mark('test');
      }).not.toThrow();
    });

    it('should return immutable frame copies', () => {
      perf.newFrame(1);
      perf.endFrame();
      
      const frames1 = perf.getFrames();
      const frames2 = perf.getFrames();
      
      expect(frames1).not.toBe(frames2);
      expect(frames1).toEqual(frames2);
    });

    it('should handle rapid frame creation', () => {
      for (let i = 0; i < 100; i++) {
        perf.newFrame(i);
        perf.phaseStart('work');
        perf.phaseEnd('work');
        perf.endFrame();
      }
      
      const frames = perf.getFrames();
      expect(frames).toHaveLength(40); // Max 40 frames
    });
  });
});



