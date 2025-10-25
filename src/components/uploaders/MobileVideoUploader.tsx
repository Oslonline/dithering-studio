import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaFilm, FaExclamationTriangle } from "react-icons/fa";
import { validateVideo } from "../../utils/validation";
import { useErrorTracking } from "../../hooks/useErrorTracking";

interface MobileVideoUploaderProps { onVideosSelected: (items: { url: string; name?: string; file?: File }[]) => void; }

const MobileVideoUploader: React.FC<MobileVideoUploaderProps> = ({ onVideosSelected }) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { trackValidationError, trackError } = useErrorTracking();

  const handleVideoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setIsValidating(true);
    setValidationError(null);
    
    const validatedVideos: { url: string; name?: string; file?: File }[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('video/')) {
        errors.push(`${file.name}: Not a video file`);
        continue;
      }

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
      const errorMsg = errors.length === 1 ? errors[0] : `${errors.length} file(s) failed validation`;
      setValidationError(errorMsg);
      setTimeout(() => setValidationError(null), 5000);
    }

    if (validatedVideos.length > 0) {
      onVideosSelected(validatedVideos);
    }

    setIsValidating(false);
    
    // Reset input so same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleClick = () => inputRef.current?.click();

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isValidating}
        className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#2a2a2a] bg-[#131313] px-4 py-12 active:scale-[.985] transition hover:border-blue-600 focus-visible:shadow-[var(--focus-ring)] disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={t('tool.ariaUploadVideo')}
      >
        <FaFilm className="text-5xl text-blue-500" aria-hidden="true" />
        <span className="font-mono text-xs tracking-wide text-gray-200">
          {isValidating ? 'Validating videos...' : t('tool.upload.tapToChooseVideos')}
        </span>
        <span className="text-[10px] text-gray-500">{t('tool.upload.videoFormats')}</span>
        <span className="text-[9px] text-gray-600 mt-1">Max 100MB, up to 5 minutes</span>
      </button>
      <input
        ref={inputRef}
        id="file-upload-video-mobile"
        type="file"
        multiple
        accept="video/*"
        onChange={handleVideoUpload}
        disabled={isValidating}
        className="hidden"
      />
      
      {validationError && (
        <div className="flex items-center gap-2 p-2 bg-yellow-900/20 border border-yellow-500/30 rounded text-xs text-yellow-300">
          <FaExclamationTriangle className="flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}
    </div>
  );
};

export default MobileVideoUploader;
