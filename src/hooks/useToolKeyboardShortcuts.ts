import { useEffect } from 'react';
import { UploadedImage } from '../components/ImagesPanel';

interface Params {
  images: UploadedImage[];
  activeImageId: string | null;
  setActiveImageId: (id: string | null) => void;
  setFocusMode: (fn: (v: boolean) => boolean | boolean) => void;
  setShowGrid: (fn: (v: boolean) => boolean | boolean) => void;
  setGridSize: (fn: (v: number) => number) => void;
  mediaActive: boolean;
}

/**
 * Handles global keyboard shortcuts for the dithering tool.
 * f: toggle focus mode
 * g: toggle grid / Shift+g: cycle size
 * ArrowLeft/Right: cycle images (when >1)
 */
export function useToolKeyboardShortcuts({ images, activeImageId, setActiveImageId, setFocusMode, setShowGrid, setGridSize, mediaActive }: Params) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const inEditable = target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable);
      if (inEditable) return;
      if (e.key === 'f' || e.key === 'F') {
        setFocusMode((f: boolean) => !f);
        e.preventDefault();
      } else if (e.key === 'g' || e.key === 'G') {
        if (!mediaActive) { return; }
        if (e.shiftKey) {
          setShowGrid(true as any);
          setGridSize((gs: number) => {
            const order = [4, 6, 8, 12, 16];
            const idx = order.indexOf(gs);
            return order[(idx + 1) % order.length];
          });
        } else {
          setShowGrid((s: boolean) => !s);
        }
        e.preventDefault();
      } else if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && images.length > 1) {
        const idx = images.findIndex(i => i.id === activeImageId);
        if (idx >= 0) {
          const dir = e.key === 'ArrowRight' ? 1 : -1;
          const next = (idx + dir + images.length) % images.length;
          setActiveImageId(images[next].id);
          e.preventDefault();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images, activeImageId, setActiveImageId, setFocusMode, setShowGrid, setGridSize, mediaActive]);
}

export default useToolKeyboardShortcuts;
