import { useEffect, useState, useRef } from "react";
import { canvasToSVG } from "../utils/export";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ImageUploader from "../components/ImageUploader";
import AlgorithmPanel from "../components/AlgorithmPanel";
import PalettePanel from "../components/PalettePanel";
import ResolutionPanel from "../components/ResolutionPanel";
import UploadIntro from "../components/UploadIntro";
import useDithering from "../hooks/useDithering";
import { predefinedPalettes } from "../utils/palettes";

const isErrorDiffusion = (p: number) => [1, 3, 4, 5, 6, 7, 12, 13, 14, 18, 19].includes(p);

const ImageDitheringTool: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [pattern, setPattern] = useState<number>(1);
  const [threshold, setThreshold] = useState<number>(128);
  const [workingResolution, setWorkingResolution] = useState<number>(512);
  const [workingResInput, setWorkingResInput] = useState<string>("512");
  const [webpSupported, setWebpSupported] = useState(true);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      c.width = c.height = 2;
      const data = c.toDataURL("image/webp");
      if (!data.startsWith("data:image/webp")) setWebpSupported(false);
    } catch {
      setWebpSupported(false);
    }
  }, []);
  const [paletteId, setPaletteId] = useState<string | null>(null);
  const [activePaletteColors, setActivePaletteColors] = useState<[number, number, number][] | null>(null);
  const [invert, setInvert] = useState(false);
  const [serpentine, setSerpentine] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const shareRef = useRef<HTMLDivElement | null>(null);
  const [shareURL, setShareURL] = useState("");
  const [copyOk, setCopyOk] = useState(false);
  const paletteFromURL = useRef<[number, number, number][] | null>(null);
  if (paletteId && invert) setInvert(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [settingsHeight, setSettingsHeight] = useState<number | null>(null);

  useEffect(() => {
    const calcHeights = () => {
      if (focusMode) {
        setSettingsHeight(null);
        return;
      }
      const headerH = headerRef.current ? headerRef.current.getBoundingClientRect().height : 0;
      const footerH = footerRef.current ? footerRef.current.getBoundingClientRect().height : 0;
      const vh = window.innerHeight;
      const h = vh - headerH - footerH;
      setSettingsHeight(h > 0 ? h : null);
    };
    calcHeights();
    window.addEventListener("resize", calcHeights);
    return () => window.removeEventListener("resize", calcHeights);
  }, [focusMode, image]);

  const effectivePaletteId = paletteId;
  const effectivePalette = (effectivePaletteId ? predefinedPalettes.find((p) => p.id === effectivePaletteId)?.colors : null) || null;
  useEffect(() => {
    if (effectivePalette) {
      if (paletteFromURL.current) {
        setActivePaletteColors(paletteFromURL.current);
        paletteFromURL.current = null; // consume override
      } else {
        setActivePaletteColors(effectivePalette.map((c) => [...c] as [number, number, number]));
      }
    } else setActivePaletteColors(null);
  }, [effectivePaletteId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.size === 0) return;
    const num = (key: string, min: number, max: number) => {
      const v = parseInt(params.get(key) || "", 10);
      if (isNaN(v)) return undefined;
      return Math.min(max, Math.max(min, v));
    };
    const p = num("p", 1, 99);
    if (typeof p === "number") {
      if (isErrorDiffusion(p) || [2, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].includes(p)) setPattern(p);
    }
    const t = num("t", 0, 255);
    if (typeof t === "number") setThreshold(t);
    const r = num("r", 16, 4096);
    if (typeof r === "number") {
      setWorkingResolution(r);
      setWorkingResInput(String(r));
    }
    if (params.get("inv") === "1") setInvert(true);
    if (params.get("ser") === "1") setSerpentine(true);
    const pal = params.get("pal");
    if (pal) {
      const cols = params.get("cols");
      if (cols) {
        const parsed: [number, number, number][] = [];
        cols.split("-").forEach((part) => {
          const seg = part.split(".");
          if (seg.length === 3) {
            const r = +seg[0],
              g = +seg[1],
              b = +seg[2];
            if ([r, g, b].every((n) => n >= 0 && n <= 255)) parsed.push([r, g, b]);
          }
        });
        if (parsed.length >= 2) paletteFromURL.current = parsed;
      }
      setPaletteId(pal);
    }
    // Clean URL (remove applied params) while preserving hash if any.
    try {
      const clean = window.location.pathname + window.location.hash;
      window.history.replaceState({}, "", clean || "/");
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        const t = e.target as HTMLElement;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
        setFocusMode((f) => !f); e.preventDefault();
      } else if (e.key === "g" || e.key === "G") {
        const t = e.target as HTMLElement;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
        setShowGrid((s) => !s); e.preventDefault();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleImageChange = (img: string | null) => setImage(img);

  const uploadAnother = () => {
    setImage(null);
  };
  const [showDownload, setShowDownload] = useState(false);
  const downloadRef = useRef<HTMLDivElement | null>(null);
  const [shareText, setShareText] = useState("");
  const shareMessages = useRef<string[]>(["Floyd–Steinberg diffusion result", "High contrast ordered-to-diffusion comparison", "Palette-constrained pixel texture", "Classic error diffusion aesthetic", "Retro styled monochrome grain", "Algorithmic dithering output", "Diffusion + palette quantization", "Minimal color, maximal texture", "Granular luminance mapping", "Pixel-level tone dispersion"]);
  useEffect(() => {
    if (showDownload) {
      const base = shareMessages.current[Math.floor(Math.random() * shareMessages.current.length)];
      setShareText(`${base} — Dithering Studio by @Oslo418`);
    }
  }, [showDownload]);
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!showDownload) return;
      if (downloadRef.current && !downloadRef.current.contains(e.target as Node)) {
        setShowDownload(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowDownload(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [showDownload]);

  useEffect(() => {
    if (!showShareModal) return;
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShowShareModal(false);
    };
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowShareModal(false);
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", key);
    };
  }, [showShareModal]);

  const [focusHintStyle, setFocusHintStyle] = useState<{ left: number; top: number }>({ left: 16, top: 72 });
  const [showFocusHintDevice, setShowFocusHintDevice] = useState(true);
  useEffect(() => {
    const evalDevice = () => {
      const belowMd = window.innerWidth < 768; // tailwind md breakpoint
      const coarse = matchMedia("(pointer: coarse)").matches;
      setShowFocusHintDevice(!(belowMd || coarse));
    };
    evalDevice();
    window.addEventListener("resize", evalDevice);
    return () => window.removeEventListener("resize", evalDevice);
  }, []);
  useEffect(() => {
    const calc = () => {
      if (focusMode) {
        setFocusHintStyle({ left: 8, top: 8 });
        return;
      }
      const header = document.querySelector("#tool > header");
      const aside = document.querySelector("#tool aside");
      const headerH = header ? header.getBoundingClientRect().height : 48;
      const asideW = aside ? aside.getBoundingClientRect().width : 0;
      const top = headerH + 16;
      const left = window.innerWidth >= 768 ? asideW + 16 : 16;
      setFocusHintStyle({ left, top });
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [focusMode]);

  const downloadImageAs = (fmt: "png" | "jpeg" | "webp") => {
    const canvas = processedCanvasRef.current || canvasRef.current;
    if (!canvas) return;
    let mime = `image/${fmt}`;
    if (fmt === "webp" && !webpSupported) mime = "image/png";
    try {
      const url = canvas.toDataURL(mime);
      const link = document.createElement("a");
      link.download = `dithering-effect.${fmt}`;
      link.href = url;
      link.click();
    } catch {
      if (mime !== "image/png") {
        const fallback = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = "dithering-effect.png";
        link.href = fallback;
        link.click();
      }
    }
    setShowDownload(false);
  };

  const downloadAsSVG = () => {
    const canvas = processedCanvasRef.current || canvasRef.current;
    if (!canvas) return;
    const { svg } = canvasToSVG(canvas, { mergeRuns: true });
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "dithering-effect.svg";
    link.href = url;
    link.click();
    setShowDownload(false);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  return (
    <>
      <Helmet>
        <title>Image Dithering Tool | Multi Algorithm (Floyd–Steinberg, Bayer, Sierra)</title>
        <meta name="description" content="Client-side image dithering: Floyd–Steinberg, Atkinson, Stucki, Sierra family, Jarvis, Bayer ordered, halftone & more." />
        <link rel="canonical" href="https://steinberg-image.vercel.app//Dithering" />
      </Helmet>
      <div id="tool" className={`flex min-h-screen w-full flex-col ${focusMode ? "focus-mode" : ""}`}>
        <header ref={headerRef} className={`flex items-center justify-between border-b border-neutral-900 bg-[#0b0b0b] px-4 py-3 ${focusMode ? "hidden" : ""}`}>
          <div className="flex items-center gap-4">
            <h1 className="font-mono text-xs tracking-wide text-gray-300">Dithering Studio</h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/Algorithms" className="clean-btn px-3 py-1 !text-[11px]" title="Algorithm reference">
              Explore
            </Link>
            <Link to="/" className="clean-btn px-3 py-1 !text-[11px]">
              Home
            </Link>
          </div>
        </header>
        <div className="flex flex-1 flex-col md:flex-row">
          {!focusMode && (
            <aside className="flex w-full flex-shrink-0 flex-col border-b border-neutral-800 bg-[#0d0d0d] md:w-80 md:border-r md:border-b-0">
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto" style={settingsHeight ? { maxHeight: settingsHeight } : undefined}>
                  {!image && (<div className="px-4 pt-4 pb-6"><UploadIntro /></div>)}
                  {image && (
                    <div className="px-4 pt-4 pb-6">
                      <div className="settings-stack space-y-6">
                        <button onClick={uploadAnother} className="clean-btn w-full justify-center gap-2 px-3 py-2 text-[11px] font-medium tracking-wide">
                          <span className="text-[13px]" aria-hidden>
                            ⬆
                          </span>
                          <span>Upload another image</span>
                        </button>

                        {/* Algorithm & Threshold */}
                        <AlgorithmPanel pattern={pattern} setPattern={setPattern} threshold={threshold} setThreshold={setThreshold} invert={invert} setInvert={setInvert} serpentine={serpentine} setSerpentine={setSerpentine} paletteId={paletteId} />

                        {/* Palette */}
                        <PalettePanel paletteId={paletteId} setPaletteId={setPaletteId} activePaletteColors={activePaletteColors} setActivePaletteColors={setActivePaletteColors} effectivePalette={effectivePalette} />

                        {/* Working Resolution */}
                        <ResolutionPanel workingResolution={workingResolution} setWorkingResolution={setWorkingResolution} workingResInput={workingResInput} setWorkingResInput={setWorkingResInput} />
                      </div>
                    </div>
                  )}
                </div>
                <div ref={footerRef} className="border-t border-neutral-800 p-4">
                  {image ? (
                    <div className="flex gap-2">
                      <button onClick={() => hasApplied && setShowDownload(true)} disabled={!hasApplied} className={`clean-btn clean-btn-primary flex-1 justify-center text-[11px] ${!hasApplied ? "cursor-not-allowed opacity-50" : ""}`}>
                        Download
                      </button>
                      <button
                        onClick={() => {
                          const params = new URLSearchParams();
                          params.set("p", String(pattern));
                          params.set("t", String(threshold));
                          params.set("r", String(workingResolution));
                          if (invert) params.set("inv", "1");
                          if (serpentine) params.set("ser", "1");
                          if (paletteId) {
                            params.set("pal", paletteId);
                            if (activePaletteColors) params.set("cols", activePaletteColors.map((c) => c.join(".")).join("-"));
                          }
                          const base = window.location.origin + window.location.pathname;
                          const full = base + "?" + params.toString();
                          setShareURL(full);
                          navigator.clipboard?.writeText(full).catch(() => {});
                          setShowShareModal(true);
                        }}
                        className="clean-btn flex-1 justify-center text-[11px]"
                        title="Copy shareable URL"
                      >
                        Share
                      </button>
                    </div>
                  ) : (
                    <Link to="/Algorithms" className="clean-btn w-full text-center text-[11px]">
                      Explore Algorithms
                    </Link>
                  )}
                </div>
              </div>
            </aside>
          )}
          <main className="flex flex-1 items-center justify-center">
            {!image && (
              <div className="w-full max-w-lg">
                <ImageUploader setImage={handleImageChange} />
              </div>
            )}
            {image && (
              <div className="flex h-full w-full items-center justify-center overflow-auto">
                <div className="canvas-frame flex items-center justify-center p-2" style={{ background: "transparent", border: "none" }}>
                  <div className="relative">
                    <canvas ref={canvasRef} className={`pixelated ${canvasUpdatedFlag ? "updated" : ""}`} aria-label="Dithered image preview" style={{ display: "block" }} />
                    {showGrid && <div className="pointer-events-none absolute inset-0 grid-overlay" aria-hidden />}
                  </div>
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
                <button onClick={() => setShowDownload(false)} className="clean-btn px-2 py-0 text-[11px]">
                  ✕
                </button>
              </div>
              <div className="mb-4 grid grid-cols-4 gap-2">
                <button onClick={() => downloadImageAs("png")} className="clean-btn w-full text-[11px]">
                  PNG
                </button>
                <button onClick={() => downloadImageAs("jpeg")} className="clean-btn w-full text-[11px]">
                  JPEG
                </button>
                <button onClick={() => downloadImageAs("webp")} disabled={!webpSupported} className={`clean-btn w-full text-[11px] ${!webpSupported ? "cursor-not-allowed opacity-40" : ""}`}>
                  WEBP
                </button>
                <button onClick={downloadAsSVG} className="clean-btn w-full text-[11px]">
                  SVG
                </button>
              </div>
              <p className="mb-4 text-[10px] leading-snug text-gray-500">PNG (lossless), JPEG (smaller), WEBP {webpSupported ? "(modern)" : "(unsupported)"}; SVG vector (large for big images).</p>
              <div className="flex items-center justify-between">
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText || "Dithered an image via @Oslo418")}`} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:underline">
                  Share the result on X
                </a>
              </div>
            </div>
          </div>
        )}
        {showFocusHintDevice && (
          <div className="pointer-events-none fixed z-20 rounded bg-neutral-900/70 px-3 py-1 font-mono text-[10px] tracking-wide text-gray-300 shadow transition-all duration-150" style={{ left: focusHintStyle.left, top: focusHintStyle.top }}>
            F Focus | G Grid
          </div>
        )}
        {showShareModal && (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div ref={shareRef} className="relative w-full max-w-md rounded border border-neutral-800 bg-[#111] p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-mono text-xs tracking-wide text-gray-300">Share Link</h2>
              </div>
              <p className="mb-3 text-[10px] text-gray-500">URL encodes current algorithm, threshold, resolution, palette & toggles. Copied to clipboard.</p>
              <div className="mb-4">
                <input type="text" readOnly value={shareURL} className="clean-input w-full text-[10px]" onFocus={(e) => e.currentTarget.select()} />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard
                      ?.writeText(shareURL)
                      .then(() => {
                        setCopyOk(true);
                        setTimeout(() => setCopyOk(false), 1400);
                      })
                      .catch(() => {});
                  }}
                  className={`clean-btn text-[11px] ${copyOk ? "border-green-600 text-green-400" : ""}`}
                >
                  {copyOk ? "Copied ✓" : "Copy"}
                </button>
                <button onClick={() => setShowShareModal(false)} className="clean-btn px-3 py-1 text-[11px]">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ImageDitheringTool;
