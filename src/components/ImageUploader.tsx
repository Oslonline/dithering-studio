import { FaImage } from "react-icons/fa";

interface ImageUploaderProps {
  setImage: (image: string | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ setImage }) => {
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

  return (
    <div className="flex w-full items-center justify-center gap-2">
      <label htmlFor="file-upload" className="flex h-1/3 w-1/3 cursor-pointer flex-col items-center justify-center rounded border bg-neutral-800 p-4 text-gray-50 duration-150 hover:bg-neutral-700 md:border-2">
        <FaImage className="text-3xl md:text-4xl lg:text-6xl" />
        <p className="font-mono text-lg lg:text-2xl">Upload Image</p>
      </label>
      <input id="file-upload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
    </div>
  );
};

export default ImageUploader;
