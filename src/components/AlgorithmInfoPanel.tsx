import { useTranslation } from 'react-i18next';
import { getAlgorithmDetail } from "../utils/algorithmInfo";

interface Props { id: number; onClose: () => void; }

const AlgorithmInfoPanel: React.FC<Props> = ({ id, onClose }) => {
  const { t } = useTranslation();
  const info = getAlgorithmDetail(id);
  if (!info) return null;
  return (
    <div className="absolute inset-0 z-20 flex items-start justify-center bg-black/70 p-4 text-left">
      <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-md border border-neutral-700 bg-[#0f0f0f] p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-mono text-sm tracking-wide text-blue-300">{info.name}</h2>
          <button className="clean-btn px-2 py-1 text-[11px]" onClick={onClose}>{t('explorer.close')}</button>
        </div>
        <p className="mb-3 text-[11px] leading-relaxed text-gray-300">{info.overview}</p>
        <div className="mb-4 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="mb-1 font-mono text-[10px] uppercase tracking-wide text-gray-400">{t('explorer.category')}</h3>
            <p className="text-[11px] text-gray-200">{info.category}</p>
          </div>
          <div>
            <h3 className="mb-1 font-mono text-[10px] uppercase tracking-wide text-gray-400">{t('explorer.complexity')}</h3>
            <p className="text-[11px] text-gray-200">{info.complexity}</p>
          </div>
          {info.kernel && (
            <div className="md:col-span-2">
              <h3 className="mb-1 font-mono text-[10px] uppercase tracking-wide text-gray-400">{t('explorer.kernel')}</h3>
              <pre className="overflow-x-auto rounded bg-neutral-900 p-2 text-[10px] leading-tight text-gray-300">
{info.kernel.map(r=>r.join(" \t")).join("\n")}
              </pre>
              {info.kernelDivisor && <p className="mt-1 text-[10px] text-gray-500">{t('explorer.divisor')}: {info.kernelDivisor}</p>}
            </div>
          )}
          {info.orderedMatrixSize && (
            <div>
              <h3 className="mb-1 font-mono text-[10px] uppercase tracking-wide text-gray-400">{t('explorer.matrixSize')}</h3>
              <p className="text-[11px] text-gray-200">{info.orderedMatrixSize}</p>
            </div>
          )}
          {info.reference && (
            <div>
              <h3 className="mb-1 font-mono text-[10px] uppercase tracking-wide text-gray-400">{t('explorer.reference')}</h3>
              <p className="text-[11px] text-gray-200">{info.reference}</p>
            </div>
          )}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <h4 className="mb-1 font-mono text-[10px] uppercase tracking-wide text-gray-400">{t('explorer.characteristics')}</h4>
            <ul className="list-disc pl-4 text-[10px] text-gray-300 space-y-1">
              {info.characteristics.map((c,i)=><li key={i}>{c}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="mb-1 font-mono text-[10px] uppercase tracking-wide text-gray-400">{t('explorer.artifacts')}</h4>
            <ul className="list-disc pl-4 text-[10px] text-gray-300 space-y-1">
              {info.artifacts.map((c,i)=><li key={i}>{c}</li>)}
            </ul>
          </div>
          <div>
            <h4 className="mb-1 font-mono text-[10px] uppercase tracking-wide text-gray-400">{t('explorer.bestFor')}</h4>
            <ul className="list-disc pl-4 text-[10px] text-gray-300 space-y-1">
              {info.bestFor.map((c,i)=><li key={i}>{c}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmInfoPanel;