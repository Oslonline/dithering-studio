import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface ImageComparisonProps {
  beforeImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  width?: string;
  height?: string;
  className?: string;
}

/**
 * Interactive slider overlay to reveal original image over processed canvas
 * The "after" (processed) image is the canvas underneath - this just shows the "before" (original)
 */
const ImageComparison: React.FC<ImageComparisonProps> = ({
  beforeImage,
  beforeLabel,
  afterLabel,
  width,
  height,
  className = '',
}) => {
  const { t } = useTranslation();
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use translations as defaults if not provided
  const beforeLabelText = beforeLabel || t('tool.imageComparison.original');
  const afterLabelText = afterLabel || t('tool.imageComparison.dithered');

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setSliderPosition(percent);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent CanvasViewport from starting pan
    setIsDragging(true);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation(); // Prevent CanvasViewport from starting pan
    setIsDragging(true);
  };
  
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging && e.touches[0]) {
      handleMove(e.touches[0].clientX);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleContainerMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent CanvasViewport from starting pan on any click inside
  };

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden ${className}`}
      onMouseDown={handleContainerMouseDown}
      style={{ 
        touchAction: 'none',
        width: width || 'auto',
        height: height || 'auto',
        pointerEvents: 'auto'
      }}
    >
      {/* Before image (clipped by slider) - shows original image */}
      {/* The processed image is the canvas underneath, which shows through where this doesn't cover */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img
          src={beforeImage}
          alt={beforeLabelText}
          className="w-full h-full block pixelated object-contain"
          draggable={false}
          style={{
            width: width || 'auto',
            height: height || 'auto'
          }}
        />
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-xs font-mono text-white border border-white/20 pointer-events-none">
          {beforeLabelText}
        </div>
      </div>

      {/* Dithered label (always visible on the right side) */}
      <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur-sm rounded text-xs font-mono text-white border border-white/20 pointer-events-none">
        {afterLabelText}
      </div>

      {/* Slider */}
      <div
        className="absolute inset-y-0 w-1 bg-white cursor-ew-resize z-10"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        role="slider"
        aria-label={t('common.ariaImageComparison')}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(sliderPosition)}
        aria-valuetext={t('tool.imageComparison.percentVisible', { percent: Math.round(sliderPosition) })}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            setSliderPosition(Math.max(0, sliderPosition - 5));
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            setSliderPosition(Math.min(100, sliderPosition + 5));
          } else if (e.key === 'Home') {
            e.preventDefault();
            setSliderPosition(0);
          } else if (e.key === 'End') {
            e.preventDefault();
            setSliderPosition(100);
          }
        }}
      >
        {/* Slider handle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            className="text-gray-800"
          >
            <path
              d="M6 9l-3 3 3 3M14 9l3 3-3 3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Vertical line extensions */}
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-white/80" />
      </div>

      {/* Instructions on first interaction */}
      {!isDragging && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-black/70 backdrop-blur-sm rounded text-xs font-mono text-white/80 border border-white/20 animate-pulse-subtle pointer-events-none">
          {t('tool.imageComparison.dragToCompare')}
        </div>
      )}
    </div>
  );
};

export default ImageComparison;
