/**
 * Dithering Web Worker
 * Handles image processing in a separate thread to keep UI responsive
 */

import { findAlgorithm } from '../utils/algorithms';
import type { WorkerRequest, WorkerResponse } from './types';

// Worker message handler
self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;

  try {
    switch (request.type) {
      case 'health-check':
        handleHealthCheck(request.id);
        break;
      case 'dither':
        handleDither(request);
        break;
      case 'offscreen-dither':
        handleOffscreenDither(request);
        break;
      default:
        console.warn('[Worker] Unknown request type:', (request as any).type);
    }
  } catch (error) {
    console.error('[Worker] Error processing request:', error);
    const response: WorkerResponse = {
      type: 'dither-error',
      id: request.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
    self.postMessage(response);
  }
};

/**
 * Handle health check request
 */
function handleHealthCheck(id: number): void {
  const response: WorkerResponse = {
    type: 'health-check-response',
    id,
    status: 'ok'
  };
  self.postMessage(response);
}

/**
 * Handle dithering request
 */
function handleDither(request: WorkerRequest & { type: 'dither' }): void {
  const startTime = performance.now();
  const { id, data } = request;
  const { imageData, width, height, algorithmId, params } = data;

  try {
    // Find the algorithm implementation
    const algorithm = findAlgorithm(algorithmId);
    
    if (!algorithm) {
      throw new Error(`Algorithm with ID ${algorithmId} not found`);
    }

    // Create context for algorithm
    const srcData = new Uint8ClampedArray(imageData.data);
    const context = {
      srcData,
      width,
      height,
      params: {
        pattern: algorithmId,
        threshold: params.threshold,
        invert: params.invert,
        serpentine: params.serpentine,
        isErrorDiffusion: algorithm.category === 'Error Diffusion',
        palette: params.palette,
        asciiRamp: params.asciiRamp
      }
    };

    // Run the algorithm
    const result = algorithm.run(context);

    // Convert result to ImageData
    let outputImageData: ImageData;
    if (result instanceof ImageData) {
      outputImageData = result;
    } else {
      outputImageData = new ImageData(width, height);
      outputImageData.data.set(result);
    }

    const processingTime = performance.now() - startTime;

    // Send successful response
    const response: WorkerResponse = {
      type: 'dither-complete',
      id,
      data: {
        imageData: outputImageData,
        processingTime
      }
    };

    self.postMessage(response);
  } catch (error) {
    console.error('[Worker] Dithering error:', error);
    const response: WorkerResponse = {
      type: 'dither-error',
      id,
      error: error instanceof Error ? error.message : 'Dithering failed'
    };
    self.postMessage(response);
  }
}

/**
 * Handle OffscreenCanvas dithering request
 * Uses zero-copy canvas transfer for improved performance
 */
function handleOffscreenDither(request: WorkerRequest & { type: 'offscreen-dither' }): void {
  const startTime = performance.now();
  const { id, data } = request;
  const { canvas, algorithmId, params } = data;

  try {
    // Get canvas context and extract image data
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from OffscreenCanvas');
    }

    const width = canvas.width;
    const height = canvas.height;
    const imageData = ctx.getImageData(0, 0, width, height);

    // Find the algorithm implementation
    const algorithm = findAlgorithm(algorithmId);
    
    if (!algorithm) {
      throw new Error(`Algorithm with ID ${algorithmId} not found`);
    }

    // Create context for algorithm
    const srcData = new Uint8ClampedArray(imageData.data);
    const context = {
      srcData,
      width,
      height,
      params: {
        pattern: algorithmId,
        threshold: params.threshold,
        invert: params.invert,
        serpentine: params.serpentine,
        isErrorDiffusion: algorithm.category === 'Error Diffusion',
        palette: params.palette,
        asciiRamp: params.asciiRamp
      }
    };

    // Run the algorithm
    const result = algorithm.run(context);

    // Put result back on canvas
    let outputImageData: ImageData;
    if (result instanceof ImageData) {
      outputImageData = result;
    } else {
      outputImageData = new ImageData(width, height);
      outputImageData.data.set(result);
    }
    
    ctx.putImageData(outputImageData, 0, 0);

    const processingTime = performance.now() - startTime;

    // Send successful response (canvas is already updated, just return metadata)
    const response: WorkerResponse = {
      type: 'dither-complete',
      id,
      data: {
        imageData: outputImageData,
        processingTime
      }
    };

    self.postMessage(response);
  } catch (error) {
    console.error('[Worker] OffscreenCanvas dithering error:', error);
    const response: WorkerResponse = {
      type: 'dither-error',
      id,
      error: error instanceof Error ? error.message : 'OffscreenCanvas dithering failed'
    };
    self.postMessage(response);
  }
}

// Log worker initialization
console.log('[Worker] Dithering worker initialized');
