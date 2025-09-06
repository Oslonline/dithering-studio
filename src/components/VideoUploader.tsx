import React, { useEffect, useState } from 'react';
import DesktopVideoUploader from './DesktopVideoUploader';

interface VideoUploaderProps { onVideoSelected: (item: { url: string; name?: string; file?: File }) => void; }

const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoSelected }) => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const touchCapable = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    const smallViewport = window.innerWidth < 640;
    setIsMobile(touchCapable || smallViewport);
    const onResize = () => setIsMobile(touchCapable || window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (isMobile) {
    return (
      <div className="w-full">
        <label className="block text-center font-mono text-xs tracking-wide text-gray-300 mb-2">Select a video</label>
        <input type="file" accept="video/*" onChange={(e)=>{ const f=e.target.files?.[0]; if (f && f.type.startsWith('video/')) { const url=URL.createObjectURL(f); onVideoSelected({url,name:f.name,file:f}); } }} className="clean-input w-full" />
        <p className="mt-2 text-center text-[10px] text-gray-500">MP4/WebM (≤30s)</p>
      </div>
    );
  }
  return <DesktopVideoUploader onVideoSelected={onVideoSelected} />;
};

export default VideoUploader;
