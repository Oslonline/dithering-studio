import type { GallerySettingsV1 } from "./types";

export const GALLERY_PUBLISH_DRAFT_KEY = "ds_gallery_publish_draft";

export interface GalleryPublishDraft {
  settings: GallerySettingsV1;
  templateUrl: string;
  resultDataUrl: string;
  originalDataUrl: string;
  resultWidth: number;
  resultHeight: number;
  /** MIME of the result preview (webp still for images, gif for video). */
  resultMime?: "image/webp" | "image/gif";
  createdAt: string;
}

export function savePublishDraft(draft: GalleryPublishDraft): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(GALLERY_PUBLISH_DRAFT_KEY, JSON.stringify(draft));
}

export function loadPublishDraft(): GalleryPublishDraft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(GALLERY_PUBLISH_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as GalleryPublishDraft;
  } catch {
    return null;
  }
}

export function clearPublishDraft(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(GALLERY_PUBLISH_DRAFT_KEY);
}

function mimeFromDataUrl(dataUrl: string): string {
  return dataUrl.match(/^data:([^;]+);/)?.[1] ?? "image/webp";
}

export async function dataUrlToBlob(dataUrl: string): Promise<Blob> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const type = blob.type || mimeFromDataUrl(dataUrl);
  if (blob.type === type) return blob;
  return new Blob([await blob.arrayBuffer()], { type });
}

export async function dataUrlToFile(dataUrl: string, filename: string): Promise<File> {
  const blob = await dataUrlToBlob(dataUrl);
  const mimeFromName = filename.endsWith(".gif")
    ? "image/gif"
    : filename.endsWith(".png")
      ? "image/png"
      : filename.endsWith(".jpeg") || filename.endsWith(".jpg")
        ? "image/jpeg"
        : "image/webp";
  const type = blob.type || mimeFromDataUrl(dataUrl) || mimeFromName;
  return new File([blob], filename, { type });
}
