/**
 * Workers module exports
 */

export { WorkerPool, getWorkerPool, terminateWorkerPool } from './WorkerPool';
export type { 
  WorkerRequest, 
  WorkerResponse, 
  DitherWorkerRequest, 
  DitherWorkerResponse,
  WorkerConfig, 
  WorkerPoolStats 
} from './types';
