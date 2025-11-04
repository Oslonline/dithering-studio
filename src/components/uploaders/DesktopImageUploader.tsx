import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaImage, FaExclamationTriangle, FaSpinner } from "react-icons/fa";
import { useFileProcessor } from "../../hooks/useFileProcessor";

interface DesktopImageUploaderProps { onImagesAdded: (items: { url: string; name?: string; file?: File }[]) => void; }

const DesktopImageUploader: React.FC<DesktopImageUploaderProps> = ({ onImagesAdded }) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const { processing, errors, processImages } = useFileProcessor();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    processImages(Array.from(files), onImagesAdded);
  };

  const processFileList = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    processImages(Array.from(files), onImagesAdded);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    processFileList(event.dataTransfer.files);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
  };

  const handleClick = () => inputRef.current?.click();

  return (
    <div className="w-full space-y-2">
      <div
        className={`drop-zone ${dragActive ? "drag" : ""} ${processing > 0 ? "opacity-60" : ""}`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleClick()}
        aria-label={t('tool.ariaUploadImage')}
      >
        {processing > 0 ? (
          <FaSpinner className="text-4xl text-blue-500 animate-spin" aria-hidden="true" />
        ) : (
          <FaImage className="text-4xl text-blue-500" aria-hidden="true" />
        )}
        <p className="font-mono text-xs tracking-wide text-gray-200">
          {processing > 0 ? `Processing ${processing} file(s)...` : (dragActive ? t('tool.upload.dropToLoad') : t('tool.upload.clickOrDragImages'))}
        </p>
        <p className="text-[10px] text-gray-500">{t('tool.upload.imageFormats')}</p>
        <p className="text-[9px] text-gray-600 mt-1">Max 50MB per file, up to 16384×16384px</p>
        <input
          ref={inputRef}
          id="file-upload-desktop"
          type="file"
          multiple
          accept="image/png,image/jpeg,image/webp,image/bmp,image/gif"
          onChange={handleImageUpload}
          className="hidden"
          tabIndex={-1}
        />
        {dragActive && (
          <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-blue-600/40" />
        )}
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

export default DesktopImageUploader;