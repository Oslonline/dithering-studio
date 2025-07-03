import { useRef, useState, useEffect } from "react";
import ImageUploader from "../components/ImageUploader";
import PatternDrawer, { patternOptions } from "../components/PatternDrawer";
import { Link } from "react-router-dom";
import { PiFilePngFill } from "react-icons/pi";
import { VscDebugRestart } from "react-icons/vsc";
import { FaFileImage } from "react-icons/fa";
import { Helmet } from "react-helmet-async";

const ImageDitheringTool: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [pattern, setPattern] = useState<number>(1);
  const [threshold, setThreshold] = useState<number>(128);
  const [previewResolution, setPreviewResolution] = useState<number>(350);
  const [hasAppliedDithering, setHasAppliedDithering] = useState<boolean>(false);
  const [downloadFormat, setDownloadFormat] = useState<"png" | "jpeg">("png");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalDimensions = useRef({ width: 0, height: 0 });
  const thresholdDisabled = pattern === 2 || pattern === 8;

  // Apply dithering automatically on change
  useEffect(() => {
    if (image) {
      applyDitheringEffect();
    }
  }, [image, pattern, threshold, previewResolution]);

  const applyDitheringEffect = () => {
    const canvas = canvasRef.current;
    if (canvas && image) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const img = new window.Image();
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

          // Only apply Floyd-Steinberg if pattern 1
          if (pattern === 1) {
            for (let y = 0; y < displayHeight; y++) {
              for (let x = 0; x < displayWidth; x++) {
                const pxIndex = (y * displayWidth + x) * 4;
                const brightness = (data[pxIndex] + data[pxIndex + 1] + data[pxIndex + 2]) / 3;
                const newColor = brightness < threshold ? 0 : 255;
                const error = brightness - newColor;
                data[pxIndex] = newColor;
                data[pxIndex + 1] = newColor;
                data[pxIndex + 2] = newColor;
                // Floyd-Steinberg error diffusion
                if (x < displayWidth - 1) data[pxIndex + 4] += (error * 7) / 16;
                if (y < displayHeight - 1) {
                  if (x > 0) data[pxIndex + displayWidth * 4 - 4] += (error * 3) / 16;
                  data[pxIndex + displayWidth * 4] += (error * 5) / 16;
                  if (x < displayWidth - 1) data[pxIndex + displayWidth * 4 + 4] += (error * 1) / 16;
                }
              }
            }
          }

          // Apply selected pattern (PatternDrawer handles all except 1)
          const patternData = PatternDrawer(data, displayWidth, displayHeight, pattern, threshold);
          ctx.putImageData(patternData, 0, 0);

          setHasAppliedDithering(true);
        };
        img.onerror = (err) => {
          setHasAppliedDithering(false);
          console.error("Error loading image", err);
        };
      }
    }
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement("a");
      link.download = `dithering-effect.${downloadFormat}`;
      link.href = canvas.toDataURL(`image/${downloadFormat}`);
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
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <>
      <Helmet>
        <title>Image Dithering Tool | Floyd Steinberg & Custom Patterns</title>
        <meta name="description" content="Apply dithering effects to your images using Floyd Steinberg algorithm, custom patterns and other popular algorithms. Download your dithered images instantly, no upload required." />
        <meta property="og:title" content="Image Dithering Tool" />
        <meta property="og:description" content="Apply dithering effects to your images using Floyd Steinberg algorithm, custom patterns and other popular algorithms. Download your dithered images instantly." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourdomain.com/Dithering" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Image Dithering Tool" />
        <meta name="twitter:description" content="Apply dithering effects to your images using Floyd Steinberg algorithm, custom patterns and other popular algorithms." />
        <link rel="canonical" href="https://yourdomain.com/Dithering" />
      </Helmet>
      <div id="tool" className="flex min-h-screen w-full flex-col items-center justify-center bg-neutral-950 text-gray-100 md:flex-row">
        <Link className="fixed left-4 top-4 font-mono underline md:text-lg lg:left-6 lg:top-6" to="/">
          Home
        </Link>
        {!image && (
          <div className="flex w-full flex-1 items-center justify-center">
            <main>
              <h1 className="sr-only">Image Dithering Tool</h1>
              <ImageUploader setImage={handleImageChange} />
            </main>
          </div>
        )}
        {image && (
          <div className="flex w-full flex-col items-center justify-center px-2 py-8 md:w-1/2 md:py-0">
            <div className="flex w-full flex-col items-center gap-4">
              <img src={image} alt="Preview of uploaded" className="h-auto w-40 rounded shadow-lg" />
              <section className="flex w-full flex-col gap-3 rounded border border-neutral-800 bg-neutral-900/60 p-4" aria-label="Dithering controls">
                <div className="flex flex-col gap-2">
                  <label htmlFor="pattern-select" className="font-mono text-xs">
                    Pattern
                  </label>
                  <select id="pattern-select" className="rounded px-2 py-1 text-gray-950 hover:cursor-pointer" onChange={(e) => setPattern(Number(e.target.value))} value={pattern}>
                    <optgroup label="-- Error Diffusion --">
                      <option value={1}>Floyd-Steinberg (classic)</option>
                      <option value={3}>Atkinson</option>
                      <option value={4}>Burkes</option>
                      <option value={5}>Stucki</option>
                      <option value={6}>Sierra</option>
                      <option value={12}>Sierra Lite</option>
                      <option value={13}>Two-Row Sierra</option>
                      <option value={14}>Stevenson-Arce</option>
                      <option value={7}>Jarvis-Judice-Ninke</option>
                    </optgroup>
                    <optgroup label="-- Ordered Dithering --">
                      <option value={2}>Bayer 4x4 (ordered)</option>
                      <option value={8}>Bayer 8x8 (ordered)</option>
                    </optgroup>
                    <optgroup label="-- Other / Experimental --">
                      <option value={15}>Threshold (binary)</option>
                      <option value={9}>Halftone (experimental)</option>
                      <option value={10}>Random threshold (experimental)</option>
                      <option value={11}>Dot diffusion (simple, experimental)</option>
                    </optgroup>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="threshold-input" className="flex items-center gap-2 font-mono text-xs">
                    Threshold
                    {thresholdDisabled && <span className="rounded bg-neutral-700 px-2 py-0.5 text-xs text-gray-300">Disabled for this pattern</span>}
                  </label>
                  <input className={`w-full accent-blue-800 ${thresholdDisabled ? "cursor-not-allowed opacity-50" : ""}`} id="threshold-input" onChange={(e) => setThreshold(Number(e.target.value))} value={threshold} type="range" min={0} max={255} step={1} disabled={thresholdDisabled} />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>0</span>
                    <span>{threshold}</span>
                    <span>255</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="preview-resolution" className="font-mono text-xs">
                    Resolution (px)
                  </label>
                  <input className="w-full accent-blue-800" id="preview-resolution" type="range" min={32} max={2048} step={1} value={previewResolution} onChange={(e) => setPreviewResolution(Number(e.target.value))} />
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>32</span>
                    <span>{previewResolution}</span>
                    <span>2048</span>
                  </div>
                </div>
                <div className="flex items-end gap-2 pt-2">
                  <button className="rounded border border-red-600 px-3 py-2 font-mono text-gray-950 duration-100 hover:bg-red-400" onClick={resetSettings} title="Reset">
                    <VscDebugRestart className="text-xl text-red-600" />
                  </button>
                  <button className={`flex items-center gap-1 rounded border bg-blue-800 px-4 py-1.5 font-mono text-gray-50 duration-100 ${!hasAppliedDithering ? "cursor-not-allowed opacity-70" : "hover:bg-blue-600"}`} onClick={downloadImage} disabled={!hasAppliedDithering} title="Download">
                    {downloadFormat === "png" ? <PiFilePngFill className="md:text-xl" /> : <FaFileImage className="md:text-xl" />}
                    <span>Save as {downloadFormat.toUpperCase()}</span>
                  </button>
                  <div className="relative">
                    <select className="rounded border border-gray-300 px-1 py-0.5 text-sm text-gray-950 hover:cursor-pointer focus:outline-none" value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value as "png" | "jpeg")} title="Download format">
                      <option value="png">PNG</option>
                      <option value="jpeg">JPEG</option>
                    </select>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}
        {image && (
          <div className="flex w-full flex-1 items-center justify-center p-2 md:w-1/2">
            <canvas ref={canvasRef} className="canvas max-h-[80vh] w-full rounded border border-neutral-800 bg-neutral-900 object-contain shadow-lg md:w-auto md:max-w-full" aria-label="Dithered image preview" />
          </div>
        )}
      </div>
    </>
  );
};

export default ImageDitheringTool;
