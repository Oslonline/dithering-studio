/**
 * OffscreenCanvas Utility Type Definitions
 * 
 * Types for OffscreenCanvas support and feature detection
 */

/**
 * OffscreenCanvas feature support information
 */
export interface OffscreenCanvasSupport {
  /** Whether OffscreenCanvas is available */
  supported: boolean;
  /** Whether transferControlToOffscreen is available */
  transferSupported: boolean;
  /** Whether 2D context is available */
  context2dSupported: boolean;
}

/**
 * Result of canvas transfer operation
 */
export interface CanvasTransferResult {
  /** Whether transfer was successful */
  success: boolean;
  /** The transferred OffscreenCanvas (if successful) */
  canvas?: OffscreenCanvas;
  /** Error message (if failed) */
  error?: string;
}

/**
 * OffscreenCanvas creation options
 */
export interface OffscreenCanvasOptions {
  /** Canvas width */
  width: number;
  /** Canvas height */
  height: number;
  /** Whether to use alpha channel */
  alpha?: boolean;
  /** Color space */
  colorSpace?: PredefinedColorSpace;
}
