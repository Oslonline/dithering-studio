import React, { useEffect, useRef } from 'react';

interface ExportDialogProps {
  open: boolean;
  onClose: () => void;
  videoMode: boolean;
  image: string | null;
  videoItem: { url: string; name?: string } | null;
  webpSupported: boolean;
  processedCanvasRef: React.RefObject<HTMLCanvasElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  downloadImageAs: (fmt: 'png' | 'jpeg' | 'webp') => void;
  downloadAsSVG: () => void;
  // Recording
  recordingVideo: boolean;
  startVideoExport: () => void;
  cancelVideoExport: () => void;
  recordedBlobUrl: string | null;
  recordingProgress: number;
  recordingError: string | null;
  videoExportFormat: 'mp4' | 'webm';
  setVideoExportFormat: (f: 'mp4' | 'webm') => void;
  videoFormatNote: string | null;
  recordingMimeType: string;
  setRecordedBlobUrl: React.Dispatch<React.SetStateAction<string | null>>;
  onVideoDownload?: (format: string) => void;
}

const ExportDialog: React.FC<ExportDialogProps> = ({
  open,
  onClose,
  videoMode,
  image,
  videoItem,
  webpSupported,
  processedCanvasRef,
  canvasRef,
  downloadImageAs,
  downloadAsSVG,
  recordingVideo,
  startVideoExport,
  cancelVideoExport,
  recordedBlobUrl,
  recordingProgress,
  recordingError,
  videoExportFormat,
  setVideoExportFormat,
  videoFormatNote,
  recordingMimeType,
  setRecordedBlobUrl,
  onVideoDownload
}) => {
  const downloadRef = useRef<HTMLDivElement | null>(null);

  // Outside click & ESC close
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!downloadRef.current) return;
      if (!downloadRef.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDocClick); document.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  if (!open || !((image && !videoMode) || (videoMode && videoItem))) return null;

  const copyFrameToClipboard = () => {
    const canvas = processedCanvasRef.current || canvasRef.current;
    if (!canvas) return;
    canvas.toBlob(b => {
      if (!b) return;
      const item = new ClipboardItem({ 'image/png': b });
      navigator.clipboard?.write([item]).catch(()=>{});
    }, 'image/png');
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div ref={downloadRef} className="relative w-full max-w-md rounded border border-neutral-800 bg-[#111] p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-xs tracking-wide text-gray-300">{videoMode ? 'Export Frame or Video' : 'Export Result'}</h2>
          <button onClick={onClose} className="clean-btn px-2 py-0 text-[11px]">✕</button>
        </div>
        <div className="mb-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-mono text-[11px] tracking-wide text-gray-400">Frame Export</span>
            {videoMode && <span className="text-[10px] text-gray-500">Current processed frame</span>}
          </div>
          <div className="grid grid-cols-4 gap-2">
            <button onClick={() => downloadImageAs('png')} className="clean-btn w-full text-[11px]">PNG</button>
            <button onClick={() => downloadImageAs('jpeg')} className="clean-btn w-full text-[11px]">JPEG</button>
            <button onClick={() => downloadImageAs('webp')} disabled={!webpSupported} className={`clean-btn w-full text-[11px] ${!webpSupported ? 'cursor-not-allowed opacity-40' : ''}`}>WEBP</button>
            {!videoMode && (
              <button onClick={downloadAsSVG} className="clean-btn w-full text-[11px]">SVG</button>
            )}
            <button onClick={copyFrameToClipboard} className="clean-btn w-full text-[11px]">Clipboard</button>
          </div>
        </div>
        {videoMode && (
          <div className="mb-4 space-y-3">
            <div className="border-t border-neutral-800 my-3" />
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-wide text-gray-400">Full Video Export</span>
              <div className="flex items-center gap-2 text-[10px] text-gray-500">
                <label className="flex items-center gap-1">
                  <span className="text-gray-400">Format</span>
                  <select value={videoExportFormat} onChange={e => { const val = e.target.value === 'mp4' ? 'mp4':'webm'; setVideoExportFormat(val); setRecordedBlobUrl(r=>{ if(r) URL.revokeObjectURL(r); return null; }); }} className="clean-input !h-7 !px-2 !py-0 text-[10px]">
                    <option value="mp4">MP4</option>
                    <option value="webm">WebM</option>
                  </select>
                </label>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={startVideoExport} disabled={recordingVideo} className={`clean-btn px-3 py-1 text-[11px] ${recordingVideo ? 'cursor-not-allowed opacity-50' : ''}`}>Record</button>
              {recordingVideo && <button onClick={cancelVideoExport} className="clean-btn px-3 py-1 text-[11px]">Stop</button>}
              {recordedBlobUrl && (
                <a
                  href={recordedBlobUrl}
                  download={`dithered-video.${recordingMimeType.includes('mp4') ? 'mp4' : 'webm'}`}
                  className="clean-btn px-3 py-1 text-[11px]"
                  onClick={() => onVideoDownload?.(recordingMimeType.includes('mp4') ? 'mp4' : 'webm')}
                >
                  Download
                </a>
              )}
            </div>
            {videoFormatNote && <p className="text-[10px] text-amber-400">{videoFormatNote}</p>}
            {recordingVideo && (
              <div className="flex items-center gap-2 text-[10px] text-gray-400">
                <div className="h-1 flex-1 rounded bg-neutral-800 overflow-hidden">
                  <div className="h-full bg-blue-500 transition-all" style={{ width: `${(recordingProgress * 100).toFixed(1)}%` }} />
                </div>
                <span>{(recordingProgress * 100).toFixed(0)}%</span>
              </div>
            )}
            {recordingError && <p className="text-[10px] text-red-500">{recordingError}</p>}
            {recordedBlobUrl && !recordingVideo && <p className="text-[10px] text-gray-500">Finished. Download ready.</p>}
          </div>
        )}
        {videoMode && (
          <div className="mb-4 space-y-3">
            <div className="border-t border-neutral-800 pt-3" />
            <div className="space-y-1 text-[10px] leading-snug text-gray-500">
              <p><span className="font-semibold text-gray-400">Frame Export:</span> PNG (lossless), JPEG (smaller), WEBP {webpSupported ? '(modern)' : '(unsupported)'} clipboard copy.</p>
              <p><span className="font-semibold text-gray-400">Full Video:</span> {recordingMimeType.includes('mp4') ? 'MP4 (H.264/AAC if supported)' : 'WebM (VP8/VP9 + Opus)'} — Windows legacy players may need codecs for WebM.</p>
            </div>
          </div>
        )}
        {!videoMode && (
          <p className="mb-4 text-[10px] leading-snug text-gray-500">PNG (lossless), JPEG (smaller), WEBP {webpSupported ? '(modern)' : '(unsupported)'}; SVG vector (large for big images).</p>
        )}
      </div>
    </div>
  );
};

export default ExportDialog;
