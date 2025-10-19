/**
 * Web Worker Type Definitions
 * 
 * Types for worker communication and management
 */

/**
 * Request to process dithering with ImageData
 */
export interface DitherWorkerRequest {
  /** Request type */
  type: 'dither';
  /** Unique request ID */
  id: number;
  /** Request payload */
  data: {
    /** Source image data */
    imageData: ImageData;
    /** Image width */
    width: number;
    /** Image height */
    height: number;
    /** Algorithm ID to use */
    algorithmId: number;
    /** Algorithm parameters */
    params: {
      /** Threshold value (0-255) */
      threshold: number;
      /** Invert output */
      invert: boolean;
      /** Use serpentine scanning */
      serpentine: boolean;
      /** Optional color palette */
      palette?: [number, number, number][];
      /** Optional ASCII ramp */
      asciiRamp?: string;
    };
  };
}

/**
 * Request to process dithering with OffscreenCanvas
 */
export interface OffscreenDitherRequest {
  /** Request type */
  type: 'offscreen-dither';
  /** Unique request ID */
  id: number;
  /** Request payload */
  data: {
    /** OffscreenCanvas to process */
    canvas: OffscreenCanvas;
    /** Algorithm ID to use */
    algorithmId: number;
    /** Algorithm parameters */
    params: {
      /** Threshold value (0-255) */
      threshold: number;
      /** Invert output */
      invert: boolean;
      /** Use serpentine scanning */
      serpentine: boolean;
      /** Optional color palette */
      palette?: [number, number, number][];
      /** Optional ASCII ramp */
      asciiRamp?: string;
    };
  };
}

/**
 * Health check request to verify worker is responsive
 */
export interface WorkerHealthRequest {
  /** Request type */
  type: 'health-check';
  /** Unique request ID */
  id: number;
}

/**
 * Union type of all possible worker requests
 */
export type WorkerRequest = DitherWorkerRequest | OffscreenDitherRequest | WorkerHealthRequest;

/**
 * Successful dithering response
 */
export interface DitherWorkerResponse {
  /** Response type */
  type: 'dither-complete' | 'dither-error';
  /** Request ID this responds to */
  id: number;
  /** Response data (on success) */
  data?: {
    /** Processed image data */
    imageData: ImageData;
    /** Processing time in milliseconds */
    processingTime: number;
  };
  /** Error message (on failure) */
  error?: string;
}

/**
 * Health check response
 */
export interface WorkerHealthResponse {
  /** Response type */
  type: 'health-check-response';
  /** Request ID this responds to */
  id: number;
  /** Health status */
  status: 'ok';
}

/**
 * Union type of all possible worker responses
 */
export type WorkerResponse = DitherWorkerResponse | WorkerHealthResponse;

/**
 * Configuration for worker pool
 */
export interface WorkerConfig {
  /** Maximum number of workers (defaults to CPU cores - 1) */
  maxWorkers?: number;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Enable periodic health checks */
  enableHealthCheck?: boolean;
}

/**
 * Worker pool statistics
 */
export interface WorkerPoolStats {
  /** Total number of workers in pool */
  totalWorkers: number;
  /** Number of workers currently processing */
  activeWorkers: number;
  /** Number of jobs waiting in queue */
  queuedJobs: number;
  /** Total jobs completed successfully */
  completedJobs: number;
  /** Total jobs that failed */
  failedJobs: number;
  /** Average processing time in milliseconds */
  averageProcessingTime: number;
}

/**
 * Individual worker instance metadata
 */
export interface WorkerInstance {
  /** The actual Worker object */
  worker: Worker;
  /** Whether worker is currently processing */
  busy: boolean;
  /** Current job ID (if busy) */
  currentJobId: number | null;
  /** Total jobs completed by this worker */
  jobsCompleted: number;
}

/**
 * Pending job in the queue
 */
export interface PendingJob {
  /** Unique job ID */
  id: number;
  /** Worker request to process */
  request: WorkerRequest;
  /** Promise resolve function */
  resolve: (response: WorkerResponse) => void;
  /** Promise reject function */
  reject: (error: Error) => void;
  /** Timestamp when job was queued */
  timestamp: number;
}
