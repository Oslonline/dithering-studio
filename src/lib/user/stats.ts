export type MediaDownloadKind = "image" | "svg" | "video";

export interface UserActivityStats {
  mediaDownloadsTotal: number;
  imageDownloads: number;
  videoDownloads: number;
  galleryPostsCount: number;
  lastDownloadAt: string | null;
}

export function emptyUserActivityStats(galleryPostsCount = 0): UserActivityStats {
  return {
    mediaDownloadsTotal: 0,
    imageDownloads: 0,
    videoDownloads: 0,
    galleryPostsCount,
    lastDownloadAt: null,
  };
}
