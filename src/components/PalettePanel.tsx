import React, { useState } from 'react';
import { predefinedPalettes } from '../utils/palettes';

interface PalettePanelProps {
  paletteId: string | null;
  setPaletteId: (id: string | null) => void;
  activePaletteColors: [number, number, number][] | null;
  setActivePaletteColors: React.Dispatch<React.SetStateAction<[number, number, number][] | null>>;
  effectivePalette: [number, number, number][] | null;
}

const PalettePanel: React.FC<PalettePanelProps> = ({ paletteId, setPaletteId, activePaletteColors, setActivePaletteColors, effectivePalette }) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="min-panel p-0">
      <button type="button" onClick={() => setOpen(o => !o)} className="flex w-full items-center justify-between px-4 py-3 text-left font-mono text-[11px] tracking-wide text-gray-300 hover:bg-neutral-800/40 focus-visible:shadow-[var(--focus-ring)]" aria-expanded={open}>
        <span className="flex items-center gap-2"><span>{open ? '▾' : '▸'}</span> Palette</span>
        {paletteId && <span className="badge ml-auto">Active</span>}
      </button>
      {open && (
        <div className="space-y-2 border-t border-neutral-800 px-4 pt-3 pb-4">
          <div className="flex items-center justify-between">
            <label htmlFor="palette-select" className="font-mono text-[11px] tracking-wide text-gray-300">Select</label>
            {paletteId && <button className="clean-btn px-2 py-0 text-[10px]" onClick={() => setPaletteId(null)}>Clear</button>}
          </div>
          <select id="palette-select" className="clean-input" value={paletteId ?? ''} onChange={(e) => setPaletteId(e.target.value === '' ? null : e.target.value)}>
            <option value="">None (Binary BW)</option>
            {predefinedPalettes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {!paletteId && <p className="text-[10px] text-gray-500">Select a palette then click colors to remove them.</p>}
          {paletteId && activePaletteColors && (
            <div className="mt-1 flex flex-wrap gap-1">
              {activePaletteColors.map((c, i) => (
                <button key={i} type="button" onClick={() => {
                  if (!activePaletteColors || activePaletteColors.length <= 2) return;
                  const next = activePaletteColors.filter((_, idx) => idx !== i);
                  setActivePaletteColors(next);
                }} className="group relative h-5 w-5 cursor-pointer rounded-sm border border-neutral-600 focus-visible:shadow-[var(--focus-ring)]" style={{ background: `rgb(${c[0]},${c[1]},${c[2]})` }} title="Remove color" aria-label={`Remove color rgb(${c[0]},${c[1]},${c[2]})`}>
                  <span className="pointer-events-none absolute inset-0 rounded-sm bg-black/0 transition group-hover:bg-black/35" />
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[13px] font-bold text-white opacity-0 drop-shadow-[0_0_2px_rgba(0,0,0,0.9)] transition-opacity group-hover:opacity-100">×</span>
                </button>
              ))}
              <button type="button" onClick={() => effectivePalette && setActivePaletteColors(effectivePalette.map(c => [...c] as [number, number, number]))} className="relative h-5 w-5 cursor-pointer rounded-sm border border-neutral-600 text-[11px] font-semibold text-gray-300 transition hover:bg-neutral-800 hover:text-white focus-visible:shadow-[var(--focus-ring)]" title="Restore full palette" aria-label="Restore full palette">↺</button>
            </div>
          )}
          <p className="mt-1 text-[10px] text-gray-500">Remove swatches to constrain colors.</p>
        </div>
      )}
    </div>
  );
};

export default PalettePanel;
