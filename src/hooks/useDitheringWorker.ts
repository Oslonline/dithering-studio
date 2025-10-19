/**
 * Hook for using Web Workers for dithering
 * Provides a clean interface to submit dithering jobs to worker pool
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { getWorkerPool, terminateWorkerPool } from '../workers';
import type { DitherWorkerRequest, WorkerPoolStats } from '../workers';
import { 
  isOffscreenCanvasSupported, 
  createOffscreenCanvasFromImageData 
} from '../utils/offscreenCanvas';

export interface UseDitheringWorkerOptions {
  enabled?: boolean; // Enable/disable worker usage
  useOffscreenCanvas?: boolean; // Enable/disable OffscreenCanvas (auto-detected if not specified)
  onError?: (error: Error) => void;
  onSuccess?: (processingTime: number) => void;
}

export interface DitheringWorkerResult {
  submitJob: (data: Omit<DitherWorkerRequest['data'], 'imageData'> & { 
    imageData: ImageData 
  }) => Promise<ImageData | null>;
  isProcessing: boolean;
  stats: WorkerPoolStats | null;
  error: Error | null;
}

/**
 * Hook for submitting dithering jobs to worker pool
 */
export function useDitheringWorker(options: UseDitheringWorkerOptions = {}): DitheringWorkerResult {
  const { 
    enabled = true, 
    useOffscreenCanvas = isOffscreenCanvasSupported(),
    onError, 
    onSuccess 
  } = options;
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [stats, setStats] = useState<WorkerPoolStats | null>(null);
  const workerPoolRef = useRef(enabled ? getWorkerPool() : null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const offscreenSupportedRef = useRef(useOffscreenCanvas);

  useEffect(() => {
    if (enabled && !workerPoolRef.current) {
      workerPoolRef.current = getWorkerPool({
        maxWorkers: Math.min(2, Math.max(1, navigator.hardwareConcurrency - 1)),
        timeout: 30000,
        enableHealthCheck: false
      });
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !workerPoolRef.current) return;

    const enableStatsPolling = false;
    if (!enableStatsPolling) return;

    const interval = setInterval(() => {
      if (workerPoolRef.current) {
        setStats(workerPoolRef.current.getStats());
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [enabled]);

  /**
   * Submit a dithering job to the worker pool
   */
  const submitJob = useCallback(async (data: Omit<DitherWorkerRequest['data'], 'imageData'> & { 
    imageData: ImageData 
  }): Promise<ImageData | null> => {
    if (!enabled || !workerPoolRef.current) {
      return null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsProcessing(true);
    setError(null);

    try {
      if (offscreenSupportedRef.current) {
        try {
          const offscreenCanvas = createOffscreenCanvasFromImageData(data.imageData);
          
          if (offscreenCanvas) {
            const response = await workerPoolRef.current.submitOffscreenJob(
              offscreenCanvas,
              data.algorithmId,
              data.params
            );

            if (abortControllerRef.current?.signal.aborted) {
              return null;
            }

            if (response.type === 'dither-complete' && response.data) {
              setIsProcessing(false);
              
              if (onSuccess) {
                onSuccess(response.data.processingTime);
              }

              return response.data.imageData;
            } else if (response.type === 'dither-error') {
              // Fall through to ImageData fallback
              console.warn('[Worker] OffscreenCanvas failed, falling back to ImageData:', response.error);
            }
          }
        } catch (offscreenError) {
          // Fall through to ImageData fallback
          console.warn('[Worker] OffscreenCanvas failed, falling back to ImageData:', offscreenError);
        }
      }

      // Fallback to ImageData transfer
      const request: Omit<DitherWorkerRequest, 'id'> = {
        type: 'dither',
        data: {
          imageData: data.imageData,
          width: data.width,
          height: data.height,
          algorithmId: data.algorithmId,
          params: data.params
        }
      };

      const response = await workerPoolRef.current.submitJob(request);

      // Check if aborted
      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      if (response.type === 'dither-complete' && response.data) {
        setIsProcessing(false);
        
        if (onSuccess) {
          onSuccess(response.data.processingTime);
        }

        return response.data.imageData;
      } else if (response.type === 'dither-error') {
        const err = new Error(response.error || 'Dithering failed');
        setError(err);
        setIsProcessing(false);
        
        if (onError) {
          onError(err);
        }

        return null;
      }

      return null;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      setIsProcessing(false);

      if (onError) {
        onError(error);
      }

      return null;
    }
  }, [enabled, onError, onSuccess]);

  return {
    submitJob,
    isProcessing,
    stats,
    error
  };
}

/**
 * Hook to cleanup worker pool on app unmount
 */
export function useWorkerPoolCleanup(): void {
  useEffect(() => {
    return () => {
      terminateWorkerPool();
    };
  }, []);
}
