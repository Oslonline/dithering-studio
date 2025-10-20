import { useEffect, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';
import LiveRegion from './LiveRegion';

interface ProcessingOverlayProps {
  isProcessing: boolean;
  progress?: number;
  operation?: string;
  estimatedTime?: number; // in seconds
  className?: string;
}

/**
 * Full-screen overlay showing processing progress
 * Displays loading spinner with elapsed/estimated time and progress bar
 */
const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({
  isProcessing,
  progress,
  operation = 'Processing',
  estimatedTime,
  className = '',
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [announcementMessage, setAnnouncementMessage] = useState('');

  useEffect(() => {
    if (!isProcessing) {
      setElapsedTime(0);
      setAnnouncementMessage('');
      return;
    }

    // Announce start of processing
    setAnnouncementMessage(`${operation} started`);

    const startTime = Date.now();
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [isProcessing, operation]);

  // Announce progress milestones
  useEffect(() => {
    if (!isProcessing || progress === undefined) return;

    if (progress === 25 || progress === 50 || progress === 75) {
      setAnnouncementMessage(`${operation} ${progress}% complete`);
    } else if (progress === 100) {
      setAnnouncementMessage(`${operation} complete`);
    }
  }, [progress, isProcessing, operation]);

  if (!isProcessing) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const remainingTime = estimatedTime && progress
    ? Math.max(0, Math.round((estimatedTime / 100) * (100 - progress) - elapsedTime))
    : undefined;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/60 animate-fade-in ${className}`}
      role="dialog"
      aria-modal="true"
      aria-label="Processing"
    >
      <div className="min-panel-alt p-8 max-w-sm w-full mx-4 animate-scale-in">
        <LoadingSpinner
          progress={progress}
          size="lg"
          label={operation}
          className="mb-4"
        />

        {/* Time indicators */}
        <div className="mt-6 space-y-2 text-center">
          <div className="flex justify-between items-center text-xs font-mono text-[var(--c-text-dim)]">
            <span>Elapsed: {formatTime(elapsedTime)}</span>
            {remainingTime !== undefined && (
              <span>~{formatTime(remainingTime)} left</span>
            )}
          </div>

          {/* Progress bar */}
          {progress !== undefined && (
            <div className="w-full h-1.5 bg-[var(--c-border)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--c-accent)] transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Helpful tip during long operations */}
        {elapsedTime > 5 && (
          <div className="mt-4 p-3 bg-[var(--c-panel)] border border-[var(--c-border)] rounded text-xs text-[var(--c-text-dim)] animate-slide-in-up">
            💡 Tip: Processing large images? Try reducing the working resolution
            for faster results.
          </div>
        )}
      </div>

      <LiveRegion message={announcementMessage} priority="polite" />
    </div>
  );
};

export default ProcessingOverlay;
