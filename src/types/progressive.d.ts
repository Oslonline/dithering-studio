/**
 * Progressive Rendering Type Definitions
 * 
 * Types for tile-based progressive image processing
 */

/**
 * Configuration for tile-based processing
 */
export interface TileConfig {
  /** Width of each tile in pixels */
  tileWidth: number;
  /** Height of each tile in pixels */
  tileHeight: number;
  /** Overlap between tiles for seamless blending */
  overlap?: number;
}

/**
 * Represents a single tile in the image grid
 */
export interface Tile {
  /** X coordinate of tile's top-left corner */
  x: number;
  /** Y coordinate of tile's top-left corner */
  y: number;
  /** Tile width in pixels */
  width: number;
  /** Tile height in pixels */
  height: number;
  /** Tile index in processing order */
  index: number;
  /** Total number of tiles */
  total: number;
}

/**
 * Callback function for tile processing progress updates
 * 
 * @param tile - The tile that was just processed
 * @param imageData - Current state of the full image
 */
export type TileProgressCallback = (tile: Tile, imageData: ImageData) => void;

/**
 * Tile processing function type
 * 
 * @param imageData - Tile image data to process
 * @returns Processed tile image data
 */
export type TileProcessFunction = (imageData: ImageData) => Promise<ImageData> | ImageData;

/**
 * Progressive rendering options
 */
export interface ProgressiveRenderingOptions {
  /** Custom tile configuration */
  tileConfig?: TileConfig;
  /** Progress callback function */
  onProgress?: TileProgressCallback;
  /** Minimum image size to trigger progressive rendering */
  threshold?: number;
}

/**
 * Progressive processing time estimate
 */
export interface ProgressiveTimeEstimate {
  /** Estimated total processing time in milliseconds */
  totalTime: number;
  /** Number of tiles that will be processed */
  tileCount: number;
  /** Estimated time per tile in milliseconds */
  timePerTile: number;
}
