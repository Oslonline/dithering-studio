import React, { ReactNode, useRef, useState, useEffect } from 'react';

interface ResizableSidebarProps {
  children: ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  side?: 'left' | 'right';
  className?: string;
}

const ResizableSidebar: React.FC<ResizableSidebarProps> = ({
  children,
  defaultWidth = 320,
  minWidth = 240,
  maxWidth = 600,
  side = 'left',
  className = ''
}) => {
  const storageKey = `sidebar-width-${side}`;
  const [width, setWidth] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
          return parsed;
        }
      }
    } catch {}
    return defaultWidth;
  });

  const [isDragging, setIsDragging] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!sidebarRef.current) return;
      
      const rect = sidebarRef.current.getBoundingClientRect();
      const newWidth = side === 'left' 
        ? e.clientX - rect.left 
        : rect.right - e.clientX;
      
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setWidth(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      try {
        localStorage.setItem(storageKey, width.toString());
      } catch {}
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, side, minWidth, maxWidth, width, storageKey]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <aside
      ref={sidebarRef}
      style={{ width: `${width}px` }}
      className={`relative flex-shrink-0 ${className}`}
    >
      {children}
      
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`absolute top-0 ${side === 'left' ? 'right-0' : 'left-0'} bottom-0 w-1 cursor-col-resize group hover:bg-blue-500/20 transition-colors ${isDragging ? 'bg-blue-500/30' : ''}`}
        style={{ touchAction: 'none' }}
      >
        <div className={`absolute top-0 bottom-0 ${side === 'left' ? '-right-1' : '-left-1'} w-3`} />
        {isDragging && (
          <div className="absolute inset-y-0 left-1/2 w-px bg-blue-500" />
        )}
      </div>

      {/* Visual indicator */}
      <style>{`
        .cursor-col-resize {
          cursor: col-resize;
        }
        .cursor-col-resize:active {
          cursor: col-resize !important;
        }
      `}</style>
    </aside>
  );
};

export default ResizableSidebar;
