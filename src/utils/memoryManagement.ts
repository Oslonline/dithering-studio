/**
 * Memory Management Utilities
 * Implements buffer pooling and reuse to reduce memory allocation and GC pressure
 */

/**
 * Pool of reusable Uint8ClampedArray buffers
 */
class BufferPool {
  private pools: Map<number, Uint8ClampedArray[]> = new Map();
  private maxPoolSize: number = 10; // Max buffers per size
  private stats = {
    allocated: 0,
    reused: 0,
    released: 0,
    activeBuffers: 0
  };

  /**
   * Get a buffer of the specified size
   * Reuses from pool if available, otherwise allocates new
   */
  public acquire(size: number): Uint8ClampedArray {
    const pool = this.pools.get(size);
    
    if (pool && pool.length > 0) {
      const buffer = pool.pop()!;
      this.stats.reused++;
      this.stats.activeBuffers++;
      return buffer;
    }
    
    // Allocate new buffer
    const buffer = new Uint8ClampedArray(size);
    this.stats.allocated++;
    this.stats.activeBuffers++;
    return buffer;
  }

  /**
   * Return a buffer to the pool for reuse
   */
  public release(buffer: Uint8ClampedArray): void {
    const size = buffer.length;
    
    if (!this.pools.has(size)) {
      this.pools.set(size, []);
    }
    
    const pool = this.pools.get(size)!;
    
    // Only keep up to maxPoolSize buffers per size
    if (pool.length < this.maxPoolSize) {
      // Clear buffer before returning to pool
      buffer.fill(0);
      pool.push(buffer);
      this.stats.released++;
    }
    
    this.stats.activeBuffers--;
  }

  /**
   * Clear all buffers from the pool
   */
  public clear(): void {
    this.pools.clear();
    this.stats = {
      allocated: 0,
      reused: 0,
      released: 0,
      activeBuffers: 0
    };
  }

  /**
   * Get pool statistics
   */
  public getStats() {
    return {
      ...this.stats,
      poolSizes: Array.from(this.pools.entries()).map(([size, buffers]) => ({
        size,
        count: buffers.length
      })),
      totalPooledBuffers: Array.from(this.pools.values()).reduce((sum, pool) => sum + pool.length, 0)
    };
  }

  /**
   * Set maximum buffers per size
   */
  public setMaxPoolSize(size: number): void {
    this.maxPoolSize = Math.max(1, size);
    
    // Trim existing pools if needed
    for (const pool of this.pools.values()) {
      if (pool.length > this.maxPoolSize) {
        pool.length = this.maxPoolSize;
      }
    }
  }
}

// Global buffer pool instance
const globalBufferPool = new BufferPool();

/**
 * Get the global buffer pool instance
 */
export function getBufferPool(): BufferPool {
  return globalBufferPool;
}

/**
 * Acquire a buffer from the pool
 */
export function acquireBuffer(size: number): Uint8ClampedArray {
  return globalBufferPool.acquire(size);
}

/**
 * Release a buffer back to the pool
 */
export function releaseBuffer(buffer: Uint8ClampedArray): void {
  globalBufferPool.release(buffer);
}

/**
 * Clear all buffers from the pool
 */
export function clearBufferPool(): void {
  globalBufferPool.clear();
}

/**
 * Get buffer pool statistics
 */
export function getBufferPoolStats() {
  return globalBufferPool.getStats();
}

/**
 * Configure buffer pool
 */
export function configureBufferPool(options: { maxPoolSize?: number }): void {
  if (options.maxPoolSize !== undefined) {
    globalBufferPool.setMaxPoolSize(options.maxPoolSize);
  }
}

/**
 * RAII-style buffer acquisition
 * Automatically releases buffer when callback completes
 */
export async function withBuffer<T>(
  size: number,
  callback: (buffer: Uint8ClampedArray) => Promise<T> | T
): Promise<T> {
  const buffer = acquireBuffer(size);
  try {
    return await callback(buffer);
  } finally {
    releaseBuffer(buffer);
  }
}

/**
 * Create ImageData using a pooled buffer
 * Note: Creates traditional ImageData and copies buffer data
 * Buffer is released after creation for reuse
 */
export function createImageDataFromPool(width: number, height: number): ImageData {
  const imageData = new ImageData(width, height);
  // ImageData creates its own buffer, so we don't use pooled buffer here
  // This function is kept for API consistency
  return imageData;
}

/**
 * Clone ImageData using pooled buffer for temporary operations
 */
export function cloneImageData(source: ImageData): ImageData {
  const { width, height } = source;
  const imageData = new ImageData(width, height);
  imageData.data.set(source.data);
  return imageData;
}

/**
 * Request garbage collection hint (if available)
 * This is a suggestion to the engine, not guaranteed
 */
export function requestGC(): void {
  if (typeof (global as any).gc === 'function') {
    (global as any).gc();
  }
}

/**
 * Monitor memory usage (if available)
 */
export function getMemoryInfo(): {
  supported: boolean;
  jsHeapSizeLimit?: number;
  totalJSHeapSize?: number;
  usedJSHeapSize?: number;
} {
  if ('memory' in performance && (performance as any).memory) {
    const memory = (performance as any).memory;
    return {
      supported: true,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      totalJSHeapSize: memory.totalJSHeapSize,
      usedJSHeapSize: memory.usedJSHeapSize
    };
  }
  
  return { supported: false };
}

/**
 * Calculate approximate memory usage for an image
 */
export function estimateImageMemory(width: number, height: number): {
  imageData: number;
  canvas: number;
  total: number;
} {
  const imageData = width * height * 4; // RGBA bytes
  const canvas = imageData * 2; // Approximate canvas overhead
  
  return {
    imageData,
    canvas,
    total: imageData + canvas
  };
}
