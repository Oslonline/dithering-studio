/**
 * Test fixtures for image processing tests
 */

/**
 * Creates a test ImageData object with specified dimensions and optional color
 */
export function createTestImageData(
  width: number,
  height: number,
  color: [number, number, number, number] = [255, 0, 0, 255]
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = color[0];     // R
    data[i + 1] = color[1]; // G
    data[i + 2] = color[2]; // B
    data[i + 3] = color[3]; // A
  }
  
  return new ImageData(data, width, height);
}

/**
 * Creates a gradient test image (black to white)
 */
export function createGradientImageData(width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  
  for (let y = 0; y < height; y++) {
    const value = Math.floor((y / height) * 255);
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      data[i] = value;     // R
      data[i + 1] = value; // G
      data[i + 2] = value; // B
      data[i + 3] = 255;   // A
    }
  }
  
  return new ImageData(data, width, height);
}

/**
 * Creates a checkerboard pattern test image
 */
export function createCheckerboardImageData(
  width: number,
  height: number,
  blockSize: number = 8
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const isBlack = (Math.floor(x / blockSize) + Math.floor(y / blockSize)) % 2 === 0;
      const value = isBlack ? 0 : 255;
      
      data[i] = value;     // R
      data[i + 1] = value; // G
      data[i + 2] = value; // B
      data[i + 3] = 255;   // A
    }
  }
  
  return new ImageData(data, width, height);
}

/**
 * Common test palettes
 */
export const testPalettes = {
  blackAndWhite: [
    [0, 0, 0],
    [255, 255, 255]
  ],
  grayscale4: [
    [0, 0, 0],
    [85, 85, 85],
    [170, 170, 170],
    [255, 255, 255]
  ],
  rgb: [
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255]
  ],
  cga: [
    [0, 0, 0],
    [0, 0, 170],
    [0, 170, 0],
    [0, 170, 170],
    [170, 0, 0],
    [170, 0, 170],
    [170, 85, 0],
    [170, 170, 170],
    [85, 85, 85],
    [85, 85, 255],
    [85, 255, 85],
    [85, 255, 255],
    [255, 85, 85],
    [255, 85, 255],
    [255, 255, 85],
    [255, 255, 255]
  ]
};

/**
 * Creates a mock File object for testing
 */
export function createMockFile(
  name: string = 'test.png',
  size: number = 1024,
  type: string = 'image/png'
): File {
  // Create a buffer of the specified size
  // For large files, don't actually create the full content
  const bufferSize = Math.min(size, 1024); // Cap at 1KB for actual content
  const blob = new Blob(['a'.repeat(bufferSize)], { type });
  const file = new File([blob], name, { type });
  
  // Mock the size property to return the requested size
  Object.defineProperty(file, 'size', {
    value: size,
    writable: false
  });
  
  return file;
}

/**
 * Creates a mock video File object
 */
export function createMockVideoFile(
  name: string = 'test.mp4',
  size: number = 1024 * 1024,
  type: string = 'video/mp4'
): File {
  return createMockFile(name, size, type);
}

/**
 * Test image dimensions
 */
export const testDimensions = {
  tiny: { width: 4, height: 4 },
  small: { width: 16, height: 16 },
  medium: { width: 64, height: 64 },
  large: { width: 256, height: 256 },
  huge: { width: 1024, height: 1024 }
};
