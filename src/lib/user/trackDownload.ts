import type { MediaDownloadKind } from "./stats";

/** Fire-and-forget: records a completed media download for the signed-in user. */
export function trackMediaDownload(kind: MediaDownloadKind): void {
  void fetch("/api/user/stats/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ kind }),
    keepalive: true,
  }).catch(() => {
    /* non-blocking */
  });
}
