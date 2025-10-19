/**
 * Worker Pool Manager
 * Manages a pool of Web Workers for parallel dithering operations
 */

import type { 
  WorkerRequest, 
  WorkerResponse, 
  DitherWorkerRequest, 
  WorkerConfig, 
  WorkerPoolStats 
} from './types';

/**
 * Pending job in the queue
 */
interface PendingJob {
  id: number;
  request: WorkerRequest;
  resolve: (response: WorkerResponse) => void;
  reject: (error: Error) => void;
  timestamp: number;
}

/**
 * Worker instance with metadata
 */
interface WorkerInstance {
  worker: Worker;
  busy: boolean;
  currentJobId: number | null;
  jobsCompleted: number;
}

/**
 * Worker Pool for managing multiple Web Workers
 */
export class WorkerPool {
  private workers: WorkerInstance[] = [];
  private jobQueue: PendingJob[] = [];
  private pendingJobs: Map<number, PendingJob> = new Map();
  private nextJobId = 1;
  private config: Required<WorkerConfig>;
  private stats = {
    completedJobs: 0,
    failedJobs: 0,
    totalProcessingTime: 0
  };

  constructor(config: WorkerConfig = {}) {
    this.config = {
      maxWorkers: config.maxWorkers ?? Math.max(1, navigator.hardwareConcurrency - 1),
      timeout: config.timeout ?? 30000,
      enableHealthCheck: config.enableHealthCheck ?? false
    };

    if (this.config.enableHealthCheck) {
      this.startHealthCheck();
    }
  }

  /**
   * Handle message from worker
   */
  private handleWorkerMessage(instance: WorkerInstance, response: WorkerResponse): void {
    const job = this.pendingJobs.get(response.id);
    
    if (!job) {
      console.warn('[WorkerPool] Received response for unknown job:', response.id);
      return;
    }

    // Mark worker as available
    instance.busy = false;
    instance.currentJobId = null;
    instance.jobsCompleted++;

    // Remove from pending
    this.pendingJobs.delete(response.id);

    // Handle response
    if (response.type === 'dither-complete' && response.data) {
      this.stats.completedJobs++;
      this.stats.totalProcessingTime += response.data.processingTime;
      job.resolve(response);
    } else if (response.type === 'dither-error') {
      this.stats.failedJobs++;
      job.reject(new Error(response.error || 'Worker processing failed'));
    } else if (response.type === 'health-check-response') {
      // Health check passed
      job.resolve(response);
    }

    // Process next job in queue
    this.processQueue();
  }

  /**
   * Handle worker error
   */
  private handleWorkerError(instance: WorkerInstance, error: ErrorEvent): void {
    if (instance.currentJobId !== null) {
      const job = this.pendingJobs.get(instance.currentJobId);
      if (job) {
        this.stats.failedJobs++;
        job.reject(new Error(`Worker crashed: ${error.message}`));
        this.pendingJobs.delete(instance.currentJobId);
      }
    }

    // Mark worker as available
    instance.busy = false;
    instance.currentJobId = null;

    // Try to restart worker
    this.restartWorker(instance);
  }

