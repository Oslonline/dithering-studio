import React, { ReactNode } from 'react';

interface CollapsiblePanelProps {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
}

const CollapsiblePanel: React.FC<CollapsiblePanelProps> = ({ 
  title, 
  subtitle, 
  defaultOpen = true, 
  children,
  className = ''
}) => {
  const [open, setOpen] = React.useState(defaultOpen);

  return (
    <div className={`min-panel p-0 ${className}`}>
      <button 
        type="button" 
        onClick={() => setOpen(o => !o)} 
        className="flex w-full items-center justify-between px-4 py-3 text-left font-mono text-[11px] tracking-wide text-gray-300 hover:bg-neutral-800/40 transition-colors focus-visible:shadow-[var(--focus-ring)]" 
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <span className="text-[10px] transition-transform" style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}>▾</span>
          <span>{title}</span>
        </span>
        {subtitle && <span className="text-[10px] text-gray-500">{subtitle}</span>}
      </button>
      {open && (
        <div className="border-t border-neutral-800 px-4 pt-3 pb-4">
          {children}
        </div>
      )}
    </div>
  );
};

export default CollapsiblePanel;
