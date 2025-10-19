/**
 * OffscreenCanvas feature detection and utilities
 */

export function isOffscreenCanvasSupported(): boolean {
  try {
    if (typeof OffscreenCanvas === 'undefined') {
      return false;
    }

    const canvas = new OffscreenCanvas(1, 1);
    const ctx = canvas.getContext('2d');
    
    return ctx !== null;
  } catch (error) {
    return false;
  }
}

/**
 * Convert HTMLCanvasElement to OffscreenCanvas
 */
export function transferToOffscreen(canvas: HTMLCanvasElement): OffscreenCanvas | null {
  try {
    if (!isOffscreenCanvasSupported()) {
      return null;
    }

    if ('transferControlToOffscreen' in canvas) {
      return canvas.transferControlToOffscreen();
    }

    return null;
  } catch (error) {
    console.error('[OffscreenCanvas] Transfer failed:', error);
    return null;
  }
}

export function createOffscreenCanvasFromImageData(imageData: ImageData): OffscreenCanvas | null {
  try {
    if (!isOffscreenCanvasSupported()) {
      return null;
    }

    const { width, height } = imageData;
    const canvas = new OffscreenCanvas(width, height);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return null;
    }

    ctx.putImageData(imageData, 0, 0);
    return canvas;
  } catch (error) {
    console.error('[OffscreenCanvas] Creation from ImageData failed:', error);
    return null;
  }
}

export function getImageDataFromOffscreenCanvas(canvas: OffscreenCanvas): ImageData | null {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return null;
    }
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  } catch (error) {
    console.error('[OffscreenCanvas] ImageData extraction failed:', error);
    return null;
  }
}
