import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

export interface UploadedVideo {
  id: string;
  url: string;
  name?: string;
  width?: number;
  height?: number;
  size?: number; // bytes
  duration?: number; // seconds
}

interface VideosPanelProps {
  videos: UploadedVideo[];
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  removeVideo: (id: string) => void;
  addVideos: (files: FileList) => void;
  clearAll: () => void;
}

const VideosPanel: React.FC<VideosPanelProps> = ({ videos, activeId, setActiveId, removeVideo, addVideos, clearAll }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) addVideos(e.target.files);
  };
  return (
    <div className="min-panel p-0">
      <button type="button" onClick={() => setOpen(o => !o)} className="flex w-full items-center justify-between px-4 py-3 text-left font-mono text-[11px] tracking-wide text-gray-300 hover:bg-neutral-800/40 focus-visible:shadow-[var(--focus-ring)]">
        <span className="flex items-center gap-2"><span>{open ? '▾' : '▸'}</span> {t('tool.videosPanel.title')}</span>
        <span className="text-[10px] text-gray-500">{videos.length}</span>
      </button>
      {open && (
        <div className="space-y-3 border-t border-neutral-800 px-4 pt-3 pb-4">
          <div className="flex gap-2">
            <label className="clean-btn flex-1 justify-center text-[10px] cursor-pointer">
              <input type="file" accept="video/*" multiple hidden onChange={handleFileInput} />
              {t('tool.videosPanel.add')}
            </label>
            {videos.length > 0 && (
              <button type="button" onClick={clearAll} className="clean-btn flex-1 justify-center text-[10px]" title={t('tool.videosPanel.clearAllHint')}>{t('tool.videosPanel.clear')}</button>
            )}
          </div>
          {videos.length === 0 && <p className="text-[10px] text-gray-500">{t('tool.videosPanel.noVideos')}</p>}
          {videos.length > 0 && (
            <ul className="max-h-48 space-y-1 overflow-auto pr-1">
              {videos.map((vid) => {
                const durationStr = vid.duration ? ` — ${Math.floor(vid.duration)}s` : '';
                const sizeStr = vid.size ? ` — ${(vid.size / (1024 * 1024)).toFixed(1)} MB` : '';
                const label = `${vid.name || 'Video'}${vid.width && vid.height ? ` — ${vid.width}×${vid.height}` : ''}${durationStr}${sizeStr}`;
                return (
                  <li
                    key={vid.id}
                    className={`group flex items-center gap-2 rounded border px-2 py-1 ${vid.id === activeId ? 'border-blue-600 bg-neutral-900/60' : 'border-neutral-800 bg-neutral-900/30'}`}
                    title={label}
                    aria-label={label}
                  >
                    <button type="button" onClick={() => setActiveId(vid.id)} className="flex items-center gap-2 text-left focus-visible:shadow-[var(--focus-ring)]" tabIndex={0}>
                      <div className="h-8 w-8 flex-shrink-0 rounded bg-neutral-800 flex items-center justify-center text-gray-500 text-xs">🎬</div>
                      <span className="max-w-[120px] truncate font-mono text-[10px] text-gray-300">{vid.name || t('tool.videosPanel.video')}</span>
                    </button>
                    <button type="button" onClick={() => removeVideo(vid.id)} className="ml-auto hidden cursor-pointer text-[10px] text-gray-500 hover:text-red-400 group-hover:inline" title={t('tool.videosPanel.remove')}>✕</button>
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

export default VideosPanel;
