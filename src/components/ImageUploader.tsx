import { useRef, useState } from "react";
import { FaImage } from "react-icons/fa";

interface ImageUploaderProps {
  setImage: (image: string | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ setImage }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setDragActive(false);
    if (event.dataTransfer.files && event.dataTransfer.files[0]) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
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

  const handleClick = () => {
    inputRef.current?.click();
  };

  return (
    <div className={`flex w-full items-center justify-center`}>
      <div
        className={`relative flex h-64 w-full max-w-md cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-5 transition-colors duration-200 ${dragActive ? "border-blue-500 bg-blue-950/30" : "border-neutral-700 bg-neutral-800/80 hover:border-blue-400 hover:bg-neutral-700/80"} `}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        tabIndex={0}
        role="button"
        aria-label="Upload image area"
      >
        <FaImage className="mb-2 text-5xl text-blue-500" aria-hidden="true" />
        <p className="text-center font-mono text-lg text-gray-100">{dragActive ? "Drop your image here" : "Click or drag & drop an image"}</p>
        <p className="text-xs text-gray-400">PNG, JPEG, WebP, BMP, GIF</p>
        <input ref={inputRef} id="file-upload" type="file" accept="image/png,image/jpeg,image/webp,image/bmp,image/gif" onChange={handleImageUpload} className="hidden" tabIndex={-1} aria-label="File upload" />
        {dragActive && <div className="pointer-events-none absolute inset-0 rounded-xl border-4 border-blue-800 opacity-60" />}
      </div>
    </div>
  );
};

export default ImageUploader;
