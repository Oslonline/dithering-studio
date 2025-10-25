import React, { useEffect, useState } from 'react';
import DesktopVideoUploader from './DesktopVideoUploader';
import MobileVideoUploader from './MobileVideoUploader';

interface VideoUploaderProps { onVideosSelected: (items: { url: string; name?: string; file?: File }[]) => void; }

const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideosSelected }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const touchCapable = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;
    const smallViewport = window.innerWidth < 640;
    setIsMobile(touchCapable || smallViewport);
    const onResize = () => setIsMobile(touchCapable || window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isMobile ? <MobileVideoUploader onVideosSelected={onVideosSelected} /> : <DesktopVideoUploader onVideosSelected={onVideosSelected} />;
};

export default VideoUploader;
