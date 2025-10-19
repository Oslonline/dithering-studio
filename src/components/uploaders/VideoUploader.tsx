import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaExclamationTriangle } from 'react-icons/fa';
import DesktopVideoUploader from './DesktopVideoUploader';
import { validateVideo } from '../../utils/validation';
import { useErrorTracking } from '../../hooks/useErrorTracking';

interface VideoUploaderProps { onVideoSelected: (item: { url: string; name?: string; file?: File }) => void; }

const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoSelected }) => {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const { trackValidationError, trackError } = useErrorTracking();

  useEffect(() => {
    const touchCapable = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    const smallViewport = window.innerWidth < 640;
    setIsMobile(touchCapable || smallViewport);
    const onResize = () => setIsMobile(touchCapable || window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleMobileVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

  if (isMobile) {
    return (
      <div className="w-full space-y-2">
        <label className="block text-center font-mono text-xs tracking-wide text-gray-300 mb-2">
          {isValidating ? 'Validating video...' : t('tool.upload.selectVideo')}
        </label>
        <input 
          type="file" 
          accept="video/*" 
          onChange={handleMobileVideoSelect}
          disabled={isValidating}
          className="clean-input w-full disabled:opacity-50" 
        />
        <p className="mt-2 text-center text-[10px] text-gray-500">{t('tool.upload.videoFormatsShort')}</p>
        <p className="text-center text-[9px] text-gray-600">Max 100MB, up to 5 minutes</p>

        {validationError && (
          <div className="flex items-center gap-2 p-2 bg-yellow-900/20 border border-yellow-500/30 rounded text-xs text-yellow-300">
            <FaExclamationTriangle className="flex-shrink-0" />
            <span>{validationError}</span>
          </div>
        )}
      </div>
    );
  }
  return <DesktopVideoUploader onVideoSelected={onVideoSelected} />;
};

export default VideoUploader;
