import { useRef, useState, useEffect, useCallback, ReactNode } from 'react';
import { FiZoomIn, FiZoomOut, FiMaximize2 } from 'react-icons/fi';

interface CanvasViewportProps {
  children: ReactNode;
  className?: string;
}

interface Transform {
  x: number;
  y: number;
  scale: number;
}

/**
 * Figma-like canvas viewport with pan, zoom, and fit controls
 * Supports mouse drag to pan, scroll wheel to zoom, and keyboard shortcuts
 */
const CanvasViewport: React.FC<CanvasViewportProps> = ({ children, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState<Transform>({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, transformX: 0, transformY: 0 });

  const MIN_SCALE = 0.1;
  const MAX_SCALE = 32;
  const ZOOM_STEP = 0.1;

  // Fit content to viewport
  const fitToScreen = useCallback(() => {
    if (!containerRef.current || !contentRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const content = contentRef.current.firstElementChild as HTMLElement;
    if (!content) return;

    const contentRect = content.getBoundingClientRect();
    const contentWidth = contentRect.width / transform.scale;
    const contentHeight = contentRect.height / transform.scale;

    const scaleX = (container.width - 80) / contentWidth;
    const scaleY = (container.height - 80) / contentHeight;
    const newScale = Math.min(scaleX, scaleY, 1);

    const x = (container.width - contentWidth * newScale) / 2;
    const y = (container.height - contentHeight * newScale) / 2;

    setTransform({ x, y, scale: newScale });
  }, [transform.scale]);

  // Zoom in/out
  const zoomIn = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      scale: Math.min(prev.scale + ZOOM_STEP, MAX_SCALE)
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setTransform(prev => ({
      ...prev,
      scale: Math.max(prev.scale - ZOOM_STEP, MIN_SCALE)
    }));
  }, []);

  const resetZoom = useCallback(() => {
    setTransform({ x: 0, y: 0, scale: 1 });
  }, []);

  // Mouse drag to pan
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Left click only
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      transformX: transform.x,
      transformY: transform.y
    };
  }, [transform.x, transform.y]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    setTransform(prev => ({
      ...prev,
      x: dragStartRef.current.transformX + dx,
      y: dragStartRef.current.transformY + dy
    }));
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Scroll wheel to zoom
  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();

    if (!containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - container.left;
    const mouseY = e.clientY - container.top;

    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, transform.scale + delta));
    const scaleRatio = newScale / transform.scale;

    setTransform(prev => ({
      scale: newScale,
      x: mouseX - (mouseX - prev.x) * scaleRatio,
      y: mouseY - (mouseY - prev.y) * scaleRatio
    }));
  }, [transform.scale]);

  // Event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '0') {
          e.preventDefault();
          fitToScreen();
        } else if (e.key === '1') {
          e.preventDefault();
          resetZoom();
        } else if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          zoomIn();
        } else if (e.key === '-') {
          e.preventDefault();
          zoomOut();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [fitToScreen, resetZoom, zoomIn, zoomOut]);

  // Fit to screen on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      fitToScreen();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const zoomPercentage = Math.round(transform.scale * 100);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Viewport Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="clean-btn p-2 bg-neutral-900/90 hover:bg-neutral-800/90"
            title="Zoom out (Ctrl+-)"
            aria-label="Zoom out"
          >
            <FiZoomOut size={14} />
          </button>
          
          <div className="clean-btn p-2 bg-neutral-900/90 cursor-default font-mono text-[10px] min-w-[60px] text-center">
            {zoomPercentage}%
          </div>
          
          <button
            onClick={zoomIn}
            className="clean-btn p-2 bg-neutral-900/90 hover:bg-neutral-800/90"
            title="Zoom in (Ctrl++)"
            aria-label="Zoom in"
          >
            <FiZoomIn size={14} />
          </button>
          
          <button
            onClick={fitToScreen}
            className="clean-btn p-2 bg-neutral-900/90 hover:bg-neutral-800/90"
            title="Fit to screen (Ctrl+0)"
            aria-label="Fit to screen"
          >
            <FiMaximize2 size={14} />
          </button>
        </div>
        
        {/* Keyboard shortcuts hint - only show on desktop */}
        <div className="hidden md:block pointer-events-none select-none rounded bg-neutral-900/70 px-3 py-1 font-mono text-[10px] tracking-wide text-gray-300">
          F = focus • G = grid • Shift+G = resize
        </div>
      </div>

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full bg-neutral-950"
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div
          ref={contentRef}
          style={{
            transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease-out',
            willChange: 'transform'
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default CanvasViewport;
