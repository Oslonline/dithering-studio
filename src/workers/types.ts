/**
 * Type definitions for Web Worker communication
 * Used for type-safe messaging between main thread and workers
 */

/**
 * Request sent to worker to process dithering
 */
export interface DitherWorkerRequest {
  type: 'dither';
  id: number; // Unique request ID
  data: {
    imageData: ImageData;
    width: number;
    height: number;
    algorithmId: number;
    params: {
      threshold: number;
      invert: boolean;
      serpentine: boolean;
      palette?: [number, number, number][];
      asciiRamp?: string;
    };
  };
}

/**
 * Request to process using OffscreenCanvas
 */
export interface OffscreenDitherRequest {
  type: 'offscreen-dither';
  id: number;
  data: {
    canvas: OffscreenCanvas;
    algorithmId: number;
    params: {
      threshold: number;
      invert: boolean;
      serpentine: boolean;
      palette?: [number, number, number][];
      asciiRamp?: string;
    };
  };
}

/**
 * Response from worker after processing
 */
export interface DitherWorkerResponse {
  type: 'dither-complete' | 'dither-error';
  id: number; // Matches request ID
  data?: {
    imageData: ImageData;
    processingTime: number;
  };
  error?: string;
}

/**
 * Health check request to verify worker is alive
 */
export interface WorkerHealthRequest {
  type: 'health-check';
  id: number;
}

/**
 * Health check response
 */
export interface WorkerHealthResponse {
  type: 'health-check-response';
  id: number;
  status: 'ok';
}

/**
 * Union type of all possible worker requests
 */
export type WorkerRequest = DitherWorkerRequest | OffscreenDitherRequest | WorkerHealthRequest;

/**
 * Union type of all possible worker responses
 */
export type WorkerResponse = DitherWorkerResponse | WorkerHealthResponse;

/**
 * Worker configuration
 */
export interface WorkerConfig {
  maxWorkers?: number; // Maximum number of workers in pool
  timeout?: number; // Request timeout in ms
  enableHealthCheck?: boolean; // Periodic health checks
}

/**
 * Worker pool statistics
 */
export interface WorkerPoolStats {
  totalWorkers: number;
  activeWorkers: number;
  queuedJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
}
