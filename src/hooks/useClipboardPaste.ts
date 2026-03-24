import { useEffect, useRef } from 'react';
import { validateImage, validateVideo } from '../utils/validation';

type AddItems = (items: { url: string; name?: string; file?: File }[]) => void;

interface Params {
  videoMode: boolean;
  setVideoMode: (v: boolean) => void;
  navigate: (to: string) => void;
  activeLang: string;
  addImages: AddItems;
  addVideos: AddItems;
}

let pendingFiles: File[] | null = null;
let pendingIsVideo = false;

export function useClipboardPaste({ videoMode, setVideoMode, navigate, activeLang, addImages, addVideos }: Params) {
  const addImagesRef = useRef(addImages);
  const addVideosRef = useRef(addVideos);
  const pendingProcessRef = useRef<(() => void) | null>(null);

  addImagesRef.current = addImages;
  addVideosRef.current = addVideos;

  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable)) return;

      const items = e.clipboardData?.items;
      if (!items?.length) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }
      if (!files.length) return;

      const isImageFile = (f: File) => f.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp)$/i.test(f.name);
      const isVideoFile = (f: File) => f.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(f.name);

      const imageFiles = files.filter(isImageFile);
      const videoFiles = files.filter(isVideoFile);
      if (!imageFiles.length && !videoFiles.length) return;

      e.preventDefault();

      const processImmediately = async (imgs: File[], vids: File[]) => {
        if (imgs.length) {
          const collected: { url: string; name?: string; file?: File }[] = [];
          let remaining = imgs.length;
          for (const f of imgs) {
            try { await validateImage(f); } catch { remaining--; continue; }
            const reader = new FileReader();
            reader.onload = (ev) => {
              collected.push({ url: ev.target?.result as string, name: f.name || 'clipboard-image.png', file: f });
              if (--remaining === 0) addImagesRef.current(collected);
            };
            reader.onerror = () => { remaining--; };
            reader.readAsDataURL(f);
          }
        }
        if (vids.length) {
          const collected: { url: string; name?: string; file?: File }[] = [];
          for (const f of vids) {
            try { await validateVideo(f); } catch { continue; }
            collected.push({ url: URL.createObjectURL(f), name: f.name || 'clipboard-video', file: f });
          }
          if (collected.length) addVideosRef.current(collected);
        }
      };

      if (imageFiles.length && !videoMode) return processImmediately(imageFiles, []);
      if (videoFiles.length && videoMode) return processImmediately([], videoFiles);

      const pasteIsVideo = videoFiles.length > 0;
      pendingFiles = pasteIsVideo ? videoFiles : imageFiles;
      pendingIsVideo = pasteIsVideo;
      pendingProcessRef.current = () => {
        const files = pendingFiles;
        pendingFiles = null;
        if (!files?.length) return;
        if (pendingIsVideo) {
          const collected: { url: string; name?: string; file?: File }[] = [];
          for (const f of files) collected.push({ url: URL.createObjectURL(f), name: f.name || 'clipboard-video', file: f });
          addVideosRef.current(collected);
        } else {
          const collected: { url: string; name?: string; file?: File }[] = [];
          let remaining = files.length;
          for (const f of files) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              collected.push({ url: ev.target?.result as string, name: f.name || 'clipboard-image.png', file: f });
              if (--remaining === 0) addImagesRef.current(collected);
            };
            reader.onerror = () => { remaining--; };
            reader.readAsDataURL(f);
          }
        }
      };
      setVideoMode(pasteIsVideo);
      navigate(`/${activeLang}/Dithering/${pasteIsVideo ? 'Video' : 'Image'}`);
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [videoMode, setVideoMode, navigate, activeLang]);

  useEffect(() => {
    const process = pendingProcessRef.current;
    if (process) {
      pendingProcessRef.current = null;
      process();
    }
  }, [videoMode]);
}

export default useClipboardPaste;
