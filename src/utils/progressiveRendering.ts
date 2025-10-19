/**
 * Progressive Rendering Utilities
 * Implements tile-based processing for large images to avoid UI blocking
 */

/**
 * Configuration for tile-based processing
 */
export interface TileConfig {
    tileWidth: number;
    tileHeight: number;
    overlap?: number; // Overlap between tiles for seamless blending
}

/**
 * Represents a single tile in the image
 */
export interface Tile {
    x: number;
    y: number;
    width: number;
    height: number;
    index: number;
    total: number;
}

/**
 * Callback for tile processing progress
 */
export type TileProgressCallback = (tile: Tile, imageData: ImageData) => void;

/**
 * Default tile configuration based on image size
 */
export function getDefaultTileConfig(imageWidth: number, imageHeight: number): TileConfig {
    const pixelCount = imageWidth * imageHeight;

    // For small images (< 1MP), process as single tile
    if (pixelCount < 1024 * 1024) {
        return {
            tileWidth: imageWidth,
            tileHeight: imageHeight,
            overlap: 0
        };
    }

    // For medium images (1-4MP), use 512x512 tiles
    if (pixelCount < 4 * 1024 * 1024) {
        return {
            tileWidth: 512,
            tileHeight: 512,
            overlap: 0
        };
    }

    // For large images (4-16MP), use 256x256 tiles
    if (pixelCount < 16 * 1024 * 1024) {
        return {
            tileWidth: 256,
            tileHeight: 256,
            overlap: 0
        };
    }

    // For very large images (>16MP), use 128x128 tiles
    return {
        tileWidth: 128,
        tileHeight: 128,
        overlap: 0
    };
}

/**
 * Calculate tiles needed to cover an image
 */
export function calculateTiles(
    imageWidth: number,
    imageHeight: number,
    config: TileConfig
): Tile[] {
    const tiles: Tile[] = [];
    const { tileWidth, tileHeight, overlap = 0 } = config;

    let index = 0;

    for (let y = 0; y < imageHeight; y += tileHeight - overlap) {
        for (let x = 0; x < imageWidth; x += tileWidth - overlap) {
            const width = Math.min(tileWidth, imageWidth - x);
            const height = Math.min(tileHeight, imageHeight - y);

            tiles.push({
                x,
                y,
                width,
                height,
                index: index++,
                total: 0 // Will be set after all tiles are calculated
            });
        }
    }

    // Set total count on all tiles
    tiles.forEach(tile => {
        tile.total = tiles.length;
    });

    return tiles;
}

/**
 * Extract ImageData for a specific tile from the source image
 * Uses buffer pooling for intermediate operations
 */
export function extractTileImageData(
    sourceImageData: ImageData,
    tile: Tile
): ImageData {
    const { x, y, width, height } = tile;
    const sourceWidth = sourceImageData.width;
    const sourceData = sourceImageData.data;

    // Create ImageData (standard allocation, as ImageData doesn't support buffer injection)
    const tileImageData = new ImageData(width, height);
    const tileData = tileImageData.data;

    // Copy pixel data for this tile
    for (let row = 0; row < height; row++) {
        const sourceOffset = ((y + row) * sourceWidth + x) * 4;
        const tileOffset = row * width * 4;

        // Copy entire row at once
        tileData.set(
            sourceData.subarray(sourceOffset, sourceOffset + width * 4),
            tileOffset
        );
    }

    return tileImageData;
}

/**
 * Write processed tile data back to the destination image
 */
export function writeTileImageData(
    destinationImageData: ImageData,
    tile: Tile,
    tileImageData: ImageData
): void {
    const { x, y, width, height } = tile;
    const destWidth = destinationImageData.width;
    const destData = destinationImageData.data;
    const tileData = tileImageData.data;

    // Write pixel data for this tile
    for (let row = 0; row < height; row++) {
        const destOffset = ((y + row) * destWidth + x) * 4;
        const tileOffset = row * width * 4;

        // Copy entire row at once
        destData.set(
            tileData.subarray(tileOffset, tileOffset + width * 4),
            destOffset
        );
    }
}

/**
 * Process image progressively using tiles
 * Yields after each tile to allow UI updates
 * Uses buffer pooling for memory efficiency
 */
export async function processImageProgressively(
    sourceImageData: ImageData,
    processFn: (imageData: ImageData) => Promise<ImageData> | ImageData,
    onProgress?: TileProgressCallback,
    tileConfig?: TileConfig
): Promise<ImageData> {
    const { width, height } = sourceImageData;

    // Use provided config or calculate default
    const config = tileConfig || getDefaultTileConfig(width, height);

    // Calculate tiles
    const tiles = calculateTiles(width, height, config);

    // If only one tile, process directly
    if (tiles.length === 1) {
        const result = await processFn(sourceImageData);
        if (onProgress) {
            onProgress(tiles[0], result);
        }
        return result;
    }

    // Create destination ImageData for final result
    const destinationImageData = new ImageData(width, height);

    // Process each tile
    for (const tile of tiles) {
        // Extract tile from source
        const tileImageData = extractTileImageData(sourceImageData, tile);

        // Process the tile
        const processedTile = await processFn(tileImageData);

        // Write processed tile to destination
        writeTileImageData(destinationImageData, tile, processedTile);

        // Report progress
        if (onProgress) {
            onProgress(tile, destinationImageData);
        }

        // Yield to main thread to keep UI responsive
        await new Promise(resolve => setTimeout(resolve, 0));
    }

    return destinationImageData;
}

/**
 * Estimate processing time for progressive rendering
 */
export function estimateProgressiveProcessingTime(
    imageWidth: number,
    imageHeight: number,
    averageTimePerPixel: number = 0.001 // 1µs per pixel default
): { totalTime: number; tileCount: number; timePerTile: number } {
    const config = getDefaultTileConfig(imageWidth, imageHeight);
    const tiles = calculateTiles(imageWidth, imageHeight, config);

    const pixelsPerTile = config.tileWidth * config.tileHeight;
    const timePerTile = pixelsPerTile * averageTimePerPixel;
    const totalTime = timePerTile * tiles.length;

    return {
        totalTime,
        tileCount: tiles.length,
        timePerTile
    };
}
