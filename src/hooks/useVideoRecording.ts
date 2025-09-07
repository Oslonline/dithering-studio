import { useCallback, useRef, useState } from 'react';

interface Params {
  videoItem: { url: string; name?: string } | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  videoHook: any;
  videoFps: number;
  setVideoPlaying: (v: boolean) => void;
}

export function useVideoRecording({ videoItem, canvasRef, videoHook, videoFps, setVideoPlaying }: Params) {
  const [recordingVideo, setRecordingVideo] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingMimeRef = useRef<string>('video/mp4');
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [videoExportFormat, setVideoExportFormat] = useState<'mp4' | 'webm'>('mp4');
  const [videoFormatNote, setVideoFormatNote] = useState<string | null>(null);
  const lastProgressRef = useRef(0);

  const pickBestVideoMime = useCallback((preferred: 'mp4' | 'webm') => {
    const mp4Candidates = [
      'video/mp4;codecs=avc1.42E01E',
      'video/mp4'
    ];
    const webmCandidates = [
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm'
    ];
    const tryList = preferred === 'mp4' ? [...mp4Candidates, ...webmCandidates] : [...webmCandidates, ...mp4Candidates];
    for (const c of tryList) {
      try { if ((window as any).MediaRecorder && MediaRecorder.isTypeSupported(c)) return c; } catch {}
    }
    return 'video/webm';
  }, []);

  const stopProgressLoop = useCallback(() => { /* no-op retained for API symmetry */ }, []);

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
      rec.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      rec.onerror = (e) => { setRecordingError((e as any).error?.message || 'Recorder error'); };
      let stopped = false;
      const finalize = () => {
        if (stopped) return;
        stopped = true;
        try {
          if (!recordedChunksRef.current.length) {
            try { rec.requestData(); } catch {}
            if (!recordedChunksRef.current.length) {
              setRecordingError('No data captured. Try switching codec (MP4/WebM) or lowering FPS.');
            }
          } else {
            const blob = new Blob(recordedChunksRef.current, { type: recordingMimeRef.current });
            const url = URL.createObjectURL(blob);
            setRecordedBlobUrl(url);
          }
        } catch (err: any) {
          setRecordingError(err?.message || 'Failed to finalize video');
        } finally {
          cleanupRecording();
          setRecordingVideo(false);
        }
      };
      rec.onstop = finalize;
      // Safety: ensure finalize even if onstop not fired (rare)
      const durationMs = ((videoHook as any).duration || 0) * 1000;
      const safety = setTimeout(() => { if (!stopped) { try { rec.requestData(); } catch {}; finalize(); } }, Math.max(2000, durationMs + 1500));
      const vEl = (videoHook as any).videoElRef?.current as HTMLVideoElement | null;
      if (vEl) {
        const prevLoop = vEl.loop;
        vEl.loop = false;
        vEl.currentTime = 0;
        const handleEnded = () => {
          // Flush last data then stop after short delay to allow final chunk
            try { rec.requestData(); } catch {}
            setTimeout(() => { try { rec.state === 'recording' && rec.stop(); } catch {}; }, 30);
            vEl.removeEventListener('ended', handleEnded);
            vEl.loop = prevLoop;
        };
        vEl.addEventListener('ended', handleEnded);
        const expectedDuration = (videoHook as any).duration || vEl.duration || 0;
        lastProgressRef.current = 0;
        const handleTimeUpdate = () => {
          const d = expectedDuration || vEl.duration || 0;
          if (!d) return;
            let prog = Math.min(1, (vEl.currentTime || 0) / d);
            if (prog < lastProgressRef.current) prog = lastProgressRef.current;
            lastProgressRef.current = prog;
            setRecordingProgress(prog);
        };
        vEl.addEventListener('timeupdate', handleTimeUpdate);
        rec.addEventListener('stop', () => { vEl.removeEventListener('timeupdate', handleTimeUpdate); setRecordingProgress(1); }, { once: true });
        vEl.play().catch(()=>{});
        setVideoPlaying(true);
      }
      setRecordingVideo(true);
      setRecordingProgress(0);
      // Use a timeslice to encourage interim data chunks in Firefox
      const timeslice = Math.max(250, Math.round(1000 / (videoFps || 12))); // ms
      try { rec.start(timeslice); } catch { rec.start(); }
      rec.addEventListener('stop', () => clearTimeout(safety), { once: true });
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
  stopProgressLoop();
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
