import React, { useState } from 'react';

interface ResolutionPanelProps {
  workingResolution: number;
  setWorkingResolution: (n: number) => void;
  workingResInput: string;
  setWorkingResInput: (v: string) => void;
  maxResolution?: number;
}

const ResolutionPanel: React.FC<ResolutionPanelProps> = ({ workingResolution, setWorkingResolution, workingResInput, setWorkingResInput, maxResolution }) => {
  const [open, setOpen] = useState(true);
  const hardMax = Math.min( Math.max(64, maxResolution || 4096), 8192 );
  return (
    <div className="min-panel p-0">
      <button type="button" onClick={() => setOpen(o => !o)} className="flex w-full items-center justify-between px-4 py-3 text-left font-mono text-[11px] tracking-wide text-gray-300 hover:bg-neutral-800/40 focus-visible:shadow-[var(--focus-ring)]" aria-expanded={open}>
        <span className="flex items-center gap-2"><span>{open ? '▾' : '▸'}</span> Working Resolution</span>
        <span className="text-[10px] text-gray-500">{workingResolution}px</span>
      </button>
      {open && (
        <div className="space-y-2 border-t border-neutral-800 px-4 pt-3 pb-4">
          <div className="relative">
            <input type="range" min={32} max={hardMax} step={16} value={Math.min(workingResolution, hardMax)} className="clean-range" onChange={(e) => { const val = Number(e.target.value); setWorkingResolution(val); setWorkingResInput(String(val)); }} />
          </div>
          <div className="flex items-center gap-2">
            <input type="text" inputMode="numeric" pattern="[0-9]*" className="clean-input w-24" value={workingResInput} onChange={(e) => {
              const v = e.target.value.trim();
              if (v === '') { setWorkingResInput(''); return; }
              if (/^\d+$/.test(v)) { let num = parseInt(v, 10); num = Math.min(hardMax, Math.max(16, num)); setWorkingResInput(String(num)); setWorkingResolution(num); }
            }} onBlur={() => { if (workingResInput === '') setWorkingResInput(String(workingResolution)); }} aria-label="Working resolution in pixels" />
            <span className="text-[10px] text-gray-500">px width</span>
          </div>
          <p className="text-[10px] text-gray-500">Pixel width for internal processing (max {hardMax}px).</p>
        </div>
      )}
    </div>
  );
};

export default ResolutionPanel;
