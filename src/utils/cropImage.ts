export interface NormalizedCropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const FULL_CROP: NormalizedCropRect = { x: 0, y: 0, width: 1, height: 1 };

export function resolveCropRegion(
  sourceWidth: number,
  sourceHeight: number,
  crop?: NormalizedCropRect | null,
): { sx: number; sy: number; sw: number; sh: number } {
  const c = crop ?? FULL_CROP;
  return {
    sx: Math.round(c.x * sourceWidth),
    sy: Math.round(c.y * sourceHeight),
    sw: Math.max(1, Math.round(c.width * sourceWidth)),
    sh: Math.max(1, Math.round(c.height * sourceHeight)),
  };
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image."));
    img.src = url;
  });
}

export function isFullCrop(c?: NormalizedCropRect | null): boolean {
  if (!c) return true;
  return c.x <= 0.001 && c.y <= 0.001 && c.width >= 0.999 && c.height >= 0.999;
}

export function captureVideoFrameDataUrl(video: HTMLVideoElement): string {
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) throw new Error("Video frame is not ready.");
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare crop preview.");
  ctx.drawImage(video, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", 0.92);
}

export async function cropImageFromUrl(
  imageUrl: string,
  rect: NormalizedCropRect,
): Promise<{ url: string; width: number; height: number }> {
  const img = await loadImage(imageUrl);
  const sx = Math.round(rect.x * img.width);
  const sy = Math.round(rect.y * img.height);
  const sw = Math.max(1, Math.round(rect.width * img.width));
  const sh = Math.max(1, Math.round(rect.height * img.height));

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not prepare crop canvas.");

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

  let url: string;
  try {
    url = canvas.toDataURL("image/webp", 0.92);
    if (!url.startsWith("data:image/webp")) {
      url = canvas.toDataURL("image/png");
    }
  } catch {
    url = canvas.toDataURL("image/png");
  }

  return { url, width: sw, height: sh };
}
