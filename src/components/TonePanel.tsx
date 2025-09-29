import React, { useState } from 'react';

interface TonePanelProps {
  contrast: number; setContrast: (n: number) => void;
  midtones: number; setMidtones: (n: number) => void;
  highlights: number; setHighlights: (n: number) => void;
  blurRadius: number; setBlurRadius: (n: number) => void;
  workingResolution: number; setWorkingResolution: (n: number) => void;
  maxResolution?: number;
}

const TonePanel: React.FC<TonePanelProps> = ({ contrast, setContrast, midtones, setMidtones, highlights, setHighlights, blurRadius, setBlurRadius, workingResolution, setWorkingResolution, maxResolution }) => {
  const [open, setOpen] = useState(true);
  const hardMax = Math.min(Math.max(64, maxResolution || 4096), 8192);
  const scalePct = maxResolution && maxResolution > 0 ? Math.round((Math.min(workingResolution, hardMax) / maxResolution) * 100) : 100;
  return (
    <div className="min-panel p-0">
      <button type="button" onClick={() => setOpen(o=>!o)} className="flex w-full items-center justify-between px-4 py-3 text-left font-mono text-[11px] tracking-wide text-gray-300 hover:bg-neutral-800/40 focus-visible:shadow-[var(--focus-ring)]" aria-expanded={open}>
        <span className="flex items-center gap-2"><span>{open ? '▾' : '▸'}</span> Main Settings</span>
        <span className="text-[10px] text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-[55%]">
          C {contrast} · G {midtones.toFixed(2)} · H {highlights} · B {blurRadius}px · S {scalePct}%
        </span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-neutral-800 px-4 pt-3 pb-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between"><span className="font-mono text-[10px] tracking-wide text-gray-400">Scale</span><span className="text-[10px] text-gray-500">{scalePct}%</span></div>
            <input
              type="range"
              min={5}
              max={100}
              step={1}
              value={scalePct}
              className="clean-range"
              onChange={(e)=>{
                const pct = Number(e.target.value);
                const newRes = Math.max(16, Math.round((maxResolution || hardMax) * (pct/100)));
                setWorkingResolution(Math.min(hardMax, newRes));
              }}
              disabled={!maxResolution}
            />
            {!maxResolution && (<p className="text-[10px] text-gray-500">Load media to enable scaling.</p>)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between"><span className="font-mono text-[10px] tracking-wide text-gray-400">Contrast</span><span className="text-[10px] text-gray-500">{contrast}</span></div>
            <input type="range" min={-100} max={100} step={1} value={contrast} className="clean-range" onChange={(e)=> setContrast(Number(e.target.value))} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between"><span className="font-mono text-[10px] tracking-wide text-gray-400">Midtones (Gamma)</span><span className="text-[10px] text-gray-500">{midtones.toFixed(2)}</span></div>
            <input type="range" min={0.5} max={2.0} step={0.01} value={midtones} className="clean-range" onChange={(e)=> setMidtones(Number(e.target.value))} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between"><span className="font-mono text-[10px] tracking-wide text-gray-400">Highlights Compression</span><span className="text-[10px] text-gray-500">{highlights}</span></div>
            <input type="range" min={0} max={100} step={1} value={highlights} className="clean-range" onChange={(e)=> setHighlights(Number(e.target.value))} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between"><span className="font-mono text-[10px] tracking-wide text-gray-400">Blur Radius</span><span className="text-[10px] text-gray-500">{blurRadius}px</span></div>
            <input type="range" min={0} max={10} step={0.5} value={blurRadius} className="clean-range" onChange={(e)=> setBlurRadius(Number(e.target.value))} />
          </div>
          <p className="text-[10px] text-gray-500">Tone curve is applied on luminance before dithering. Blur can help reduce high-frequency noise prior to ordered patterns.</p>
        </div>
      )}
    </div>
  );
};

export default TonePanel;
