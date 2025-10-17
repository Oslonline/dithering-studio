import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaImage } from "react-icons/fa";

interface MobileImageUploaderProps { onImagesAdded: (items: { url: string; name?: string; file?: File }[]) => void; }

const MobileImageUploader: React.FC<MobileImageUploaderProps> = ({ onImagesAdded }) => {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
  const collected: { url: string; name?: string; file?: File }[] = [];
    let remaining = files.length;
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) { remaining--; return; }
      const reader = new FileReader();
      reader.onload = e => {
  collected.push({ url: e.target?.result as string, name: file.name, file });
        remaining--;
        if (remaining === 0 && collected.length) onImagesAdded(collected);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleClick = () => inputRef.current?.click();

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#2a2a2a] bg-[#131313] px-4 py-12 active:scale-[.985] transition hover:border-blue-600 focus-visible:shadow-[var(--focus-ring)]"
        aria-label={t('tool.ariaSelectImage')}
      >
        <FaImage className="text-5xl text-blue-500" aria-hidden="true" />
  <span className="font-mono text-xs tracking-wide text-gray-200">{t('tool.upload.tapToChoose')}</span>
  <span className="text-[10px] text-gray-500">{t('tool.upload.imageFormats')}</span>
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
    </div>
  );
};

export default MobileImageUploader;