import { useEffect, useState, useRef } from "react";
import { canvasToSVG } from "../utils/export";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ImageUploader from "../components/ImageUploader";
import { patternMeta } from "../components/PatternDrawer";
import useDithering from "../hooks/useDithering";
import { predefinedPalettes } from "../utils/palettes";

const isErrorDiffusion = (p: number) => [1, 3, 4, 5, 6, 7, 12, 13, 14].includes(p);

const ImageDitheringTool: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [pattern, setPattern] = useState<number>(1);
  const [threshold, setThreshold] = useState<number>(128);
  const [workingResolution, setWorkingResolution] = useState<number>(512);
  const [workingResInput, setWorkingResInput] = useState<string>("512");
  const [webpSupported, setWebpSupported] = useState(true);
  useEffect(()=>{
    try {
      const c = document.createElement('canvas');
      c.width = c.height = 2;
      const data = c.toDataURL('image/webp');
      if (!data.startsWith('data:image/webp')) setWebpSupported(false);
    } catch { setWebpSupported(false); }
  }, []);
  const [paletteId, setPaletteId] = useState<string | null>(null);
  const [activePaletteColors, setActivePaletteColors] = useState<[number,number,number][] | null>(null);
  const [invert, setInvert] = useState(false);
  const [serpentine, setSerpentine] = useState(true);
  const [focusMode, setFocusMode] = useState(false);
  const [showThresholdBubble, setShowThresholdBubble] = useState(false);
  const thresholdDisabled = !patternMeta[pattern]?.supportsThreshold;
  if (paletteId && invert) setInvert(false);

  const effectivePaletteId = paletteId;
  const effectivePalette = (effectivePaletteId ? predefinedPalettes.find(p=>p.id===effectivePaletteId)?.colors : null) || null;
  useEffect(()=>{ if (effectivePalette) setActivePaletteColors(effectivePalette.map(c=>[...c] as [number,number,number])); else setActivePaletteColors(null); }, [effectivePaletteId]);

  const { canvasRef, processedCanvasRef, hasApplied, canvasUpdatedFlag } = useDithering({
    image,
    pattern,
    threshold,
    workingResolution,
    invert,
    serpentine,
    isErrorDiffusion: isErrorDiffusion(pattern),
    paletteId,
  paletteColors: activePaletteColors || undefined,
  });

  useEffect(()=>{
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'f' || e.key === 'F')) {
        const t = e.target as HTMLElement;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
        setFocusMode(f=>!f);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleImageChange = (img: string | null) => setImage(img);

  const uploadAnother = () => {
    setImage(null);
  };
  const [showDownload, setShowDownload] = useState(false);
  const downloadRef = useRef<HTMLDivElement|null>(null);
  const [shareText, setShareText] = useState("");
  const shareMessages = useRef<string[]>([
    "Floyd–Steinberg diffusion result",
    "High contrast ordered-to-diffusion comparison",
    "Palette-constrained pixel texture",
    "Classic error diffusion aesthetic",
    "Retro styled monochrome grain",
    "Algorithmic dithering output",
    "Diffusion + palette quantization",
    "Minimal color, maximal texture",
    "Granular luminance mapping",
    "Pixel-level tone dispersion"
  ]);
  useEffect(()=>{
    if (showDownload) {
      const base = shareMessages.current[Math.floor(Math.random()*shareMessages.current.length)];
      setShareText(`${base} — Dithering Studio by @Oslo418`);
    }
  }, [showDownload]);
  useEffect(()=>{
    const onDocClick = (e: MouseEvent) => {
      if (!showDownload) return;
      if (downloadRef.current && !downloadRef.current.contains(e.target as Node)) {
        setShowDownload(false);
      }
    };
    const onKey = (e: KeyboardEvent) => { if (e.key==='Escape') setShowDownload(false); };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return ()=>{ document.removeEventListener('mousedown', onDocClick); document.removeEventListener('keydown', onKey); };
  }, [showDownload]);

  const [focusHintStyle, setFocusHintStyle] = useState<{left:number; top:number}>({ left:16, top:72 });
  const [showFocusHintDevice, setShowFocusHintDevice] = useState(true);
  useEffect(()=>{
    const evalDevice = () => {
      const belowMd = window.innerWidth < 768; // tailwind md breakpoint
      const coarse = matchMedia('(pointer: coarse)').matches;
      setShowFocusHintDevice(!(belowMd || coarse));
    };
    evalDevice();
    window.addEventListener('resize', evalDevice);
    return () => window.removeEventListener('resize', evalDevice);
  }, []);
  useEffect(()=>{
    const calc = () => {
      if (focusMode) { setFocusHintStyle({ left:8, top:8 }); return; }
      const header = document.querySelector('#tool > header');
      const aside = document.querySelector('#tool aside');
      const headerH = header ? header.getBoundingClientRect().height : 48;
      const asideW = aside ? aside.getBoundingClientRect().width : 0;
  const top = headerH + 16;
      const left = (window.innerWidth >= 768 ? asideW + 16 : 16);
      setFocusHintStyle({ left, top });
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [focusMode]);

  const downloadImageAs = (fmt: 'png' | 'jpeg' | 'webp') => {
    const canvas = processedCanvasRef.current || canvasRef.current; if (!canvas) return;
    let mime = `image/${fmt}`;
    if (fmt === 'webp' && !webpSupported) mime = 'image/png';
    try {
      const url = canvas.toDataURL(mime);
      const link = document.createElement('a');
      link.download = `dithering-effect.${fmt}`;
      link.href = url;
      link.click();
    } catch {
      if (mime !== 'image/png') {
        const fallback = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'dithering-effect.png';
        link.href = fallback;
        link.click();
      }
    }
    setShowDownload(false);
  };

  const downloadAsSVG = () => {
    const canvas = processedCanvasRef.current || canvasRef.current; if (!canvas) return;
    const { svg } = canvasToSVG(canvas, { mergeRuns: true });
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'dithering-effect.svg';
    link.href = url;
    link.click();
    setShowDownload(false);
    setTimeout(()=> URL.revokeObjectURL(url), 2000);
  };

  return (
    <>
      <Helmet>
        <title>Image Dithering Tool | Multi Algorithm (Floyd–Steinberg, Bayer, Sierra)</title>
        <meta name="description" content="Client-side image dithering: Floyd–Steinberg, Atkinson, Stucki, Sierra family, Jarvis, Bayer ordered, halftone & more." />
        <link rel="canonical" href="https://steinberg-image.vercel.app//Dithering" />
      </Helmet>
      <div id="tool" className={`flex min-h-screen w-full flex-col ${focusMode ? 'focus-mode' : ''}`}>
        <header className={`flex items-center justify-between border-b border-neutral-900 bg-[#0b0b0b] px-4 py-3 ${focusMode ? 'hidden' : ''}`}>
          <div className="flex items-center gap-4">
            <h1 className="font-mono text-xs tracking-wide text-gray-300">Dithering Studio</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/Algorithms" className="clean-btn px-3 py-1 !text-[11px]" title="Algorithm reference">Explore</Link>
            <Link to="/" className="clean-btn px-3 py-1 !text-[11px]">Home</Link>
          </div>
        </header>
        <div className="flex flex-1 flex-col md:flex-row">
        {!focusMode && (
        <aside className="flex w-full flex-shrink-0 flex-col border-b border-neutral-800 bg-[#0d0d0d] md:w-80 md:border-b-0 md:border-r">
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 48px)' }}>
            {!image && (
              <div className="px-4 pt-4 pb-6">
                <div className="relative min-panel space-y-3 p-4">
                  <h2 className="font-anton text-xl leading-tight">Dithering Studio</h2>
                  <p className="text-[11px] leading-relaxed text-gray-400">Drop or select an image in the main area to begin. Your picture never leaves this window.</p>
                  <ul className="ml-4 list-disc space-y-1 text-[10px] text-gray-500">
                    <li>Choose algorithm & tweak threshold.</li>
                    <li>Adjust working resolution (internal quality).</li>
                    <li>Invert or enable serpentine scanning.</li>
                    <li>Download instantly as PNG or JPEG.</li>
                  </ul>
                </div>
              </div>
            )}
            {image && (
              <div className="px-4 pt-4 pb-6">
                <div className="settings-stack space-y-6">
                <button onClick={uploadAnother} className="clean-btn w-full justify-center gap-2 px-3 py-2 text-[11px] font-medium tracking-wide">
                  <span className="text-[13px]" aria-hidden>⬆</span>
                  <span>Upload another image</span>
                </button>
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
                    <label htmlFor="palette-select" className="font-mono text-[11px] tracking-wide text-gray-300">Palette</label>
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
                  {!paletteId && (
                    <p className="text-[10px] text-gray-500">Select a palette then click colors to remove them.</p>
                  )}
                  {paletteId && activePaletteColors && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {activePaletteColors.map((c,i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={()=>{
                            if (!activePaletteColors) return;
                            if (activePaletteColors.length <= 2) return; // keep at least 2
                            const next = activePaletteColors.filter((_,idx)=> idx!==i);
                            setActivePaletteColors(next);
                          }}
                          className="group relative h-5 w-5 cursor-pointer rounded-sm border border-neutral-600 focus-visible:shadow-[var(--focus-ring)]"
                          style={{ background:`rgb(${c[0]},${c[1]},${c[2]})` }}
                          title="Remove color"
                          aria-label={`Remove color rgb(${c[0]},${c[1]},${c[2]})`}
                        >
                          <span className="pointer-events-none absolute inset-0 rounded-sm bg-black/0 transition group-hover:bg-black/35" />
                          <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[13px] font-bold text-white opacity-0 drop-shadow-[0_0_2px_rgba(0,0,0,0.9)] transition-opacity group-hover:opacity-100">×</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={()=> effectivePalette && setActivePaletteColors(effectivePalette.map(c=>[...c] as [number,number,number]))}
                        className="relative h-5 w-5 cursor-pointer rounded-sm border border-neutral-600 text-[11px] font-semibold text-gray-300 transition hover:bg-neutral-800 hover:text-white focus-visible:shadow-[var(--focus-ring)]"
                        title="Restore full palette"
                        aria-label="Restore full palette"
                      >↺</button>
                    </div>
                  )}
                  <p className="mt-2 text-[10px] text-gray-500">Palette-aware diffusion (Floyd–Steinberg) or post-quantization. Remove swatches to constrain colors.</p>
                </div>
                <div className="min-panel space-y-2 p-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] tracking-wide text-gray-300">Luminance Threshold / Bias</span>
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
                    className={`clean-btn flex-1 ${invert ? "border-blue-600 text-blue-400" : ""} ${paletteId ? 'opacity-40 cursor-not-allowed' : ''}`}
                    title={paletteId ? 'Invert disabled with palette' : 'Invert output'}
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
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-neutral-800 p-4">
            {image ? (
              <button
                onClick={()=> hasApplied && setShowDownload(true)}
                disabled={!hasApplied}
                className={`clean-btn clean-btn-primary w-full justify-center text-[11px] ${!hasApplied ? 'opacity-50 cursor-not-allowed' : ''}`}
              >Download Result</button>
            ) : (
              <Link to="/Algorithms" className="clean-btn w-full text-[11px] text-center">Explore Algorithms</Link>
            )}
          </div>
        </aside>
        )}
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
        {showDownload && image && (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div ref={downloadRef} className="relative w-full max-w-md rounded border border-neutral-800 bg-[#111] p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-mono text-xs tracking-wide text-gray-300">Export Result</h2>
                <button onClick={()=> setShowDownload(false)} className="clean-btn px-2 py-0 text-[11px]">✕</button>
              </div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                <button onClick={()=>downloadImageAs('png')} className="clean-btn w-full text-[11px]">PNG</button>
                <button onClick={()=>downloadImageAs('jpeg')} className="clean-btn w-full text-[11px]">JPEG</button>
                <button onClick={()=>downloadImageAs('webp')} disabled={!webpSupported} className={`clean-btn w-full text-[11px] ${!webpSupported?'opacity-40 cursor-not-allowed':''}`}>WEBP</button>
                <button onClick={downloadAsSVG} className="clean-btn w-full text-[11px]">SVG</button>
              </div>
              <p className="mb-4 text-[10px] leading-snug text-gray-500">PNG (lossless), JPEG (smaller), WEBP {webpSupported ? '(modern)' : '(unsupported)'}; SVG vector (large for big images).</p>
              <div className="flex items-center justify-between">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText || 'Dithered an image via @Oslo418')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-blue-400 hover:underline"
                >Share on X</a>
                <button onClick={()=> setShowDownload(false)} className="clean-btn px-3 py-1 text-[11px]">Close</button>
              </div>
            </div>
          </div>
        )}
        {showFocusHintDevice && (
          <div className="pointer-events-none fixed z-20 rounded bg-neutral-900/70 px-3 py-1 text-[10px] font-mono tracking-wide text-gray-300 shadow transition-all duration-150" style={{ left: focusHintStyle.left, top: focusHintStyle.top }}>
            Press F to toggle Focus Mode
          </div>
        )}
      </div>
    </>
  );
};

export default ImageDitheringTool;
