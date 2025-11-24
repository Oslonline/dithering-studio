import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

interface VideoControlsProps {
  videoElRef: React.RefObject<HTMLVideoElement | null>;
  videoPlaying: boolean;
  setVideoPlaying: (playing: boolean) => void;
  videoCurrentTime: number;
  videoDuration: number;
  videoFps: number;
  setVideoFps: (fps: number) => void;
  videoReady: boolean;
}

const VideoControls: React.FC<VideoControlsProps> = ({
  videoElRef,
  videoPlaying,
  setVideoPlaying,
  videoCurrentTime,
  videoDuration,
  videoFps,
  setVideoFps,
  videoReady,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    const video = videoElRef.current;
    if (video && videoReady) {
      const syncState = () => {
        setVideoPlaying(!video.paused);
      };
      
      syncState();
      
      video.addEventListener('play', syncState);
      video.addEventListener('pause', syncState);
      
      return () => {
        video.removeEventListener('play', syncState);
        video.removeEventListener('pause', syncState);
      };
    }
  }, [videoElRef, videoReady, setVideoPlaying]);

  const handlePlayPause = () => {
    const video = videoElRef.current;
    if (!video) return;
    
    if (videoPlaying) {
      video.pause();
      setVideoPlaying(false);
    } else {
      video.play().catch(() => {});
      setVideoPlaying(true);
    }
  };

  const handleRestart = () => {
    const video = videoElRef.current;
    if (video) {
      video.currentTime = 0;
      if (videoPlaying) {
        video.play().catch(() => {});
      }
    }
  };

  const handleSkipBackward = () => {
    const video = videoElRef.current;
    if (video && isFinite(video.duration)) {
      video.currentTime = Math.max(0, video.currentTime - 5);
    }
  };

  const handleSkipForward = () => {
    const video = videoElRef.current;
    if (video && isFinite(video.duration)) {
      const duration = video.duration;
      const newTime = Math.min(duration, video.currentTime + 5);
      // Prevent seeking past end which can cause freeze on short videos
      video.currentTime = Math.min(newTime, duration - 0.1);
    }
  };

  const handleSeekBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoElRef.current;
    if (video) {
      video.currentTime = Number(e.target.value);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-panel p-0">
      <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-left font-mono text-[11px] tracking-wide text-gray-300">
        <span className="flex items-center gap-2">
          <span>▾</span> Video
        </span>
        <span className="text-[10px] text-gray-500">
          {formatTime(videoCurrentTime)} / {formatTime(videoDuration)}
        </span>
      </button>
      <div className="space-y-3 border-t border-neutral-800 px-4 pt-3 pb-4">
        {/* Time display */}
        <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono tabular-nums">
          <span>{formatTime(videoCurrentTime)}</span>
          <span>{formatTime(videoDuration)}</span>
        </div>

        {/* Seek bar */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={videoDuration || 0}
            step={0.1}
            value={videoCurrentTime}
            onChange={handleSeekBarChange}
            className="clean-range flex-1"
            disabled={!videoReady}
          />
        </div>

        {/* Playback controls - centered */}
        <div className="flex items-center justify-center gap-1">
          <button
            type="button"
            onClick={handleRestart}
            className="clean-btn px-2.5 py-1.5 text-[11px] leading-none"
            title="Restart video"
            disabled={!videoReady}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={handleSkipBackward}
            className="clean-btn px-2.5 py-1.5 text-[11px] leading-none"
            title="Rewind 5 seconds"
            disabled={!videoReady}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 18V6l-8.5 6zm.5-6l8.5 6V6z"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={handlePlayPause}
            className="clean-btn px-3 py-1.5 text-[11px] leading-none"
            title={videoPlaying ? 'Pause' : 'Play'}
            disabled={!videoReady}
          >
            {videoPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 4h4v16H6zm8 0h4v16h-4z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={handleSkipForward}
            className="clean-btn px-2.5 py-1.5 text-[11px] leading-none"
            title="Forward 5 seconds"
            disabled={!videoReady}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 18l8.5-6L4 6zm9.5 0l8.5-6-8.5-6z"/>
            </svg>
          </button>
        </div>

        {/* FPS control */}
        <div className="flex items-center justify-between gap-2 text-[10px] text-gray-400">
          <span className="uppercase tracking-wider">{t('tool.fps')}</span>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={2}
              max={30}
              value={videoFps}
              onChange={(e) => setVideoFps(Number(e.target.value))}
              className="clean-range !w-24"
            />
            <span className="w-6 text-right tabular-nums font-mono">{videoFps}</span>
          </div>
        </div>

        {!videoReady && <p className="text-[10px] text-gray-500">{t('tool.videoPanel.loadingMetadata')}</p>}
      </div>
    </div>
  );
};

export default VideoControls;
