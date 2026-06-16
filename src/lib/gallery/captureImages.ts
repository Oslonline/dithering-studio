const PREVIEW_MAX = 1400;

export const GALLERY_PREVIEW_MAX = 640;
export const GALLERY_PREVIEW_QUALITY = 0.68;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image."));
    img.src = url;
  });
}

function drawToPreviewCanvas(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  maxSize = PREVIEW_MAX,
) {
  const scale = Math.min(1, maxSize / Math.max(sourceWidth, sourceHeight));
  const width = Math.max(1, Math.round(sourceWidth * scale));
  const height = Math.max(1, Math.round(sourceHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare image.");
  ctx.drawImage(source, 0, 0, width, height);
  return { canvas, width, height };
}

export function getDitheredResultCanvas(
  videoMode: boolean,
  canvasRef: HTMLCanvasElement | null,
  processedCanvasRef: HTMLCanvasElement | null,
): HTMLCanvasElement | null {
  if (videoMode) return canvasRef;
  return processedCanvasRef ?? canvasRef;
}

export async function captureImageFromUrl(
  imageUrl: string,
  maxSize = PREVIEW_MAX,
  quality = GALLERY_PREVIEW_QUALITY,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const img = await loadImage(imageUrl);
  const { canvas, width, height } = drawToPreviewCanvas(img, img.naturalWidth, img.naturalHeight, maxSize);
  return { dataUrl: canvas.toDataURL("image/webp", quality), width, height };
}

export function captureVideoFrame(
  video: HTMLVideoElement,
  maxSize = PREVIEW_MAX,
  quality = GALLERY_PREVIEW_QUALITY,
): { dataUrl: string; width: number; height: number } {
  const sourceWidth = video.videoWidth || video.clientWidth;
  const sourceHeight = video.videoHeight || video.clientHeight;
  if (!sourceWidth || !sourceHeight) throw new Error("Video frame is not ready.");
  const { canvas, width, height } = drawToPreviewCanvas(video, sourceWidth, sourceHeight, maxSize);
  return { dataUrl: canvas.toDataURL("image/webp", quality), width, height };
}

function waitForVideoDimensions(video: HTMLVideoElement, timeoutMs = 8000): Promise<void> {
  if (video.videoWidth > 0 && video.videoHeight > 0) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Video frame is not ready."));
    }, timeoutMs);

    const onReady = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        cleanup();
        resolve();
      }
    };

    const cleanup = () => {
      window.clearTimeout(timeout);
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("seeked", onReady);
    };

    video.addEventListener("loadeddata", onReady);
    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("seeked", onReady);
    if (video.readyState === 0) {
      video.load();
    }
  });
}

export async function captureVideoFrameAsync(
  video: HTMLVideoElement,
  maxSize = GALLERY_PREVIEW_MAX,
  quality = GALLERY_PREVIEW_QUALITY,
): Promise<{ dataUrl: string; width: number; height: number }> {
  await waitForVideoDimensions(video);

  const wasPlaying = !video.paused && !video.ended;
  const time = video.currentTime;

  if (wasPlaying) {
    video.pause();
  }

  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
    await new Promise<void>((resolve, reject) => {
      const onSeeked = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error("Video frame is not ready."));
      };
      const cleanup = () => {
        video.removeEventListener("seeked", onSeeked);
        video.removeEventListener("error", onError);
      };
      video.addEventListener("seeked", onSeeked);
      video.addEventListener("error", onError);
      try {
        video.currentTime = time;
      } catch {
        cleanup();
        reject(new Error("Video frame is not ready."));
      }
    });
  }

  try {
    return captureVideoFrame(video, maxSize, quality);
  } finally {
    if (wasPlaying) {
      void video.play().catch(() => {});
    }
  }
}

export async function canvasToPreviewDataUrl(
  canvas: HTMLCanvasElement,
  maxSize = PREVIEW_MAX,
  quality = GALLERY_PREVIEW_QUALITY,
): Promise<{ dataUrl: string; width: number; height: number }> {
  const { canvas: output, width, height } = drawToPreviewCanvas(canvas, canvas.width, canvas.height, maxSize);
  return { dataUrl: output.toDataURL("image/webp", quality), width, height };
}

export async function canvasToGalleryPreviewDataUrl(
  canvas: HTMLCanvasElement,
): Promise<{ dataUrl: string; width: number; height: number }> {
  return canvasToPreviewDataUrl(canvas, GALLERY_PREVIEW_MAX, GALLERY_PREVIEW_QUALITY);
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read preview."));
    reader.readAsDataURL(blob);
  });
}
