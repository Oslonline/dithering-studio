/**
 * Type Definitions Index
 * 
 * Central export point for all type definitions
 */

// Algorithm types
export type {
  Algorithm,
  AlgorithmCategory,
  AlgorithmDetail,
  AlgorithmPaper,
  AlgorithmParams,
  AlgorithmRunContext,
  Palette,
  Preset,
} from './algorithms';

// Worker types
export type {
  DitherWorkerRequest,
  DitherWorkerResponse,
  OffscreenDitherRequest,
  PendingJob,
  WorkerConfig,
  WorkerHealthRequest,
  WorkerHealthResponse,
  WorkerInstance,
  WorkerPoolStats,
  WorkerRequest,
  WorkerResponse,
} from './workers';

// Progressive rendering types
export type {
  ProgressiveRenderingOptions,
  ProgressiveTimeEstimate,
  Tile,
  TileConfig,
  TileProcessFunction,
  TileProgressCallback,
} from './progressive';

// Memory management types
export type {
  BufferCallback,
  BufferPoolConfig,
  BufferPoolStats,
  ImageMemoryEstimate,
  MemoryInfo,
  PoolSizeInfo,
} from './memory';

// OffscreenCanvas types
export type {
  CanvasTransferResult,
  OffscreenCanvasOptions,
  OffscreenCanvasSupport,
} from './offscreen';

// Performance monitoring types
export type {
  FrameMetrics,
  PerformancePhase,
  PerformanceProfiler,
  PerformanceStats,
  PhaseStats,
} from './performance';
