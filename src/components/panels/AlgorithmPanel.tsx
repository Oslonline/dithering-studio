import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { algorithms, getAlgorithmsByCategory } from '../../utils/algorithms';
import { orderRampDarkToLight, DEFAULT_ASCII_RAMP } from '../../utils/algorithms/asciiMosaic';
import CollapsiblePanel from '../ui/CollapsiblePanel';

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
  asciiRamp?: string;
  setAsciiRamp?: (v: string) => void;
}

const AlgorithmPanel: React.FC<AlgorithmPanelProps> = ({ pattern, setPattern, threshold, setThreshold, invert, setInvert, serpentine, setSerpentine, asciiRamp, setAsciiRamp }) => {
  const { t } = useTranslation();
  const algoObj = algorithms.find(a=>a.id===pattern);
  const isAscii = pattern === 25 || algoObj?.name.toLowerCase().includes('ascii');
  const normalizedRamp = useMemo(()=>{
    if (!asciiRamp) return DEFAULT_ASCII_RAMP; return Array.from(new Set(asciiRamp.split('').filter(ch=>ch !== '\n' && ch!=='\r'))).join('').slice(0,128);
  },[asciiRamp]);
  
  return (
    <CollapsiblePanel 
      title={t(isAscii ? 'tool.algorithmPanel.titleAscii' : 'tool.algorithmPanel.title')}
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
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setInvert(v => !v)}
              className={`clean-btn justify-center text-[10px] ${invert ? 'border-blue-600 text-blue-400' : ''}`}
            >{t('tool.algorithmPanel.invert')}</button>
            <button
              type="button"
              onClick={() => setSerpentine(s => !s)}
              className={`clean-btn justify-center text-[10px] ${serpentine ? 'border-blue-600 text-blue-400' : ''}`}
            >{t('tool.algorithmPanel.serpentine')}</button>
          </div>
          {isAscii && setAsciiRamp && (
            <div className="space-y-2" data-section="ascii-ramp">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-wide text-gray-400">{t('tool.algorithmPanel.asciiRamp')}</span>
                <span className="text-[9px] text-gray-500">{normalizedRamp.length} {t('tool.algorithmPanel.chars')}</span>
              </div>
              <textarea
                value={asciiRamp || DEFAULT_ASCII_RAMP}
                onChange={(e)=> {
                  const raw = e.target.value.replace(/\s+/g,' '); // collapse whitespace
                  const uniq = Array.from(new Set(raw.split(''))).join('');
                  setAsciiRamp(uniq.slice(0,128));
                }}
                rows={2}
                className="clean-input !px-2 !py-1 font-mono text-[11px] resize-none"
                aria-label={t('tool.algorithmPanel.asciiRamp')}
              />
              <div className="flex flex-wrap gap-2 text-[9px] font-mono">
                <button type="button" className="clean-btn px-2 py-1 !text-[10px]" onClick={()=> setAsciiRamp(orderRampDarkToLight(normalizedRamp))}>{t('tool.algorithmPanel.autoOrder')}</button>
                <button type="button" className="clean-btn px-2 py-1 !text-[10px]" onClick={()=> setAsciiRamp(DEFAULT_ASCII_RAMP)}>{t('tool.algorithmPanel.reset')}</button>
                <button type="button" className="clean-btn px-2 py-1 !text-[10px]" onClick={()=> setAsciiRamp(normalizedRamp.split('').reverse().join(''))}>{t('tool.algorithmPanel.reverse')}</button>
                <button type="button" className="clean-btn px-2 py-1 !text-[10px]" onClick={()=> setAsciiRamp(normalizedRamp.trimEnd() + (normalizedRamp.endsWith(' ') ? '' : ' '))}>{t('tool.algorithmPanel.ensureSpace')}</button>
                <button type="button" className="clean-btn px-2 py-1 !text-[10px]" onClick={()=> {
                  const arr = normalizedRamp.split('');
                  for (let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
                  setAsciiRamp(arr.join(''));
                }}>{t('tool.algorithmPanel.randomize')}</button>
              </div>
              <div className="space-y-1">
                <div className="flex flex-wrap gap-1">
                  {normalizedRamp.split('').map((ch,i)=> (
                    <span key={i} className="inline-flex items-center justify-center w-5 h-5 rounded bg-neutral-900 border border-neutral-700 text-[11px]">{ch===' ' ? '·' : ch}</span>
                  ))}
                </div>
                <p className="text-[9px] leading-snug text-gray-500">{t('tool.algorithmPanel.asciiNote')}</p>
              </div>
            </div>
          )}
          <p className="text-[10px] leading-snug text-gray-500">{algorithms.find(a=>a.id===pattern)?.name}</p>
      </div>
    </CollapsiblePanel>
  );
};

export default AlgorithmPanel;
