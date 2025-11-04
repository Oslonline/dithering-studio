import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaFilm, FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { useFileProcessor } from '../../hooks/useFileProcessor';

interface DesktopVideoUploaderProps { onVideosSelected: (items: { url: string; name?: string; file?: File }[]) => void; }

const DesktopVideoUploader: React.FC<DesktopVideoUploaderProps> = ({ onVideosSelected }) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const { processing, errors, processVideos } = useFileProcessor();

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processVideos(Array.from(files), onVideosSelected);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processVideos(files, onVideosSelected);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); };
  const handleClick = () => inputRef.current?.click();

  return (
    <div className="w-full space-y-2">
      <div
        className={`drop-zone ${dragActive ? 'drag' : ''} ${processing > 0 ? 'opacity-60' : ''}`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
        aria-label={t('tool.ariaUploadVideo')}
      >
        {processing > 0 ? (
          <FaSpinner className="text-4xl text-blue-500 animate-spin" aria-hidden="true" />
        ) : (
          <FaFilm className="text-4xl text-blue-500" aria-hidden="true" />
        )}
        <p className="font-mono text-xs tracking-wide text-gray-200">
          {processing > 0 ? `Processing ${processing} file(s)...` : (dragActive ? t('tool.upload.dropToLoad') : t('tool.upload.clickOrDragVideos'))}
        </p>
        <p className="text-[10px] text-gray-500">{t('tool.upload.videoFormats')}</p>
        <p className="text-[9px] text-gray-600 mt-1">Max 100MB, up to 5 minutes</p>
        <input ref={inputRef} type="file" accept="video/*" multiple className="hidden" onChange={handleFileInput} />
        {dragActive && <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-blue-600/40" />}
      </div>

      {errors.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-yellow-900/20 border border-yellow-500/30 rounded text-xs text-yellow-300">
          <FaExclamationTriangle className="flex-shrink-0" />
          <span>{errors.length === 1 ? errors[0] : `${errors.length} file(s) failed`}</span>
        </div>
      )}
    </div>
  );
};

export default DesktopVideoUploader;
