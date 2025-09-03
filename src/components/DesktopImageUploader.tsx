import { useRef, useState } from "react";
import { FaImage } from "react-icons/fa";

interface DesktopImageUploaderProps { onImagesAdded: (items: { url: string; name?: string; file?: File }[]) => void; }

const DesktopImageUploader: React.FC<DesktopImageUploaderProps> = ({ onImagesAdded }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

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

  const processFileList = (files: FileList | null) => {
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
    <div className="w-full">
      <div
        className={`drop-zone ${dragActive ? "drag" : ""}`}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleClick()}
        aria-label="Upload image"
      >
        <FaImage className="text-4xl text-blue-500" aria-hidden="true" />
  <p className="font-mono text-xs tracking-wide text-gray-200">{dragActive ? 'Drop to load' : 'Click or drag images'}</p>
  <p className="text-[10px] text-gray-500">PNG · JPEG · WebP · BMP · GIF & multiple selection</p>
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
    </div>
  );
};

export default DesktopImageUploader;