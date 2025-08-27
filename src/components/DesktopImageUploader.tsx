import { useRef, useState } from "react";
import { FaImage } from "react-icons/fa";

interface ImageUploaderProps {
  setImage: (image: string | null) => void;
}

const DesktopImageUploader: React.FC<ImageUploaderProps> = ({ setImage }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const processFileList = (files: FileList | null) => {
    if (files && files[0] && files[0].type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(files[0]);
    }
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
        <p className="font-mono text-xs tracking-wide text-gray-200">
          {dragActive ? "Drop to load" : "Click or drag an image"}
        </p>
        <p className="text-[10px] text-gray-500">PNG · JPEG · WebP · BMP · GIF (local only)</p>
        <input
          ref={inputRef}
          id="file-upload-desktop"
          type="file"
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