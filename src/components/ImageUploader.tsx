import { useState } from "react";

interface ImageUploaderProps {
  setImage: (image: string | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ setImage }) => {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const displayedFileName = fileName
    ? (() => {
        const fileExtension = fileName.split(".").pop();
        const nameWithoutExtension = fileName.slice(0, fileName.length - fileExtension!.length - 1);
        return nameWithoutExtension.length > 12 ? `${nameWithoutExtension.slice(0, 4)}[...]${nameWithoutExtension.slice(-4)}.${fileExtension}` : fileName;
      })()
    : null;

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="file-upload" className="cursor-pointer rounded bg-blue-400 px-2 py-1 text-gray-950 duration-100 hover:bg-blue-500">
        Choose Image
      </label>
      <input id="file-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
      {displayedFileName && <p className="mt-2 line-clamp-1 text-gray-600">{displayedFileName}</p>}
    </div>
  );
};

export default ImageUploader;
