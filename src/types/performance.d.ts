/**
 * Performance Monitoring Type Definitions
 * 
 * Types for performance tracking and profiling
 */

/**
 * Performance phase timing
 */
export interface PerformancePhase {
  /** Phase name/identifier */
  name: string;
  /** Start timestamp (high-resolution) */
  startTime: number;
  /** End timestamp (high-resolution) */
  endTime?: number;
  /** Duration in milliseconds */
  duration?: number;
}

/**
 * Frame performance metrics
 */
export interface FrameMetrics {
  /** Frame/render token */
  token: number;
  /** Frame start time */
  startTime: number;
  /** Frame end time */
  endTime?: number;
  /** Total frame duration */
  totalDuration?: number;
  /** Individual phase timings */
  phases: Map<string, PerformancePhase>;
}

/**
 * Performance statistics
 */
export interface PerformanceStats {
  /** Total frames processed */
  totalFrames: number;
  /** Average frame time */
  averageFrameTime: number;
  /** Minimum frame time */
  minFrameTime: number;
  /** Maximum frame time */
  maxFrameTime: number;
  /** Phase statistics */
  phaseStats: Map<string, PhaseStats>;
}

/**
 * Statistics for a specific phase
 */
export interface PhaseStats {
  /** Phase name */
  name: string;
  /** Number of times executed */
  count: number;
  /** Total time spent in phase */
  totalTime: number;
  /** Average time per execution */
  averageTime: number;
  /** Minimum execution time */
  minTime: number;
  /** Maximum execution time */
  maxTime: number;
}

/**
 * Performance profiler interface
 */
export interface PerformanceProfiler {
  /** Start a new frame */
  newFrame(token: number): void;
  /** Start a phase */
  phaseStart(name: string): void;
  /** End a phase */
  phaseEnd(name: string): void;
  /** End current frame */
  endFrame(): void;
  /** Get statistics */
  getStats(): PerformanceStats;
  /** Reset all metrics */
  reset(): void;
}
