import { useRef, useState } from "react";
import ImageUploader from "../components/ImageUploader";
import PatternDrawer from "../components/PatternDrawer";
import { Link } from "react-router-dom";
import { PiFilePngFill } from "react-icons/pi";
import { VscDebugRestart } from "react-icons/vsc";

const ImageDitheringTool: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [pattern, setPattern] = useState<number>(1);
  const [threshold, setThreshold] = useState<number>(128);
  const [previewResolution, setPreviewResolution] = useState<number>(350);
  const [hasAppliedDithering, setHasAppliedDithering] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalDimensions = useRef({ width: 0, height: 0 });

  const applyDitheringEffect = () => {
    const canvas = canvasRef.current;
    if (canvas && image) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const img = new Image();
        img.src = image;
        img.onload = () => {
          originalDimensions.current.width = img.width;
          originalDimensions.current.height = img.height;

          const aspectRatio = img.width / img.height;
          const displayWidth = Math.min(previewResolution, img.width);
          const displayHeight = displayWidth / aspectRatio;
          canvas.width = displayWidth;
          canvas.height = displayHeight;

          ctx.drawImage(img, 0, 0, displayWidth, displayHeight);

          const imageData = ctx.getImageData(0, 0, displayWidth, displayHeight);
          const data = imageData.data;

          if (pattern === 1) {
            for (let y = 0; y < displayHeight; y++) {
              for (let x = 0; x < displayWidth; x++) {
                const pxIndex = (y * displayWidth + x) * 4;
                const brightness = (data[pxIndex] + data[pxIndex + 1] + data[pxIndex + 2]) / 3;
                const newColor = brightness < threshold ? 0 : 255;
                data[pxIndex] = newColor;
                data[pxIndex + 1] = newColor;
                data[pxIndex + 2] = newColor;
                const error = brightness - newColor;

                if (x < displayWidth - 1) {
                  data[pxIndex + 4] += (error * 7) / 16;
                }
                if (y < displayHeight - 1) {
                  if (x > 0) data[pxIndex + displayWidth * 4 - 4] += (error * 3) / 16;
                  data[pxIndex + displayWidth * 4] += (error * 5) / 16;
                  if (x < displayWidth - 1) data[pxIndex + displayWidth * 4 + 4] += (error * 1) / 16;
                }
              }
            }
          }

          const patternData = PatternDrawer(data, displayWidth, displayHeight, pattern);
          ctx.putImageData(patternData, 0, 0);

          setHasAppliedDithering(true);
        };
        img.onerror = (err) => {
          console.error("Error loading image", err);
        };
      }
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement("a");
      link.download = "dithering-effect.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  };

  const handleImageChange = (image: string | null) => {
    setImage(image);
    setHasAppliedDithering(false);
  };

  const resetSettings = () => {
    setImage(null);
    setPattern(1);
    setThreshold(128);
    setPreviewResolution(350);
    setHasAppliedDithering(false);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  return (
    <div id="tool" className="flex min-h-screen w-full flex-col justify-center bg-neutral-950 text-gray-100 md:max-h-screen md:flex-row">
      <Link className="fixed left-4 top-4 font-mono underline md:text-lg lg:left-6 lg:top-6" to="/">
        Home
      </Link>
      {!image && <ImageUploader setImage={handleImageChange} />}

      {image && (
        <div className="flex w-full flex-col items-center justify-center px-4 py-16 md:w-1/2 md:py-0">
          <div className="flex w-full flex-col items-center">
            <div className="flex w-fit flex-col gap-2 rounded border p-2">
              <div>
                <img src={image} alt="Preview" className="h-auto w-52" />
              </div>
              {/* Settings */}
              <div className="flex flex-col">
                <label htmlFor="pattern-select" className="text-sm italic">
                  Pattern
                </label>
                <select id="pattern-select" className="rounded px-2 py-1 text-gray-950" onChange={(e) => setPattern(Number(e.target.value))} value={pattern}>
                  <option value={1}>Default (Floyd Steinberg)</option>
                  <option value={2}>2 (experimental)</option>
                  <option value={3}>3 (experimental)</option>
                  <option value={4}>4 (experimental)</option>
                  <option value={5}>5 (experimental)</option>
                  <option value={6}>6 (experimental)</option>
                </select>
              </div>
              <div className="flex flex-col">
                <label htmlFor="threshold-input" className="text-sm italic">
                  Threshold
                </label>
                <input className="caret-blue-800" id="threshold-input" onChange={(e) => setThreshold(Number(e.target.value))} value={threshold} type="range" min={20} max={180} />
              </div>
              <div className="flex flex-col">
                <label htmlFor="preview-resolution" className="text-sm italic">
                  Resolution (px)
                </label>
                <input className="px-1 py-0.5 text-gray-950" id="preview-resolution" type="number" value={previewResolution} onChange={(e) => setPreviewResolution(Number(e.target.value))} />
              </div>
              {/* CTA buttons */}
              <div className="flex gap-2">
                <button className="rounded border border-red-600 p-2 px-3 font-mono text-gray-950 duration-100 hover:bg-red-500" onClick={resetSettings}>
                  <VscDebugRestart className="text-xl text-red-600" />
                </button>
                <button className="p-x-2 rounded bg-blue-800 px-4 py-2 font-mono text-gray-50 duration-100 hover:bg-blue-600" onClick={applyDitheringEffect}>
                  Apply Dithering Effect
                </button>
                <button className={`p-x-2 flex items-center gap-1 rounded bg-blue-800 px-4 py-2 font-mono text-gray-50 duration-100 ${!hasAppliedDithering ? "cursor-not-allowed opacity-70" : "hover:bg-blue-600"}`} onClick={downloadImage} disabled={!hasAppliedDithering}>
                  <PiFilePngFill className="md:text-xl" />
                  <p>Save as PNG</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {image && (
        <div className="box-border flex max-h-screen w-full items-center justify-center p-16 md:w-1/2">
          <canvas ref={canvasRef} className="canvas max-h-full min-h-full w-full object-contain md:w-auto md:max-w-full" />
        </div>
      )}
    </div>
  );
};

export default ImageDitheringTool;
