import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaFilm } from 'react-icons/fa';

interface DesktopVideoUploaderProps { onVideoSelected: (item: { url: string; name?: string; file?: File }) => void; }

const DesktopVideoUploader: React.FC<DesktopVideoUploaderProps> = ({ onVideoSelected }) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const process = (file: File) => {
    if (!file.type.startsWith('video/')) return;
    const url = URL.createObjectURL(file);
    onVideoSelected({ url, name: file.name, file });
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
    <div className="w-full">
      <div
        className={`drop-zone ${dragActive ? 'drag' : ''}`}
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
        <p className="font-mono text-xs tracking-wide text-gray-200">{dragActive ? t('tool.upload.dropToLoad') : t('tool.upload.clickOrDragVideo')}</p>
        <p className="text-[10px] text-gray-500">{t('tool.upload.videoFormats')}</p>
        <input ref={inputRef} type="file" accept="video/*" className="hidden" onChange={handleFileInput} />
        {dragActive && <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-2 ring-blue-600/40" />}
      </div>
    </div>
  );
};

export default DesktopVideoUploader;
