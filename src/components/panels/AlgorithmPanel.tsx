import React from 'react';
import { useTranslation } from 'react-i18next';
import { algorithms, getAlgorithmsByCategory } from '../../utils/algorithms';
import CollapsiblePanel from '../ui/CollapsiblePanel';

interface AlgorithmPanelProps {
  pattern: number;
  setPattern: (id: number) => void;
  threshold: number;
  setThreshold: (t: number) => void;
  invert: boolean;
  setInvert: React.Dispatch<React.SetStateAction<boolean>>;
}

const AlgorithmPanel: React.FC<AlgorithmPanelProps> = ({ pattern, setPattern, threshold, setThreshold, invert, setInvert }) => {
  const { t } = useTranslation();
  
  return (
    <CollapsiblePanel 
      title={t('tool.algorithmPanel.title')}
      subtitle={`#${pattern}`}
      defaultOpen={true}
    >
      <div className="space-y-3">
        <div>
            <label htmlFor="algo-select" className="sr-only">{t('tool.algorithmPanel.title')}</label>
            <select id="algo-select" className="clean-input" value={pattern} onChange={(e) => setPattern(Number(e.target.value))}>
              {(() => {
                const groups = getAlgorithmsByCategory();
                const order: ("Error Diffusion"|"Ordered"|"Other")[] = ["Error Diffusion","Ordered","Other"];
                return order.map(cat => {
                  const list = groups[cat]; if (!list) return null;
                  const labelKey = cat === 'Error Diffusion' ? 'tool.algorithmPanel.errorDiffusion' : cat === 'Ordered' ? 'tool.algorithmPanel.ordered' : 'tool.algorithmPanel.other';
                  return <optgroup key={cat} label={t(labelKey)}>{list.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</optgroup>;
                });
              })()}
            </select>
          </div>
          {algorithms.find(a=>a.id===pattern)?.supportsThreshold && (
            <div className="space-y-1">
              <div className="flex items-center justify-between"><span className="font-mono text-[10px] tracking-wide text-gray-400">{t('tool.algorithmPanel.luminanceThreshold')}</span><span className="text-[10px] text-gray-500">{threshold}</span></div>
              <input type="range" min={0} max={255} value={threshold} className="clean-range" onChange={(e) => setThreshold(Number(e.target.value))} aria-label={t('tool.algorithmPanel.luminanceThreshold')} />
            </div>
          )}
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => setInvert(v => !v)}
              className={`clean-btn justify-center text-[10px] ${invert ? 'border-blue-600 text-blue-400' : ''}`}
            >{t('tool.algorithmPanel.invert')}</button>
          </div>
          <p className="text-[10px] leading-snug text-gray-500">{algorithms.find(a=>a.id===pattern)?.name}</p>
      </div>
    </CollapsiblePanel>
  );
};

export default AlgorithmPanel;
