import React from 'react';
import { useTranslation } from 'react-i18next';
import CollapsiblePanel from '../ui/CollapsiblePanel';
import { serpentinePatterns, type SerpentinePattern } from '../../types/serpentinePatterns';

interface ErrorDiffusionPanelProps {
  pattern: number;
  serpentine: boolean;
  setSerpentine: (v: boolean) => void;
  serpentinePattern: SerpentinePattern;
  setSerpentinePattern: (v: SerpentinePattern) => void;
  errorDiffusionStrength: number;
  setErrorDiffusionStrength: (v: number) => void;
  isErrorDiffusion: boolean;
}

const ErrorDiffusionPanel: React.FC<ErrorDiffusionPanelProps> = ({
  pattern,
  serpentine,
  setSerpentine,
  serpentinePattern,
  setSerpentinePattern,
  errorDiffusionStrength,
  setErrorDiffusionStrength,
  isErrorDiffusion
}) => {
  const { t } = useTranslation();

  if (!isErrorDiffusion) return null;

  // Floyd-Steinberg (id: 1) and False Floyd-Steinberg (id: 19) use optimized implementations
  // that don't support custom scan patterns - only standard serpentine
  const supportsCustomPatterns = pattern !== 1 && pattern !== 19;

  return (
    <CollapsiblePanel
      title={t('tool.errorDiffusionPanel.title')}
      subtitle={t('tool.errorDiffusionPanel.subtitle')}
      defaultOpen={false}
    >
      <div className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="error-strength" className="block text-xs font-mono text-gray-300">
            {t('tool.errorDiffusionPanel.errorStrength')}: {errorDiffusionStrength}%
          </label>
          <input
            id="error-strength"
            type="range"
            min="0"
            max="150"
            step="5"
            value={errorDiffusionStrength}
            onChange={(e) => setErrorDiffusionStrength(Number(e.target.value))}
            className="clean-range"
          />
          <p className="text-[10px] text-gray-500">
            {t('tool.errorDiffusionPanel.strengthHint')}
          </p>
        </div>

        <div className="border-t border-gray-700 pt-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={serpentine}
              onChange={(e) => setSerpentine(e.target.checked)}
              className="w-4 h-4"
            />
            <span className="text-xs font-mono text-gray-200">{t('tool.serpentine')}</span>
          </label>
        </div>

        {supportsCustomPatterns && serpentine && (
          <div className="space-y-1">
            <label htmlFor="serpentine-pattern" className="block text-xs font-mono text-gray-300">
              {t('tool.errorDiffusionPanel.scanPattern')}
            </label>
            <select
              id="serpentine-pattern"
              className="clean-input"
              value={serpentinePattern}
              onChange={(e) => setSerpentinePattern(e.target.value as SerpentinePattern)}
            >
              {(Object.keys(serpentinePatterns) as SerpentinePattern[]).map(key => (
                <option key={key} value={key}>
                  {serpentinePatterns[key].name}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-500">
              {serpentinePatterns[serpentinePattern].description}
            </p>
          </div>
        )}
      </div>
    </CollapsiblePanel>
  );
};

export default ErrorDiffusionPanel;
