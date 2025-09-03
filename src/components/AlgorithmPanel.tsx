import React, { useState } from 'react';
import { algorithms, getAlgorithmsByCategory } from '../utils/algorithms';

interface AlgorithmPanelProps {
  pattern: number;
  setPattern: (id: number) => void;
  threshold: number;
  setThreshold: (t: number) => void;
  invert: boolean;
  setInvert: React.Dispatch<React.SetStateAction<boolean>>;
  serpentine: boolean;
  setSerpentine: React.Dispatch<React.SetStateAction<boolean>>;
  paletteId: string | null;
}

const AlgorithmPanel: React.FC<AlgorithmPanelProps> = ({ pattern, setPattern, threshold, setThreshold, invert, setInvert, serpentine, setSerpentine, paletteId }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="min-panel p-0">
      <button type="button" onClick={() => setOpen(o => !o)} className="flex w-full items-center justify-between px-4 py-3 text-left font-mono text-[11px] tracking-wide text-gray-300 hover:bg-neutral-800/40 focus-visible:shadow-[var(--focus-ring)]" aria-expanded={open}>
        <span className="flex items-center gap-2"><span>{open ? '▾' : '▸'}</span> Algorithm</span>
        <span className="text-[10px] text-gray-500">#{pattern}</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-neutral-800 px-4 pt-3 pb-4">
          <div>
            <label htmlFor="algo-select" className="sr-only">Algorithm</label>
            <select id="algo-select" className="clean-input" value={pattern} onChange={(e) => setPattern(Number(e.target.value))}>
              {(() => {
                const groups = getAlgorithmsByCategory();
                const order: ("Error Diffusion"|"Ordered"|"Other")[] = ["Error Diffusion","Ordered","Other"];
                return order.map(cat => {
                  const list = groups[cat]; if (!list) return null;
                  return <optgroup key={cat} label={cat === 'Other' ? 'Other / Experimental' : cat}>{list.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</optgroup>;
                });
              })()}
            </select>
          </div>
          {algorithms.find(a=>a.id===pattern)?.supportsThreshold && (
            <div className="space-y-1">
              <div className="flex items-center justify-between"><span className="font-mono text-[10px] tracking-wide text-gray-400">Threshold</span><span className="text-[10px] text-gray-500">{threshold}</span></div>
              <input type="range" min={0} max={255} value={threshold} className="clean-range" onChange={(e) => setThreshold(Number(e.target.value))} aria-label="Threshold" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => !paletteId && setInvert(v => !v)} disabled={!!paletteId} className={`clean-btn justify-center text-[10px] ${invert ? 'border-emerald-600 text-emerald-400' : ''} ${paletteId ? 'cursor-not-allowed opacity-40' : ''}`}>Invert</button>
            <button type="button" onClick={() => setSerpentine(s => !s)} className={`clean-btn justify-center text-[10px] ${serpentine ? 'border-blue-600 text-blue-400' : ''}`}>Serpentine</button>
          </div>
          <p className="text-[10px] leading-snug text-gray-500">{algorithms.find(a=>a.id===pattern)?.name}</p>
        </div>
      )}
    </div>
  );
};

export default AlgorithmPanel;
