import { useEffect, useState } from "react";
import DesktopImageUploader from "./DesktopImageUploader";
import MobileImageUploader from "./MobileImageUploader";

interface ImageUploaderProps { setImage: (image: string | null) => void; }
const ImageUploader: React.FC<ImageUploaderProps> = ({ setImage }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const touchCapable = matchMedia("(pointer: coarse)").matches || 'ontouchstart' in window;
    const smallViewport = window.innerWidth < 640; // tailwind sm breakpoint
    setIsMobile(touchCapable || smallViewport);
    const listener = () => {
      const small = window.innerWidth < 640;
      setIsMobile(touchCapable || small);
    };
    window.addEventListener("resize", listener);
    return () => window.removeEventListener("resize", listener);
  }, []);

  return isMobile ? <MobileImageUploader setImage={setImage} /> : <DesktopImageUploader setImage={setImage} />;
};

export default ImageUploader;