  /**
   * Restart a failed worker
   */
  private restartWorker(instance: WorkerInstance): void {
    try {
      instance.worker.terminate();
      
      const worker = new Worker(
        new URL('./dither.worker.ts', import.meta.url),
        { type: 'module' }
      );

      instance.worker = worker;
      instance.busy = false;
      instance.currentJobId = null;

      worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
        this.handleWorkerMessage(instance, event.data);
      };

      worker.onerror = (error) => {
        this.handleWorkerError(instance, error);
      };

      console.log('[WorkerPool] Worker restarted');
    } catch (error) {
      console.error('[WorkerPool] Failed to restart worker:', error);
    }
  }

  /**
   * Find an available worker or create one if needed
   */
  private findAvailableWorker(): WorkerInstance | null {
    // First check if we have an available worker
    const availableWorker = this.workers.find(w => !w.busy);
    if (availableWorker) return availableWorker;

    // If all workers are busy and we haven't reached max workers, create a new one
    const maxWorkers = Math.min(this.config.maxWorkers, 2); // Cap at 2 workers
    if (this.workers.length < maxWorkers) {
      try {
        const worker = new Worker(
          new URL('./dither.worker.ts', import.meta.url),
          { type: 'module' }
        );

        const instance: WorkerInstance = {
          worker,
          busy: false,
          currentJobId: null,
          jobsCompleted: 0
        };

        worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
          this.handleWorkerMessage(instance, event.data);
        };

        worker.onerror = (error) => {
          this.handleWorkerError(instance, error);
        };

        this.workers.push(instance);
        console.log(`[WorkerPool] Created worker on-demand (${this.workers.length}/${maxWorkers})`);
        return instance;
      } catch (error) {
        console.error('[WorkerPool] Failed to create worker:', error);
        return null;
      }
    }

    return null;
  }

  /**
   * Process next job in queue
   */
  private processQueue(): void {
    if (this.jobQueue.length === 0) return;

    const worker = this.findAvailableWorker();
    if (!worker) return;

    const job = this.jobQueue.shift();
    if (!job) return;

    this.executeJob(worker, job);
  }

  /**
   * Execute a job on a worker
   */
  private executeJob(instance: WorkerInstance, job: PendingJob): void {
    instance.busy = true;
    instance.currentJobId = job.id;

    // Set timeout
    const timeoutId = setTimeout(() => {
      if (this.pendingJobs.has(job.id)) {
        this.stats.failedJobs++;
        job.reject(new Error('Worker timeout'));
        this.pendingJobs.delete(job.id);
        
        // Restart worker on timeout
        this.restartWorker(instance);
      }
    }, this.config.timeout);

    // Wrap resolve/reject to clear timeout
    const originalResolve = job.resolve;
    const originalReject = job.reject;

    job.resolve = (response) => {
      clearTimeout(timeoutId);
      originalResolve(response);
    };

    job.reject = (error) => {
      clearTimeout(timeoutId);
      originalReject(error);
    };

    // Send to worker
    instance.worker.postMessage(job.request);
  }

  /**
   * Submit a dithering job
   */
  public async submitJob(request: Omit<DitherWorkerRequest, 'id'>): Promise<WorkerResponse> {
    return new Promise((resolve, reject) => {
      const id = this.nextJobId++;
      const job: PendingJob = {
        id,
        request: { ...request, id } as WorkerRequest,
        resolve,
        reject,
        timestamp: Date.now()
      };

      this.pendingJobs.set(id, job);

      // Try to execute immediately if worker available
      const worker = this.findAvailableWorker();
      if (worker) {
        this.executeJob(worker, job);
      } else {
        // Queue for later
        this.jobQueue.push(job);
      }
    });
  }

  /**
   * Submit a dithering job using OffscreenCanvas for zero-copy transfer
   */
  public async submitOffscreenJob(
    canvas: OffscreenCanvas,
    algorithmId: number,
    params: DitherWorkerRequest['data']['params']
  ): Promise<WorkerResponse> {
    return new Promise((resolve, reject) => {
      const id = this.nextJobId++;
      const request: WorkerRequest = {
        type: 'offscreen-dither',
        id,
        data: {
          canvas,
          algorithmId,
          params
        }
      };

      const job: PendingJob = {
        id,
        request,
        resolve,
        reject,
        timestamp: Date.now()
      };

      this.pendingJobs.set(id, job);

      // Try to execute immediately if worker available
      const worker = this.findAvailableWorker();
      if (worker) {
        this.executeJob(worker, job);
      } else {
        // Queue for later
        this.jobQueue.push(job);
      }
    });
  }

  /**
   * Get pool statistics
   */
  public getStats(): WorkerPoolStats {
    const activeWorkers = this.workers.filter(w => w.busy).length;
    const averageProcessingTime = this.stats.completedJobs > 0
      ? this.stats.totalProcessingTime / this.stats.completedJobs
      : 0;

    return {
      totalWorkers: this.workers.length,
      activeWorkers,
      queuedJobs: this.jobQueue.length,
      completedJobs: this.stats.completedJobs,
      failedJobs: this.stats.failedJobs,
      averageProcessingTime
    };
  }

  /**
   * Start periodic health checks
   */
  private startHealthCheck(): void {
    setInterval(() => {
      this.workers.forEach((instance) => {
        if (!instance.busy) {
          const healthCheck: WorkerRequest = {
            type: 'health-check',
            id: this.nextJobId++
          };
          instance.worker.postMessage(healthCheck);
        }
      });
    }, 60000); // Every minute
  }

  /**
   * Terminate all workers
   */
  public terminate(): void {
    this.workers.forEach(instance => {
      instance.worker.terminate();
    });
    this.workers = [];
    this.jobQueue = [];
    this.pendingJobs.clear();
    console.log('[WorkerPool] Terminated');
  }
}

// Singleton instance
let poolInstance: WorkerPool | null = null;

/**
 * Get or create worker pool singleton
 */
export function getWorkerPool(config?: WorkerConfig): WorkerPool {
  if (!poolInstance) {
    poolInstance = new WorkerPool(config);
  }
  return poolInstance;
}

/**
 * Terminate worker pool singleton
 */
export function terminateWorkerPool(): void {
  if (poolInstance) {
    poolInstance.terminate();
    poolInstance = null;
  }
}
