import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaImage, FaExclamationTriangle } from "react-icons/fa";
import { validateImage } from "../../utils/validation";
import { useErrorTracking } from "../../hooks/useErrorTracking";

interface MobileImageUploaderProps { onImagesAdded: (items: { url: string; name?: string; file?: File }[]) => void; }

const MobileImageUploader: React.FC<MobileImageUploaderProps> = ({ onImagesAdded }) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { trackValidationError, trackError } = useErrorTracking();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    setValidationError(null);
    const collected: { url: string; name?: string; file?: File }[] = [];
    const errors: string[] = [];
    let remaining = files.length;
    
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name}: Not an image file`);
        remaining--;
        continue;
      }

      try {
        await validateImage(file);
        
        const reader = new FileReader();
        reader.onload = e => {
          collected.push({ url: e.target?.result as string, name: file.name, file });
          remaining--;
          
          if (remaining === 0) {
            if (collected.length > 0) {
              onImagesAdded(collected);
            }
            if (errors.length > 0) {
              const errorMsg = `${errors.length} file(s) failed validation`;
              setValidationError(errorMsg);
              trackValidationError('image-upload', files, errors.join('; '));
              setTimeout(() => setValidationError(null), 5000);
            }
          }
        };
        reader.onerror = () => {
          errors.push(`${file.name}: Failed to read file`);
          trackError(`FileReader error for ${file.name}`);
          remaining--;
        };
        reader.readAsDataURL(file);
      } catch (err) {
        const error = err as Error;
        errors.push(`${file.name}: ${error.message}`);
        trackValidationError('image-upload', file, error.message);
        remaining--;
        
        if (remaining === 0 && errors.length > 0) {
          const errorMsg = errors.length === 1 ? errors[0] : `${errors.length} file(s) failed validation`;
          setValidationError(errorMsg);
          setTimeout(() => setValidationError(null), 5000);
        }
      }
    }
  };

  const handleClick = () => inputRef.current?.click();

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        onClick={handleClick}
        className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#2a2a2a] bg-[#131313] px-4 py-12 active:scale-[.985] transition hover:border-blue-600 focus-visible:shadow-[var(--focus-ring)]"
        aria-label={t('tool.ariaSelectImage')}
      >
        <FaImage className="text-5xl text-blue-500" aria-hidden="true" />
  <span className="font-mono text-xs tracking-wide text-gray-200">{t('tool.upload.tapToChoose')}</span>
  <span className="text-[10px] text-gray-500">{t('tool.upload.imageFormats')}</span>
  <span className="text-[9px] text-gray-600 mt-1">Max 50MB per file, up to 16384×16384px</span>
      </button>
      <input
        ref={inputRef}
        id="file-upload-mobile"
        type="file"
  multiple
  accept="image/png,image/jpeg,image/webp,image/bmp,image/gif"
        onChange={handleImageUpload}
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

export default MobileImageUploader;