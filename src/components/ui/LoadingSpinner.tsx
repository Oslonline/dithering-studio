import { useEffect, useState } from 'react';

interface LoadingSpinnerProps {
  progress?: number; // 0-100, undefined for indeterminate
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

/**
 * Loading spinner component that matches the app's design system
 * Supports both determinate (with progress) and indeterminate modes
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  progress,
  size = 'md',
  label,
  className = '',
}) => {
  const [dots, setDots] = useState('');

  // Animate dots for indeterminate state
  useEffect(() => {
    if (progress === undefined) {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
      }, 500);
      return () => clearInterval(interval);
    }
  }, [progress]);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const strokeWidth = {
    sm: 2,
    md: 3,
    lg: 4,
  };

  const textSize = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-sm',
  };

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset =
    progress !== undefined
      ? circumference - (progress / 100) * circumference
      : 0;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        <svg
          className="transform -rotate-90"
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
        >
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--c-border-strong)"
            strokeWidth={strokeWidth[size]}
          />

          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="var(--c-accent)"
            strokeWidth={strokeWidth[size]}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition:
                progress !== undefined
                  ? 'stroke-dashoffset 0.3s ease'
                  : 'none',
              animation:
                progress === undefined ? 'spin 1s linear infinite' : 'none',
            }}
          />
        </svg>

        {/* Progress percentage */}
        {progress !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className={`font-mono ${textSize[size]}`}
              style={{ color: 'var(--c-text-dim)' }}
            >
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>

      {/* Label */}
      {label && (
        <div
          className={`font-mono ${textSize[size]} text-center`}
          style={{ color: 'var(--c-text-dim)' }}
        >
          {label}
          {progress === undefined && dots}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to {
            stroke-dashoffset: ${circumference * 2};
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSpinner;
