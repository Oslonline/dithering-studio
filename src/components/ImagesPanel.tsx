import React, { useState } from 'react';

export interface UploadedImage {
  id: string;
  url: string;
  name?: string;
  width?: number;
  height?: number;
  size?: number; // bytes
}

interface ImagesPanelProps {
  images: UploadedImage[];
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  removeImage: (id: string) => void;
  addImages: (files: FileList) => void;
  clearAll: () => void;
}

const ImagesPanel: React.FC<ImagesPanelProps> = ({ images, activeId, setActiveId, removeImage, addImages, clearAll }) => {
  const [open, setOpen] = useState(true);
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) addImages(e.target.files);
  };
  return (
    <div className="min-panel p-0">
      <button type="button" onClick={() => setOpen(o => !o)} className="flex w-full items-center justify-between px-4 py-3 text-left font-mono text-[11px] tracking-wide text-gray-300 hover:bg-neutral-800/40 focus-visible:shadow-[var(--focus-ring)]">
        <span className="flex items-center gap-2"><span>{open ? '▾' : '▸'}</span> Images</span>
        <span className="text-[10px] text-gray-500">{images.length}</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-neutral-800 px-4 pt-3 pb-4">
          <div className="flex gap-2">
            <label className="clean-btn flex-1 justify-center text-[10px] cursor-pointer">
              <input type="file" accept="image/*" multiple hidden onChange={handleFileInput} />
              Add
            </label>
            {images.length > 0 && (
              <button type="button" onClick={clearAll} className="clean-btn flex-1 justify-center text-[10px]" title="Remove all images">Clear</button>
            )}
          </div>
          {images.length === 0 && <p className="text-[10px] text-gray-500">No images yet. Use Add to import multiple files.</p>}
          {images.length > 0 && (
            <ul className="max-h-48 space-y-1 overflow-auto pr-1">
              {images.map((img) => {
                const label = `${img.name || 'Image'}${img.width && img.height ? ` — ${img.width}×${img.height}` : ''}${img.size ? ` — ${(img.size / 1024).toFixed(1)} KB` : ''}`;
                return (
                  <li
                    key={img.id}
                    className={`group flex items-center gap-2 rounded border px-2 py-1 ${img.id === activeId ? 'border-blue-600 bg-neutral-900/60' : 'border-neutral-800 bg-neutral-900/30'}`}
                    title={label}
                    aria-label={label}
                  >
                    <button type="button" onClick={() => setActiveId(img.id)} className="flex items-center gap-2 text-left focus-visible:shadow-[var(--focus-ring)]" tabIndex={0}>
                      <img src={img.url} alt={img.name || 'uploaded'} className="h-8 w-8 flex-shrink-0 rounded object-cover" />
                      <span className="max-w-[120px] truncate font-mono text-[10px] text-gray-300">{img.name || 'Image'}</span>
                    </button>
                    <button type="button" onClick={() => removeImage(img.id)} className="ml-auto hidden cursor-pointer text-[10px] text-gray-500 hover:text-red-400 group-hover:inline" title="Remove">✕</button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default ImagesPanel;
