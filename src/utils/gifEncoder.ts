/**
 * GIF encoder using gifenc library
 * Creates animated GIF from canvas frames by capturing during playback
 */

// @ts-ignore - gifenc doesn't have TypeScript types
import { GIFEncoder, quantize, applyPalette } from "gifenc";

export interface GalleryPreviewGifOptions {
  maxFrames?: number;
  maxDurationSec?: number;
  maxDimension?: number;
  fps?: number;
}

function encodeFramesToGif(
  frames: ImageData[],
  width: number,
  height: number,
  fps: number,
): Blob {
  const gif = GIFEncoder();
  const frameDelay = Math.round(1000 / fps);

  for (const imageData of frames) {
    const palette = quantize(imageData.data, 256);
    const index = applyPalette(imageData.data, palette);
    gif.writeFrame(index, width, height, {
      palette,
      delay: frameDelay,
      dispose: 1,
    });
  }

  gif.finish();
  return new Blob([gif.bytes()], { type: "image/gif" });
}

async function captureGifFrames(
  sourceCanvas: HTMLCanvasElement,
  videoElement: HTMLVideoElement,
  fps: number,
  targetFrameCount: number,
  gifWidth: number,
  gifHeight: number,
  onProgress?: (progress: number) => void,
): Promise<ImageData[]> {
  const tempCanvas = document.createElement("canvas");
  tempCanvas.width = gifWidth;
  tempCanvas.height = gifHeight;
  const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
  if (!tempCtx) throw new Error("Failed to get canvas context");

  tempCtx.imageSmoothingEnabled = false;
  (tempCtx as CanvasRenderingContext2D & { mozImageSmoothingEnabled?: boolean }).mozImageSmoothingEnabled = false;
  (tempCtx as CanvasRenderingContext2D & { webkitImageSmoothingEnabled?: boolean }).webkitImageSmoothingEnabled = false;

  const capturedFrames: ImageData[] = [];
  const frameInterval = 1 / fps;
  let nextFrameTime = 0;
  let framesCaptured = 0;

  return new Promise((resolve, reject) => {
    const savedTime = videoElement.currentTime;
    const savedLoop = videoElement.loop;
    let animationFrameId = 0;
    let settled = false;

    const captureFrame = () => {
      tempCtx.drawImage(sourceCanvas, 0, 0, gifWidth, gifHeight);
      capturedFrames.push(tempCtx.getImageData(0, 0, gifWidth, gifHeight));
      framesCaptured++;
      if (onProgress) onProgress(framesCaptured / targetFrameCount);
      nextFrameTime += frameInterval;
    };

    const finish = () => {
      if (settled) return;
      settled = true;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      videoElement.removeEventListener("ended", onEnded);
      videoElement.pause();
      videoElement.loop = savedLoop;
      videoElement.currentTime = savedTime;
      resolve(capturedFrames);
    };

    const onEnded = () => {
      if (framesCaptured < targetFrameCount) {
        captureFrame();
      }
      finish();
    };

    const checkAndCaptureFrames = () => {
      while (
        videoElement.currentTime >= nextFrameTime &&
        framesCaptured < targetFrameCount &&
        !videoElement.paused &&
        !videoElement.ended
      ) {
        captureFrame();
      }

      if (framesCaptured >= targetFrameCount) {
        finish();
        return;
      }

      if (!videoElement.ended && framesCaptured < targetFrameCount) {
        animationFrameId = requestAnimationFrame(checkAndCaptureFrames);
      }
    };

    videoElement.currentTime = 0;
    videoElement.loop = false;
    videoElement.addEventListener("ended", onEnded);

    videoElement
      .play()
      .then(() => {
        animationFrameId = requestAnimationFrame(checkAndCaptureFrames);
      })
      .catch(reject);
  });
}

/** Short, lightweight GIF for gallery video previews (not full-length export). */
export async function createGalleryPreviewGif(
  sourceCanvas: HTMLCanvasElement,
  videoElement: HTMLVideoElement,
  options: GalleryPreviewGifOptions = {},
): Promise<{ blob: Blob; width: number; height: number }> {
  const maxFrames = options.maxFrames ?? 10;
  const maxDurationSec = options.maxDurationSec ?? 1.8;
  const maxDimension = options.maxDimension ?? 400;
  const fps = Math.min(10, options.fps ?? 8);

  const duration = Math.min(videoElement.duration || maxDurationSec, maxDurationSec);
  const targetFrameCount = Math.max(2, Math.min(maxFrames, Math.ceil(duration * fps)));

  const originalWidth = videoElement.videoWidth || sourceCanvas.width;
  const originalHeight = videoElement.videoHeight || sourceCanvas.height;
  const scale = Math.min(1, maxDimension / Math.max(originalWidth, originalHeight));
  const gifWidth = Math.max(1, Math.floor(originalWidth * scale));
  const gifHeight = Math.max(1, Math.floor(originalHeight * scale));

  const frames = await captureGifFrames(
    sourceCanvas,
    videoElement,
    fps,
    targetFrameCount,
    gifWidth,
    gifHeight,
  );

  if (frames.length < 2) {
    throw new Error("Could not capture enough frames for preview.");
  }

  const blob = encodeFramesToGif(frames, gifWidth, gifHeight, fps);
  return { blob, width: gifWidth, height: gifHeight };
}

export async function createGifFromCanvas(
  canvasRef: HTMLCanvasElement,
  videoElement: HTMLVideoElement,
  fps: number,
  onProgress?: (progress: number) => void,
): Promise<Blob> {
  const totalDuration = videoElement.duration;

  const gifFps = Math.min(20, fps);
  const targetFrameCount = Math.ceil(totalDuration * gifFps);

  const originalWidth = videoElement.videoWidth;
  const originalHeight = videoElement.videoHeight;

  const maxDimension = 480;
  const scale = Math.min(1, maxDimension / Math.max(originalWidth, originalHeight));
  const gifWidth = Math.floor(originalWidth * scale);
  const gifHeight = Math.floor(originalHeight * scale);

  const frames = await captureGifFrames(
    canvasRef,
    videoElement,
    gifFps,
    targetFrameCount,
    gifWidth,
    gifHeight,
    (p) => onProgress?.(p * 0.9),
  );

  if (onProgress) onProgress(0.95);
  const blob = encodeFramesToGif(frames, gifWidth, gifHeight, gifFps);
  if (onProgress) onProgress(1);
  return blob;
}
