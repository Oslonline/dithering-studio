import type { SerpentinePattern } from "../types/serpentinePatterns";

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
      serpentinePattern?: SerpentinePattern;
      errorDiffusionStrength?: number;
      palette?: [number, number, number][];
      asciiRamp?: string;
    };
  };
}

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
      serpentinePattern?: SerpentinePattern;
      errorDiffusionStrength?: number;
      palette?: [number, number, number][];
      asciiRamp?: string;
    };
  };
}

export interface DitherWorkerResponse {
  type: 'dither-complete' | 'dither-error';
  id: number; // Matches request ID
  data?: {
    imageData: ImageData;
    processingTime: number;
  };
  error?: string;
}

export interface WorkerHealthRequest {
  type: 'health-check';
  id: number;
}

export interface WorkerHealthResponse {
  type: 'health-check-response';
  id: number;
  status: 'ok';
}

export type WorkerRequest = DitherWorkerRequest | OffscreenDitherRequest | WorkerHealthRequest;
export type WorkerResponse = DitherWorkerResponse | WorkerHealthResponse;

export interface WorkerConfig {
  maxWorkers?: number; // Maximum number of workers in pool
  timeout?: number; // Request timeout in ms
  enableHealthCheck?: boolean; // Periodic health checks
}

export interface WorkerPoolStats {
  totalWorkers: number;
  activeWorkers: number;
  queuedJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
}
