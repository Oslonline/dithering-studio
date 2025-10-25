import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaFilm, FaExclamationTriangle } from 'react-icons/fa';
import { validateVideo } from '../../utils/validation';
import { useErrorTracking } from '../../hooks/useErrorTracking';

interface DesktopVideoUploaderProps { onVideosSelected: (items: { url: string; name?: string; file?: File }[]) => void; }

const DesktopVideoUploader: React.FC<DesktopVideoUploaderProps> = ({ onVideosSelected }) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { trackValidationError, trackError } = useErrorTracking();

  const processFiles = async (files: File[]) => {
    const videoFiles = files.filter(f => f.type.startsWith('video/'));
    
    if (videoFiles.length === 0) {
      const error = 'No video files found';
      setValidationError(error);
      setTimeout(() => setValidationError(null), 5000);
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    const validatedVideos: { url: string; name?: string; file?: File }[] = [];
    const errors: string[] = [];

    for (const file of videoFiles) {
      try {
        const result = await validateVideo(file);
        
        if (!result.valid) {
          errors.push(`${file.name}: ${result.error || 'Validation failed'}`);
          trackValidationError('video-upload', file, result.error || 'Unknown error');
          continue;
        }

        if (result.warning) {
          console.warn(`Video validation warning for ${file.name}:`, result.warning);
        }

        const url = URL.createObjectURL(file);
        validatedVideos.push({ url, name: file.name, file });
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Validation failed';
        errors.push(`${file.name}: ${errorMsg}`);
        trackError(`Video validation error: ${errorMsg}`, { file: file.name });
      }
    }

    if (errors.length > 0) {
      setValidationError(errors.join('; '));
      setTimeout(() => setValidationError(null), 5000);
    }

    if (validatedVideos.length > 0) {
      onVideosSelected(validatedVideos);
    }

    setIsValidating(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) processFiles(Array.from(files));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) processFiles(files);
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
          {isValidating ? 'Validating videos...' : (dragActive ? t('tool.upload.dropToLoad') : t('tool.upload.clickOrDragVideos'))}
        </p>
        <p className="text-[10px] text-gray-500">{t('tool.upload.videoFormats')}</p>
        <p className="text-[9px] text-gray-600 mt-1">Max 100MB, up to 5 minutes</p>
        <input ref={inputRef} type="file" accept="video/*" multiple className="hidden" onChange={handleFileInput} />
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
