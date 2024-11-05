import React, { useRef, useState } from "react";
import ImageUploader from "./components/ImageUploader";
import PatternDrawer from "./components/PatternDrawer";

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [pattern, setPattern] = useState<string>("square");
  const [threshold, setThreshold] = useState<number>(128);
  const [previewResolution, setPreviewResolution] = useState<number>(350);
  const [downloadResolution, setDownloadResolution] = useState<number>(1000);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalDimensions = useRef({ width: 0, height: 0 });
  const style = "dither";

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

          if (style === "dither") {
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
        };
      }
    }
  };

  const downloadImage = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (ctx && image) {
      const img = new Image();
      img.src = image;

      img.onload = () => {
        const aspectRatio = img.width / img.height;
        const downloadWidth = Math.min(downloadResolution, img.width);
        const downloadHeight = downloadWidth / aspectRatio;

        canvas.width = downloadWidth;
        canvas.height = downloadHeight;

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(img, 0, 0, downloadWidth, downloadHeight);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
            const newColor = brightness < threshold ? 0 : 255;
            data[index] = newColor;
            data[index + 1] = newColor;
            data[index + 2] = newColor;
            const error = brightness - newColor;

            if (x < canvas.width - 1) data[index + 4] += (error * 7) / 16;
            if (y < canvas.height - 1) {
              if (x > 0) data[index + canvas.width * 4 - 4] += (error * 3) / 16;
              data[index + canvas.width * 4] += (error * 5) / 16;
              if (x < canvas.width - 1) data[index + canvas.width * 4 + 4] += (error * 1) / 16;
            }
          }
        }

        const patternedData = PatternDrawer(data, canvas.width, canvas.height, pattern);
        ctx.putImageData(patternedData, 0, 0);

        const link = document.createElement("a");
        link.download = "dithering-effect.png";
        link.href = canvas.toDataURL("image/png");
        link.click();
      };
    }
  };

  return (
    <div className="box-border flex min-h-screen flex-col items-center gap-12 bg-slate-900 p-4 text-gray-100 md:max-h-screen md:flex-row md:gap-0">
      <div className="flex w-1/2 flex-col items-center gap-6">
        {image && <img src={image} alt="Preview" className="h-auto max-h-72 max-w-[33%] lg:max-h-80 2xl:max-h-96" />}
        <div className="flex w-fit flex-col gap-2">
          <ImageUploader setImage={setImage} />
          <select className="rounded px-2 py-1 text-gray-950" onChange={(e) => setPattern(e.target.value)} value={pattern}>
            <option value="1">default (dither)</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">Bayer</option>
          </select>
          <div className="flex flex-col">
            <label htmlFor="threshold-input" className="text-sm italic">
              Threshold
            </label>
            <input id="threshold-input" onChange={(e) => setThreshold(Number(e.target.value))} value={threshold} type="range" min={60} max={140} />
          </div>
          <div className="flex flex-col">
            <label htmlFor="preview-resolution" className="text-sm italic">
              Preview Resolution
            </label>
            <input className="text-gray-950 px-1 py-0.5" id="preview-resolution" min={100} type="number" value={previewResolution} onChange={(e) => setPreviewResolution(Number(e.target.value))} />
          </div>
          <div className="flex flex-col">
            <label htmlFor="download-resolution" className="text-sm italic">
              Download Resolution
            </label>
            <input className="text-gray-950 px-1 py-0.5" id="download-resolution" min={100} type="number" value={downloadResolution} onChange={(e) => setDownloadResolution(Number(e.target.value))} />
          </div>
        </div>
        <div className="flex gap-2">
          <button className="rounded bg-blue-300 px-2 py-1 text-gray-950 duration-100 hover:bg-blue-400" onClick={applyDitheringEffect}>
            Apply Dithering Effect
          </button>
          <button className="rounded bg-blue-300 px-2 py-1 text-gray-950 duration-100 hover:bg-blue-400" onClick={downloadImage}>
            Save as PNG
          </button>
        </div>
      </div>
      <div className="flex w-full items-center justify-center md:w-1/2">
        <canvas ref={canvasRef} className="canvas h-auto min-h-96 max-w-full md:max-h-screen" />
      </div>
    </div>
  );
};

export default App;
