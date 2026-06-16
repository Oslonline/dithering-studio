"use client";

import ImageUploader from "./ImageUploader";
import SampleImagePicker from "./SampleImagePicker";

interface ImageUploadSectionProps {
  onImagesAdded: (items: { url: string; name?: string; file?: File }[]) => void;
  onSampleSelect: (src: string, name: string) => void;
}

export default function ImageUploadSection({ onImagesAdded, onSampleSelect }: ImageUploadSectionProps) {
  return (
    <div className="w-full space-y-5">
      <ImageUploader onImagesAdded={onImagesAdded} />
      <SampleImagePicker onSelect={onSampleSelect} />
    </div>
  );
}
