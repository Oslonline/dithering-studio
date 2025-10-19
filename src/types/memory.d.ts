/**
 * Memory Management Type Definitions
 * 
 * Types for buffer pooling and memory optimization
 */

/**
 * Buffer pool statistics
 */
export interface BufferPoolStats {
  /** Total buffers allocated since pool creation */
  allocated: number;
  /** Total buffers reused from pool */
  reused: number;
  /** Total buffers released back to pool */
  released: number;
  /** Currently active buffers (acquired but not released) */
  activeBuffers: number;
  /** Pool size information for each buffer size */
  poolSizes: PoolSizeInfo[];
  /** Total number of buffers currently in pools */
  totalPooledBuffers: number;
}

/**
 * Information about pool for a specific buffer size
 */
export interface PoolSizeInfo {
  /** Buffer size in bytes */
  size: number;
  /** Number of buffers in pool for this size */
  count: number;
}

/**
 * Memory information from Performance API
 */
export interface MemoryInfo {
  /** Whether memory info is supported */
  supported: boolean;
  /** JavaScript heap size limit (bytes) */
  jsHeapSizeLimit?: number;
  /** Total allocated JavaScript heap size (bytes) */
  totalJSHeapSize?: number;
  /** Currently used JavaScript heap size (bytes) */
  usedJSHeapSize?: number;
}

/**
 * Estimated memory usage for an image
 */
export interface ImageMemoryEstimate {
  /** Memory for ImageData (RGBA bytes) */
  imageData: number;
  /** Approximate canvas overhead */
  canvas: number;
  /** Total estimated memory */
  total: number;
}

/**
 * Buffer pool configuration options
 */
export interface BufferPoolConfig {
  /** Maximum number of buffers to keep per size */
  maxPoolSize?: number;
}

/**
 * Callback function for withBuffer utility
 * 
 * @param buffer - The acquired buffer
 * @returns Result of the operation
 */
export type BufferCallback<T> = (buffer: Uint8ClampedArray) => Promise<T> | T;
