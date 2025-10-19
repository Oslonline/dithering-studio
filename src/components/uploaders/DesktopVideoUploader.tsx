import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaFilm, FaExclamationTriangle } from 'react-icons/fa';
import { validateVideo } from '../../utils/validation';
import { useErrorTracking } from '../../hooks/useErrorTracking';

interface DesktopVideoUploaderProps { onVideoSelected: (item: { url: string; name?: string; file?: File }) => void; }

const DesktopVideoUploader: React.FC<DesktopVideoUploaderProps> = ({ onVideoSelected }) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { trackValidationError, trackError } = useErrorTracking();

  const process = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      const error = 'Not a video file';
      setValidationError(error);
      trackValidationError('video-upload', file, error);
      setTimeout(() => setValidationError(null), 5000);
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const result = await validateVideo(file);
      
      if (!result.valid) {
        setValidationError(result.error || 'Video validation failed');
        trackValidationError('video-upload', file, result.error || 'Unknown error');
        setTimeout(() => setValidationError(null), 5000);
        setIsValidating(false);
        return;
      }

      if (result.warning) {
        console.warn('Video validation warning:', result.warning);
      }

      const url = URL.createObjectURL(file);
      onVideoSelected({ url, name: file.name, file });
      setIsValidating(false);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Validation failed';
      setValidationError(errorMsg);
      trackError(`Video validation error: ${errorMsg}`, { file: file.name });
      setTimeout(() => setValidationError(null), 5000);
      setIsValidating(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) process(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('video/'));
    if (file) process(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); };
  const handleClick = () => inputRef.current?.click();

  return (
    <div className="w-full space-y-2">
      <div
        className={`drop-zone ${dragActive ? 'drag' : ''} ${isValidating ? 'opacity-50 pointer-events-none' : ''}`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleClick()}
        aria-label={t('tool.ariaUploadVideo')}
      >
        <FaFilm className="text-4xl text-blue-500" aria-hidden="true" />
        <p className="font-mono text-xs tracking-wide text-gray-200">
          {isValidating ? 'Validating video...' : (dragActive ? t('tool.upload.dropToLoad') : t('tool.upload.clickOrDragVideo'))}
        </p>
        <p className="text-[10px] text-gray-500">{t('tool.upload.videoFormats')}</p>
        <p className="text-[9px] text-gray-600 mt-1">Max 100MB, up to 5 minutes</p>
        <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={handleFileInput} />
        {dragActive && <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-blue-600/40" />}
      </div>

      {validationError && (
        <div className="flex items-center gap-2 p-2 bg-yellow-900/20 border border-yellow-500/30 rounded text-xs text-yellow-300">
          <FaExclamationTriangle className="flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};

export default DesktopVideoUploader;
