/**
 * GIF encoder using gifenc library
 * Creates animated GIF from canvas frames by capturing during playback
 */

// @ts-ignore - gifenc doesn't have TypeScript types
import { GIFEncoder, quantize, applyPalette } from 'gifenc';

export async function createGifFromCanvas(
  canvasRef: HTMLCanvasElement,
  videoElement: HTMLVideoElement,
  fps: number,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const totalDuration = videoElement.duration;
  
  // Optimize GIF settings
  const gifFps = Math.min(20, fps); // Cap at 20fps for GIF format
  const targetFrameCount = Math.ceil(totalDuration * gifFps);
  const frameInterval = 1 / gifFps; // Time between frames in seconds
  
  // Downsample resolution for smaller file size
  const maxDimension = 480;
  const scale = Math.min(1, maxDimension / Math.max(canvasRef.width, canvasRef.height));
  const gifWidth = Math.floor(canvasRef.width * scale);
  const gifHeight = Math.floor(canvasRef.height * scale);
  
  // Create temporary canvas for resizing
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = gifWidth;
  tempCanvas.height = gifHeight;
  const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true });
  if (!tempCtx) throw new Error('Failed to get canvas context');

  const gif = GIFEncoder();
  
  const capturedFrames: ImageData[] = [];
  let nextFrameTime = 0;
  let framesCaptured = 0;

  return new Promise((resolve, reject) => {
    // Reset video to start
    videoElement.currentTime = 0;
    videoElement.loop = false;
    
    let animationFrameId: number;
    
    const captureFrame = () => {
      // Draw current dithered canvas to temp canvas
      tempCtx.drawImage(canvasRef, 0, 0, gifWidth, gifHeight);
      const imageData = tempCtx.getImageData(0, 0, gifWidth, gifHeight);
      capturedFrames.push(imageData);
      framesCaptured++;
      
      if (onProgress) {
        onProgress(framesCaptured / targetFrameCount * 0.9);
      }
      
      nextFrameTime += frameInterval;
    };
    
    const checkAndCaptureFrames = () => {
      // Capture all frames that should have been captured by now
      while (videoElement.currentTime >= nextFrameTime && framesCaptured < targetFrameCount && !videoElement.paused && !videoElement.ended) {
        captureFrame();
      }
      
      // Continue capturing if video is still playing
      if (!videoElement.ended && framesCaptured < targetFrameCount) {
        animationFrameId = requestAnimationFrame(checkAndCaptureFrames);
      }
    };
    
    const onEnded = async () => {
      try {
        // Cancel animation frame loop
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
        }
        
        // Capture final frame if needed
        if (framesCaptured < targetFrameCount) {
          captureFrame();
        }
        
        console.log(`Captured ${capturedFrames.length} frames at ${gifFps}fps, encoding GIF...`);
        
        // Encode all frames into GIF
        const frameDelay = Math.round(1000 / gifFps);
        
        for (let i = 0; i < capturedFrames.length; i++) {
          const imageData = capturedFrames[i];
          const palette = quantize(imageData.data, 256);
          const index = applyPalette(imageData.data, palette);
          
          gif.writeFrame(index, gifWidth, gifHeight, {
            palette,
            delay: frameDelay,
            dispose: 1,
          });
          
          if (onProgress && i % 10 === 0) {
            onProgress(0.9 + (i / capturedFrames.length) * 0.1);
          }
        }
        
        gif.finish();
        const buffer = gif.bytes();
        const blob = new Blob([buffer], { type: 'image/gif' });
        
        console.log(`GIF complete: ${(blob.size / 1024).toFixed(1)}KB, ${capturedFrames.length} frames`);
        resolve(blob);
      } catch (err) {
        reject(err);
      } finally {
        videoElement.removeEventListener('ended', onEnded);
      }
    };
    
    videoElement.addEventListener('ended', onEnded);
    
    // Start playback and frame capture loop
    videoElement.play().then(() => {
      animationFrameId = requestAnimationFrame(checkAndCaptureFrames);
    }).catch(reject);
  });
}
