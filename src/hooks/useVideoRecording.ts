import { useCallback, useEffect, useRef, useState } from 'react';

interface Params {
  videoMode: boolean;
  videoItem: { url: string; name?: string } | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  videoHook: any;
  videoFps: number;
  setVideoPlaying: (v: boolean) => void;
}

export function useVideoRecording({ videoMode, videoItem, canvasRef, videoHook, videoFps, setVideoPlaying }: Params) {
  const [recordingVideo, setRecordingVideo] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingMimeRef = useRef<string>('video/mp4');
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [videoExportFormat, setVideoExportFormat] = useState<'mp4' | 'webm'>('mp4');
  const [videoFormatNote, setVideoFormatNote] = useState<string | null>(null);

  const pickBestVideoMime = useCallback((preferred: 'mp4' | 'webm') => {
    const mp4Candidates = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
      'video/mp4'
    ];
    const webmCandidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm'
    ];
    const tryList = preferred === 'mp4' ? [...mp4Candidates, ...webmCandidates] : [...webmCandidates, ...mp4Candidates];
    for (const c of tryList) {
      try { if ((window as any).MediaRecorder && MediaRecorder.isTypeSupported(c)) return c; } catch {}
    }
    return 'video/webm';
  }, []);

  // Track progress relative to video timeline
  useEffect(() => {
    if (!videoMode || !videoItem || !recordingVideo) return;
    const duration = videoMode ? (videoHook as any).duration : 0;
    const current = videoMode ? (videoHook as any).currentTime : 0;
    if (!duration) return;
    setRecordingProgress(Math.min(1, current / duration));
    if (current >= duration - 0.01) {
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
      setRecordingVideo(false);
    }
  }, [videoMode, videoItem, recordingVideo, videoHook]);

  const cleanupRecording = useCallback(() => {
    recorderRef.current = null;
    recordedChunksRef.current = [];
  }, []);

  const startVideoExport = useCallback(() => {
    if (!canvasRef.current || !videoItem || recordingVideo) return;
    setRecordingError(null);
    setRecordedBlobUrl(r => { if (r) URL.revokeObjectURL(r); return null; });
    recordedChunksRef.current = [];
    const mime = pickBestVideoMime(videoExportFormat);
    recordingMimeRef.current = mime;
    if (videoExportFormat === 'mp4' && !mime.includes('mp4')) {
      setVideoFormatNote('MP4 not supported by this browser; fell back to WebM.');
    } else if (videoExportFormat === 'webm' && mime.includes('mp4')) {
      setVideoFormatNote('Browser forced MP4 despite WebM preference.');
    } else {
      setVideoFormatNote(null);
    }
    try {
      const stream = (canvasRef.current as HTMLCanvasElement).captureStream(videoFps || 12);
      const rec = new MediaRecorder(stream, { mimeType: mime });
      recorderRef.current = rec;
      rec.ondataavailable = (e) => { if (e.data && e.data.size) recordedChunksRef.current.push(e.data); };
      rec.onerror = (e) => { setRecordingError((e as any).error?.message || 'Recorder error'); };
      rec.onstop = () => {
        try {
          const blob = new Blob(recordedChunksRef.current, { type: recordingMimeRef.current });
          const url = URL.createObjectURL(blob);
          setRecordedBlobUrl(url);
        } catch (err: any) {
          setRecordingError(err?.message || 'Failed to finalize video');
        } finally {
          cleanupRecording();
        }
      };
      const vEl = (videoHook as any).videoElRef?.current as HTMLVideoElement | null;
      if (vEl) {
        vEl.currentTime = 0;
        vEl.play().catch(()=>{});
        setVideoPlaying(true);
      }
      setRecordingVideo(true);
      setRecordingProgress(0);
      rec.start();
    } catch (err: any) {
      setRecordingError(err?.message || 'Failed to start recording');
      cleanupRecording();
    }
  }, [canvasRef, videoItem, recordingVideo, pickBestVideoMime, videoExportFormat, videoFps, videoHook, setVideoPlaying, cleanupRecording]);

  const cancelVideoExport = useCallback(() => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }
    setRecordingVideo(false);
  }, []);

  return {
    recordingVideo,
    recordingProgress,
    recordingError,
    startVideoExport,
    cancelVideoExport,
    recordedBlobUrl,
    videoExportFormat,
    setVideoExportFormat,
    videoFormatNote,
    recordingMimeRef,
    setRecordedBlobUrl,
  };
}

export default useVideoRecording;
