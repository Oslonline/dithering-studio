import { useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ImageUploader from "../components/ImageUploader";
import { patternMeta } from "../components/PatternDrawer";
import useDithering from "../hooks/useDithering";
import { predefinedPalettes } from "../utils/palettes";

const isErrorDiffusion = (p: number) => [1, 3, 4, 5, 6, 7, 12, 13, 14].includes(p);

const ImageDitheringTool: React.FC = () => {
  // UI state
  const [image, setImage] = useState<string | null>(null);
  const [pattern, setPattern] = useState<number>(1);
  const [threshold, setThreshold] = useState<number>(128);
  const [workingResolution, setWorkingResolution] = useState<number>(512);
  const [workingResInput, setWorkingResInput] = useState<string>("512");
  const [downloadFormat, setDownloadFormat] = useState<"png" | "jpeg">("png");
  const [paletteId, setPaletteId] = useState<string | null>(null);
  const [invert, setInvert] = useState(false);
  const [serpentine, setSerpentine] = useState(true);
  const [showThresholdBubble, setShowThresholdBubble] = useState(false);
  const thresholdDisabled = !patternMeta[pattern]?.supportsThreshold || !!paletteId;

  const { canvasRef, processedCanvasRef, hasApplied, canvasUpdatedFlag, resetCanvas } = useDithering({
    image,
    pattern,
    threshold,
    workingResolution,
    invert,
    serpentine,
    isErrorDiffusion: isErrorDiffusion(pattern),
    paletteId,
  });

  const handleImageChange = (img: string | null) => setImage(img);

  const resetAll = () => {
    setImage(null);
    setPattern(1);
    setThreshold(128);
    setWorkingResolution(512);
    setWorkingResInput("512");
    setInvert(false);
    setSerpentine(true);
  setPaletteId(null);
    resetCanvas();
  };

  // When palette toggles on, ensure invert is off (avoid confusing color inversion)
  if (paletteId && invert) {
    // simple synchronous safeguard (not using effect to keep minimal)
    setInvert(false);
  }

  const downloadImage = () => {
    const canvas = processedCanvasRef.current || canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `dithering-effect.${downloadFormat}`;
    link.href = canvas.toDataURL(`image/${downloadFormat}`);
    link.click();
  };

  return (
    <>
      <Helmet>
        <title>Image Dithering Tool | Multi Algorithm (Floyd–Steinberg, Bayer, Sierra)</title>
        <meta name="description" content="Client-side image dithering: Floyd–Steinberg, Atkinson, Stucki, Sierra family, Jarvis, Bayer ordered, halftone & more." />
        <link rel="canonical" href="https://yourdomain.com/Dithering" />
      </Helmet>
      <div id="tool" className="flex min-h-screen w-full flex-col md:flex-row">
        <aside className="flex w-full flex-shrink-0 flex-col border-b border-neutral-800 bg-[#0d0d0d] md:w-80 md:border-b-0 md:border-r">
          <header className="flex items-center justify-between px-4 pb-3 pt-4">
            <h1 className="font-mono text-xs tracking-wide text-gray-300">Dithering Studio</h1>
            <Link to="/" className="clean-btn px-3 py-1 !text-[11px]">
              Home
            </Link>
          </header>
          <div className="flex-1 overflow-y-auto px-4 pb-6">
            {!image && (
              <div className="min-panel space-y-3 p-4">
                <h2 className="font-anton text-xl leading-tight">Dithering Studio</h2>
                <p className="text-[11px] leading-relaxed text-gray-400">Drop or select an image in the main area to begin. Your picture never leaves this window.</p>
                <ul className="ml-4 list-disc space-y-1 text-[10px] text-gray-500">
                  <li>Choose algorithm & tweak threshold.</li>
                  <li>Adjust working resolution (internal quality).</li>
                  <li>Invert or enable serpentine scanning.</li>
                  <li>Download instantly as PNG or JPEG.</li>
                </ul>
              </div>
            )}
            {image && (
              <div className="space-y-6">
                <div className="min-panel space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="pattern-select" className="font-mono text-[11px] tracking-wide text-gray-300">
                      Algorithm
                    </label>
                    <span className="badge">{patternMeta[pattern]?.category}</span>
                  </div>
                  <select id="pattern-select" className="clean-input" value={pattern} onChange={(e) => setPattern(Number(e.target.value))}>
                    <optgroup label="Error Diffusion">
                      <option value={1}>Floyd-Steinberg</option>
                      <option value={3}>Atkinson</option>
                      <option value={4}>Burkes</option>
                      <option value={5}>Stucki</option>
                      <option value={6}>Sierra</option>
                      <option value={12}>Sierra Lite</option>
                      <option value={13}>Two-Row Sierra</option>
                      <option value={14}>Stevenson-Arce</option>
                      <option value={7}>Jarvis-Judice-Ninke</option>
                    </optgroup>
                    <optgroup label="Ordered">
                      <option value={16}>Bayer 2×2</option>
                      <option value={2}>Bayer 4×4</option>
                      <option value={8}>Bayer 8×8</option>
                      <option value={17}>Blue noise 64×64</option>
                    </optgroup>
                    <optgroup label="Other / Experimental">
                      <option value={15}>Binary Threshold</option>
                      <option value={9}>Halftone</option>
                      <option value={10}>Random Threshold</option>
                      <option value={11}>Dot Diffusion (simple)</option>
                    </optgroup>
                  </select>
                  <p className="text-[11px] leading-snug text-gray-400">
                    {patternMeta[pattern]?.description}
                    {patternMeta[pattern]?.note && <span className="ml-1 italic text-gray-500">{patternMeta[pattern]?.note}</span>}
                  </p>
                </div>
                <div className="min-panel space-y-2 p-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="palette-select" className="font-mono text-[11px] tracking-wide text-gray-300">Palette (Floyd–Steinberg only)</label>
                    {paletteId && <button className="clean-btn px-2 py-0 text-[10px]" onClick={() => setPaletteId(null)}>Clear</button>}
                  </div>
                  <select
                    id="palette-select"
                    className="clean-input"
                    value={paletteId ?? ""}
                    onChange={(e) => setPaletteId(e.target.value === "" ? null : e.target.value)}
                  >
                    <option value="">None (Binary BW)</option>
                    {predefinedPalettes.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                  {paletteId && (
                    <div className="flex flex-wrap gap-1">
                      {predefinedPalettes.find(p => p.id === paletteId)?.colors.map((c,i) => (
                        <span key={i} className="inline-block h-4 w-4 rounded-sm border border-neutral-600" style={{ background:`rgb(${c[0]},${c[1]},${c[2]})` }} />
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-gray-500">Quantizes colors to nearest palette entry with error diffusion.</p>
                </div>
                <div className="min-panel space-y-2 p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] tracking-wide text-gray-300">Luminance Threshold</span>
                    {thresholdDisabled && <span className="badge">Auto</span>}
                  </div>
                  <div className="relative">
                    <input
                      id="threshold-input"
                      type="range"
                      min={0}
                      max={255}
                      step={1}
                      value={threshold}
                      disabled={thresholdDisabled}
                      className={`clean-range ${thresholdDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                      onChange={(e) => setThreshold(Number(e.target.value))}
                      onMouseDown={() => setShowThresholdBubble(true)}
                      onMouseUp={() => setShowThresholdBubble(false)}
                      onMouseLeave={() => setShowThresholdBubble(false)}
                      onTouchStart={() => setShowThresholdBubble(true)}
                      onTouchEnd={() => setShowThresholdBubble(false)}
                    />
                    {showThresholdBubble && !thresholdDisabled && (
                      <span className="value-bubble" style={{ left: `${(threshold / 255) * 100}%` }}>
                        {threshold}
                      </span>
                    )}
                  </div>
                  <div className={`flex justify-between text-[10px] ${thresholdDisabled ? 'text-gray-600' : 'text-gray-500'}`}>
                    <span>0</span>
                    <span>{threshold}</span>
                    <span>255</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => !paletteId && setInvert((v) => !v)}
                    disabled={!!paletteId}
                    className={`clean-btn flex-1 ${invert ? "border-blue-600 text-blue-400" : ""} ${paletteId ? "opacity-40 cursor-not-allowed" : ""}`}
                    title={paletteId ? "Invert disabled when palette active" : "Invert black & white output"}
                  >
                    {invert ? "Inverted" : "Invert"}
                  </button>
                  <button onClick={() => isErrorDiffusion(pattern) && setSerpentine((v) => !v)} disabled={!isErrorDiffusion(pattern)} className={`clean-btn flex-1 ${serpentine && isErrorDiffusion(pattern) ? "border-blue-600 text-blue-400" : ""}`} title="Alternate scan direction">
                    Serpentine
                  </button>
                </div>
                <div className="min-panel space-y-3 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] tracking-wide text-gray-300">Working Resolution</span>
                    <span className="text-[10px] text-gray-500">{workingResolution}px</span>
                  </div>
                  <div className="space-y-2">
                    <div className="relative">
                      <input
                        type="range"
                        min={32}
                        max={2048}
                        step={16}
                        value={workingResolution}
                        className="clean-range"
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setWorkingResolution(val);
                          setWorkingResInput(String(val));
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="clean-input w-24"
                        value={workingResInput}
                        onChange={(e) => {
                          const v = e.target.value.trim();
                          // Allow empty for editing
                          if (v === "") {
                            setWorkingResInput("");
                            return;
                          }
                          if (/^\d+$/.test(v)) {
                            let num = parseInt(v, 10);
                            num = Math.min(4096, Math.max(16, num));
                            setWorkingResInput(String(num));
                            setWorkingResolution(num);
                          }
                        }}
                        onBlur={() => {
                          if (workingResInput === "") {
                            setWorkingResInput(String(workingResolution));
                          }
                        }}
                        aria-label="Working resolution in pixels"
                      />
                      <span className="text-[10px] text-gray-500">px width</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500">Pixel width used for processing & download.</p>
                </div>
                <div className="flex items-stretch gap-2">
                  <button className="clean-btn flex items-center gap-1 border-dashed px-2 text-[11px] opacity-70 transition hover:opacity-100" onClick={resetAll} title="Reset all settings" style={{ flex: "0 0 auto" }}>
                    ↺
                  </button>
                  <div className="group relative flex-1">
                    <button className="clean-btn clean-btn-primary w-full justify-center pr-12" disabled={!hasApplied} onClick={downloadImage} title={`Download image as ${downloadFormat.toUpperCase()}`}>
                      Download
                    </button>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-1">
                      <div className="relative">
                        <select aria-label="Download format" className="download-format-select pr-5" value={downloadFormat} onChange={(e) => setDownloadFormat(e.target.value as "png" | "jpeg")} disabled={!hasApplied}>
                          <option value="png">PNG</option>
                          <option value="jpeg">JPEG</option>
                        </select>
                        <span className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-blue-200 opacity-80">▾</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
        <main className="flex flex-1 items-center justify-center p-4">
          {!image && (
            <div className="w-full max-w-lg">
              <ImageUploader setImage={handleImageChange} />
            </div>
          )}
          {image && (
            <div className="flex h-full w-full items-center justify-center overflow-auto">
              <div className="canvas-frame flex items-center justify-center p-2" style={{ background: 'transparent', border: 'none' }}>
                <canvas
                  ref={canvasRef}
                  className={`pixelated ${canvasUpdatedFlag ? 'updated' : ''}`}
                  aria-label="Dithered image preview"
                  style={{ display:'block' }}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default ImageDitheringTool;
