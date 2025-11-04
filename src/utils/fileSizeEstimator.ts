// Estimate PNG file size from canvas

export const estimatePNGSize = (canvas: HTMLCanvasElement): number => {
  const width = canvas.width;
  const height = canvas.height;
  const pixels = width * height;

  const uncompressedSize = pixels * 4;

  const estimatedSize = uncompressedSize * 0.5;

  return Math.round(estimatedSize + 8192);
};


// Estimate JPEG file size from canvas
export const estimateJPEGSize = (canvas: HTMLCanvasElement, quality = 0.92): number => {
  const width = canvas.width;
  const height = canvas.height;
  const pixels = width * height;

  const baseSize = pixels * 4;
  const compressionRatio = 0.1 - (quality * 0.05); // Lower quality = smaller
  const estimatedSize = baseSize * compressionRatio;

  return Math.round(estimatedSize);
};

// Estimate WebP file size from canvas
export const estimateWebPSize = (canvas: HTMLCanvasElement): number => {
  const pngSize = estimatePNGSize(canvas);

  return Math.round(pngSize * 0.7);
};


// Estimate SVG file size from canvas
export const estimateSVGSize = (canvas: HTMLCanvasElement): number => {
  const width = canvas.width;
  const height = canvas.height;
  const pixels = width * height;

  // SVG creates a rect for each unique color region
  const estimatedRects = pixels * 0.1;
  const estimatedSize = estimatedRects * 100;

  // SVG can be HUGE files for dithered images
  return Math.round(estimatedSize);
};


// Estimate video file size

export const estimateVideoSize = (
  width: number,
  height: number,
  duration: number, // seconds
  format: 'mp4' | 'webm' = 'webm'
): number => {
  const pixels = width * height;

  const bitrates = {
    mp4: 150000,
    webm: 100000,
  };

  const megapixels = pixels / 1000000;
  const bytesPerSecond = bitrates[format] * megapixels;
  const totalSize = bytesPerSecond * duration;

  return Math.round(totalSize);
};

export const formatBytes = (bytes: number, decimals = 1): string => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  return `${value.toFixed(decimals)} ${sizes[i]}`;
};

export const getAllFormatSizes = (canvas: HTMLCanvasElement | null) => {
  if (!canvas) {
    return {
      png: null,
      jpeg: null,
      webp: null,
      svg: null,
    };
  }

  return {
    png: estimatePNGSize(canvas),
    jpeg: estimateJPEGSize(canvas),
    webp: estimateWebPSize(canvas),
    svg: estimateSVGSize(canvas),
  };
};
