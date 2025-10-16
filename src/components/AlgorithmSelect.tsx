import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { algorithms, getAlgorithmsByCategory } from '../utils/algorithms';

export interface AlgorithmSelectProps {
  pattern: number;
  setPattern: (id: number) => void;
  threshold: number;
  setThreshold: (t: number) => void;
  invert: boolean;
  setInvert: React.Dispatch<React.SetStateAction<boolean>>;
  serpentine: boolean;
  setSerpentine: React.Dispatch<React.SetStateAction<boolean>>;
  paletteId: string | null;
  groupByCategory?: boolean;
  defaultOpen?: boolean;
}

const AlgorithmSelect: React.FC<AlgorithmSelectProps> = ({
  pattern,
  setPattern,
  threshold,
  setThreshold,
  invert,
  setInvert,
  serpentine,
  setSerpentine,
  paletteId,
  groupByCategory = false,
  defaultOpen = true,
}) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(defaultOpen);

  const algoMetaMap: Record<number, { description: string; supportsThreshold: boolean; category: string; name: string }> = {};
  for (const a of algorithms) { algoMetaMap[a.id] = { description: a.name, supportsThreshold: a.supportsThreshold, category: a.category, name: a.name }; }

  const renderOptions = () => {
    if (!groupByCategory) {
      return algorithms.map(a => <option key={a.id} value={a.id}>{a.name}</option>);
    }
    const categoryOrder = ["Error Diffusion", "Ordered", "Other"];
    const groups = getAlgorithmsByCategory();
    return categoryOrder.map(cat => {
      const list = groups[cat]; if (!list || !list.length) return null;
      const labelKey = cat === 'Error Diffusion' ? 'tool.algorithmPanel.errorDiffusion' : cat === 'Ordered' ? 'tool.algorithmPanel.ordered' : 'tool.algorithmPanel.other';
      return <optgroup key={cat} label={t(labelKey)}>{list.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</optgroup>;
    });
  };

  return (
    <div className="min-panel p-0">
      <button type="button" onClick={() => setOpen(o => !o)} className="flex w-full items-center justify-between px-4 py-3 text-left font-mono text-[11px] tracking-wide text-gray-300 hover:bg-neutral-800/40 focus-visible:shadow-[var(--focus-ring)]" aria-expanded={open}>
        <span className="flex items-center gap-2"><span>{open ? '▾' : '▸'}</span> {t('tool.algorithmPanel.title')}</span>
        <span className="text-[10px] text-gray-500">#{pattern}</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-neutral-800 px-4 pt-3 pb-4">
          <div>
            <label htmlFor="algo-select" className="sr-only">{t('tool.algorithmPanel.title')}</label>
            <select id="algo-select" className="clean-input" value={pattern} onChange={(e) => setPattern(Number(e.target.value))}>
              {renderOptions()}
            </select>
          </div>
          {algoMetaMap[pattern]?.supportsThreshold && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-wide text-gray-400">{t('tool.algorithmPanel.threshold')}</span>
                <span className="text-[10px] text-gray-500">{threshold}</span>
              </div>
              <input type="range" min={0} max={255} value={threshold} className="clean-range" onChange={(e) => setThreshold(Number(e.target.value))} aria-label={t('tool.algorithmPanel.threshold')} />
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => !paletteId && setInvert(v => !v)} disabled={!!paletteId} className={`clean-btn justify-center text-[10px] ${invert ? 'border-emerald-600 text-emerald-400' : ''} ${paletteId ? 'cursor-not-allowed opacity-40' : ''}`}>{t('tool.algorithmPanel.invert')}</button>
            <button type="button" onClick={() => setSerpentine(s => !s)} className={`clean-btn justify-center text-[10px] ${serpentine ? 'border-blue-600 text-blue-400' : ''}`}>{t('tool.algorithmPanel.serpentine')}</button>
          </div>
          <p className="text-[10px] leading-snug text-gray-500">{algoMetaMap[pattern]?.name}</p>
        </div>
      )}
    </div>
  );
};

export default AlgorithmSelect;
