import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { perf, PerfFrame } from '../../utils/perf';

const fmt = (n: number | undefined) => (n == null ? '-' : n.toFixed(1));

interface Props { hasImage: boolean; originalBytes?: number | null; processedBytes?: number | null; }

const PerformanceOverlay: React.FC<Props> = ({ hasImage, originalBytes, processedBytes }) => {
  const { t } = useTranslation();
  const [frames, setFrames] = useState<PerfFrame[]>(() => perf.getFrames());
  const [open, setOpen] = useState(false);
  useEffect(() => perf.subscribe(setFrames), []);
  const latest = frames[frames.length - 1];
  const phases = latest?.phases || {};
  const total = latest?.total || 0;
  const entries = Object.entries(phases).sort((a,b)=>b[1]-a[1]);
  const kb = (b?: number | null) => (b == null ? '-' : (b / 1024).toFixed(b < 200*1024 ? 1 : 0) + ' KB');
  return (
    <div className="hidden md:flex fixed bottom-2 right-2 z-50 flex-col items-end gap-1 font-mono tracking-wide text-[10px]">
      {hasImage && (
        <button 
          onClick={()=>setOpen(o=>!o)} 
          className="clean-btn px-2 py-1 !text-[10px] border border-neutral-700 bg-neutral-900/80 backdrop-blur-sm"
          aria-label={open ? t('tool.performance.hideStats') : t('tool.performance.showStats')}
          aria-expanded={open}
        >
          {t('tool.performance.perf')} {open?'▼':'▲'} {fmt(total)}ms
        </button>
      )}
      {open && hasImage && (
        <div className="w-56 rounded border border-neutral-800 bg-[#111]/95 p-2 shadow-xl backdrop-blur-sm">
          <div className="mb-1 flex items-center justify-between"><span className="text-neutral-400">{t('tool.performance.latestFrame')}</span><span className="text-neutral-500">{t('tool.performance.token')} {latest?.token ?? '-'}</span></div>
          <div className="max-h-40 overflow-auto pr-1 space-y-0.5">
            {entries.map(([l,ms]) => (
              <div key={l} className="flex justify-between"><span className="text-neutral-300">{l}</span><span className="text-neutral-400">{fmt(ms)}ms</span></div>
            ))}
            {!entries.length && <div className="text-neutral-500">{t('tool.performance.noData')}</div>}
          </div>
          <div className="mt-2 border-t border-neutral-800 pt-1 text-neutral-500">{t('tool.performance.avg')}: {fmt(avg(frames.slice(-10).map(f=>f.total||0)))}ms</div>
          <div className="mt-1 text-[9px] text-neutral-500 leading-snug">
            <div>{t('tool.performance.original')}: {kb(originalBytes)}</div>
            <div>{t('tool.performance.processed')}: {kb(processedBytes)}</div>
          </div>
        </div>
      )}
      {/* Info hints */}
      <div className="pointer-events-none select-none text-gray-600 text-right text-[9px]">
        <div>Drag to pan • Scroll to zoom</div>
        <div>All processing local • No uploads</div>
      </div>
    </div>
  );
};

function avg(a:number[]) { return a.length ? a.reduce((x,y)=>x+y,0)/a.length : 0; }

export default PerformanceOverlay;
