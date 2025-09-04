import { useEffect, useState, useRef } from "react";
import { canvasToSVG } from "../utils/export";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ImageUploader from "../components/ImageUploader";
import ImagesPanel, { UploadedImage } from "../components/ImagesPanel";
import AlgorithmPanel from "../components/AlgorithmPanel";
import PalettePanel from "../components/PalettePanel";
import ResolutionPanel from "../components/ResolutionPanel";
import UploadIntro from "../components/UploadIntro";
import useDithering from "../hooks/useDithering";
import PerformanceOverlay from "../components/PerformanceOverlay";
import { perf } from "../utils/perf";
import { predefinedPalettes } from "../utils/palettes";
import { algorithms } from "../utils/algorithms";
import PresetPanel from "../components/PresetPanel";

const isErrorDiffusion = (p: number) => algorithms.some((a) => a.id === p && a.category === "Error Diffusion");

const ImageDitheringTool: React.FC = () => {
  const [images, setImages] = useState<UploadedImage[]>(() => {
    try {
      const raw = localStorage.getItem("ds_images");
      if (raw) return JSON.parse(raw) as UploadedImage[];
    } catch {}
    return [];
  });
  const [activeImageId, setActiveImageId] = useState<string | null>(() => {
    try {
      return localStorage.getItem("ds_activeImageId");
    } catch {
      return null;
    }
  });
  const image = activeImageId ? images.find((i: UploadedImage) => i.id === activeImageId)?.url || null : null;
  const [pattern, setPattern] = useState<number>(() => {
    try {
      return +(localStorage.getItem("ds_pattern") || 1);
    } catch {
      return 1;
    }
  });
  const [threshold, setThreshold] = useState<number>(() => {
    try {
      return +(localStorage.getItem("ds_threshold") || 128);
    } catch {
      return 128;
    }
  });
  const [workingResolution, setWorkingResolution] = useState<number>(() => {
    try {
      return +(localStorage.getItem("ds_workingResolution") || 512);
    } catch {
      return 512;
    }
  });
  const [workingResInput, setWorkingResInput] = useState<string>(() => String(workingResolution));
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
  const [paletteId, setPaletteId] = useState<string | null>(() => {
    try {
      return localStorage.getItem("ds_paletteId");
    } catch {
      return null;
    }
  });
  const [activePaletteColors, setActivePaletteColors] = useState<[number, number, number][] | null>(() => {
    try {
      const raw = localStorage.getItem("ds_customPalette");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.every((c) => Array.isArray(c) && c.length === 3 && c.every((n) => typeof n === "number"))) {
          return parsed as [number, number, number][];
        }
      }
    } catch {}
    return null;
  });
  const [invert, setInvert] = useState<boolean>(() => {
    try {
      return localStorage.getItem("ds_invert") === "1";
    } catch {
      return false;
    }
  });
  const [serpentine, setSerpentine] = useState<boolean>(() => {
    try {
      return localStorage.getItem("ds_serpentine") !== "0";
    } catch {
      return true;
    }
  });
  const [asciiRamp, setAsciiRamp] = useState<string>(() => {
    try {
      const v = localStorage.getItem("ds_asciiRamp");
      return v && v.length >= 2 ? v : "@%#*+=-:. ";
    } catch {
      return "@%#*+=-:. ";
    }
  });
  const [showGrid, setShowGrid] = useState<boolean>(() => {
    try {
      return localStorage.getItem("ds_showGrid") === "1";
    } catch {
      return false;
    }
  });
  const [gridSize, setGridSize] = useState<number>(() => {
    try {
      const v = +(localStorage.getItem("ds_gridSize") || 8);
      return [4, 6, 8, 12, 16].includes(v) ? v : 8;
    } catch {
      return 8;
    }
  });
  const [focusMode, setFocusMode] = useState(false);
  const paletteFromURL = useRef<[number, number, number][] | null>(null);
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
    // Only auto-populate for predefined palettes (exclude special __custom / __original)
    if (effectivePalette && paletteId && !paletteId.startsWith("__")) {
      if (paletteFromURL.current) {
        setActivePaletteColors(paletteFromURL.current);
        paletteFromURL.current = null;
      } else {
        setActivePaletteColors(effectivePalette.map((c) => [...c] as [number, number, number]));
      }
    } else if (!paletteId) {
      setActivePaletteColors(null);
    }
    // For custom/original we preserve whatever Panel manages.
  }, [effectivePaletteId, paletteId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.size === 0) return;
    const num = (key: string, min: number, max: number) => {
      const v = parseInt(params.get(key) || "", 10);
      if (isNaN(v)) return undefined;
      return Math.min(max, Math.max(min, v));
    };
    const p = num("p", 1, 999);
    if (typeof p === "number") {
      // Accept only ids present in algorithms registry
      if (algorithms.some((a) => a.id === p)) setPattern(p);
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
    const ramp = params.get("ramp");
    if (ramp) {
      const decoded = decodeURIComponent(ramp).replace(/\s/g, " ").slice(0, 64);
      if (decoded.length >= 2) setAsciiRamp(decoded);
    }
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

  const selectedAlgo = algorithms.find((a) => a.id === pattern);
  const paletteSupported = !!selectedAlgo?.supportsPalette;
  const isAscii = selectedAlgo?.name === "ASCII Mosaic";
  // Allow invert with palette only for ASCII algorithm; otherwise preserve prior auto-disable behavior.
  useEffect(() => {
    if (paletteId && invert && !isAscii) setInvert(false);
  }, [paletteId, invert, isAscii]);
  // If current algorithm does not support palette, ensure palette disabled
  useEffect(() => {
    if (!paletteSupported && paletteId) {
      setPaletteId(null);
    }
  }, [paletteSupported, paletteId]);

  const { canvasRef, processedCanvasRef, hasApplied, canvasUpdatedFlag, processedSizeBytes } = useDithering({
    image,
    pattern,
    threshold,
    workingResolution,
    invert,
    serpentine,
    isErrorDiffusion: isErrorDiffusion(pattern),
    paletteId: paletteSupported ? paletteId : null,
    paletteColors: activePaletteColors || undefined,
    asciiRamp: isAscii ? asciiRamp : undefined,
  });

  // Reset perf data when active image changes (fresh stats per image)
  useEffect(() => {
    perf.reset();
  }, [activeImageId]);
  useEffect(() => {
    try {
      localStorage.setItem("ds_asciiRamp", asciiRamp);
    } catch {}
  }, [asciiRamp]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        const t = e.target as HTMLElement;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
        setFocusMode((f: boolean) => !f);
        e.preventDefault();
      } else if (e.key === "g" || e.key === "G") {
        const t = e.target as HTMLElement;
        if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
        if (e.shiftKey) {
          // Cycle grid size when grid visible or (optionally) enable it first
          setShowGrid(true);
          setGridSize((gs: number) => {
            const order = [4, 6, 8, 12, 16];
            const idx = order.indexOf(gs);
            return order[(idx + 1) % order.length];
          });
        } else {
          setShowGrid((s: boolean) => !s);
        }
        e.preventDefault();
      } else if ((e.key === "ArrowRight" || e.key === "ArrowLeft") && images.length > 1) {
        const idx = images.findIndex((i: UploadedImage) => i.id === activeImageId);
        if (idx >= 0) {
          const dir = e.key === "ArrowRight" ? 1 : -1;
          const next = (idx + dir + images.length) % images.length;
          setActiveImageId(images[next].id);
          e.preventDefault();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const addImages = (items: { url: string; name?: string; file?: File }[]) => {
    setImages((prev: UploadedImage[]) => {
      const next = [...prev];
      items.forEach((it, idx) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${idx}`;
        let meta: Partial<UploadedImage> = {};
        if (it.file) {
          meta.size = it.file.size;
        }
        // try to get dimensions
        const imgEl = new Image();
        imgEl.onload = () => {
          setImages((cur: UploadedImage[]) => cur.map((ci: UploadedImage) => (ci.id === id ? { ...ci, width: imgEl.width, height: imgEl.height } : ci)));
        };
        imgEl.src = it.url;
        next.push({ id, url: it.url, name: it.name, ...meta });
        if (!activeImageId) setActiveImageId(id);
      });
      return next;
    });
  };
  const readAndAddFiles = (files: FileList) => {
    const toRead = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!toRead.length) return;
    const collected: { url: string; name?: string; file?: File }[] = [];
    let remaining = toRead.length;
    toRead.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        collected.push({ url: e.target?.result as string, name: f.name, file: f });
        remaining--;
        if (remaining === 0) addImages(collected);
      };
      reader.readAsDataURL(f);
    });
  };
  const removeImage = (id: string) => {
    setImages((prev: UploadedImage[]) => {
      const next = prev.filter((i: UploadedImage) => i.id !== id);
      if (activeImageId === id) {
        setActiveImageId(next[0]?.id || null);
      }
      return next;
    });
  };
  const clearAllImages = () => {
    setImages([]);
    setActiveImageId(null);
  };
  const resetSettings = () => {
    // Reset dither settings to defaults
    setPattern(1);
    setThreshold(128);
    setWorkingResolution(512);
    setWorkingResInput("512");
    setPaletteId(null);
    setActivePaletteColors(null);
    setInvert(false);
    setSerpentine(true);
    setAsciiRamp("@%#*+=-:. ");
    setShowGrid(false);
    setGridSize(8);
    try {
      localStorage.removeItem("ds_pattern");
      localStorage.removeItem("ds_threshold");
      localStorage.removeItem("ds_workingResolution");
      localStorage.removeItem("ds_paletteId");
      localStorage.removeItem("ds_customPalette");
      localStorage.removeItem("ds_invert");
      localStorage.removeItem("ds_serpentine");
      localStorage.removeItem("ds_asciiRamp");
      localStorage.removeItem("ds_showGrid");
      localStorage.removeItem("ds_gridSize");
    } catch {}
    perf.reset();
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

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem("ds_pattern", String(pattern));
    } catch {}
  }, [pattern]);
  useEffect(() => {
    try {
      localStorage.setItem("ds_threshold", String(threshold));
    } catch {}
  }, [threshold]);
  useEffect(() => {
    try {
      localStorage.setItem("ds_workingResolution", String(workingResolution));
    } catch {}
  }, [workingResolution]);
  useEffect(() => {
    try {
      if (paletteId) localStorage.setItem("ds_paletteId", paletteId);
      else localStorage.removeItem("ds_paletteId");
    } catch {}
  }, [paletteId]);
  useEffect(() => {
    try {
      localStorage.setItem("ds_invert", invert ? "1" : "0");
    } catch {}
  }, [invert]);
  useEffect(() => {
    try {
      localStorage.setItem("ds_serpentine", serpentine ? "1" : "0");
    } catch {}
  }, [serpentine]);
  useEffect(() => {
    try {
      localStorage.setItem("ds_showGrid", showGrid ? "1" : "0");
    } catch {}
  }, [showGrid]);
  useEffect(() => {
    try {
      localStorage.setItem("ds_gridSize", String(gridSize));
    } catch {}
  }, [gridSize]);
  useEffect(() => {
    try {
      localStorage.setItem("ds_activeImageId", activeImageId || "");
    } catch {}
  }, [activeImageId]);
  useEffect(() => {
    try {
      localStorage.setItem("ds_images", JSON.stringify(images));
    } catch {}
  }, [images]);
  useEffect(() => {
    try {
      if (paletteId === "__custom" && activePaletteColors && activePaletteColors.length >= 2) {
        localStorage.setItem("ds_customPalette", JSON.stringify(activePaletteColors));
      }
    } catch {}
  }, [activePaletteColors, paletteId]);

  return (
    <>
      <Helmet>
        <title>Image Dithering Tool | Multi Algorithm (Floyd–Steinberg, Bayer, Sierra)</title>
        <meta name="description" content="Client-side image dithering: Floyd–Steinberg, Atkinson, Stucki, Sierra family, Jarvis, Bayer ordered, halftone & more." />
        <link rel="canonical" href="https://steinberg-image.vercel.app/Dithering" />
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
                  {!image && (
                    <div className="px-4 pt-4 pb-6">
                      <UploadIntro />
                    </div>
                  )}
                  {image && (
                    <div className="px-4 pt-4 pb-6">
                      <div className="settings-stack space-y-6">
                        {images.length > 1 && <ImagesPanel images={images} activeId={activeImageId} setActiveId={setActiveImageId} removeImage={removeImage} addImages={readAndAddFiles} clearAll={clearAllImages} />}
                        {images.length <= 1 && activeImageId && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                clearAllImages();
                              }}
                              className="clean-btn flex-1 justify-center gap-2 px-3 py-2 text-[11px] font-medium tracking-wide"
                              title="Choose another image (replaces current)"
                            >
                              <span className="text-[13px]" aria-hidden>
                                ⬆
                              </span>
                              <span>Change Image</span>
                            </button>
                            <button onClick={resetSettings} className="clean-btn flex-1 justify-center gap-2 px-3 py-2 text-[11px] font-medium tracking-wide" title="Reset all settings to defaults">
                              <span className="text-[13px]" aria-hidden>
                                ↺
                              </span>
                              <span>Reset</span>
                            </button>
                          </div>
                        )}

                        {/* Algorithm & Threshold */}
                        <AlgorithmPanel pattern={pattern} setPattern={setPattern} threshold={threshold} setThreshold={setThreshold} invert={invert} setInvert={setInvert} serpentine={serpentine} setSerpentine={setSerpentine} paletteId={paletteId} asciiRamp={asciiRamp} setAsciiRamp={setAsciiRamp} />

                        {/* Palette (hidden if unsupported) */}
                        {paletteSupported && <PalettePanel paletteId={paletteId} setPaletteId={setPaletteId} activePaletteColors={activePaletteColors} setActivePaletteColors={setActivePaletteColors} effectivePalette={effectivePalette} image={image} />}

                        {/* Working Resolution */}
                        <ResolutionPanel workingResolution={workingResolution} setWorkingResolution={setWorkingResolution} workingResInput={workingResInput} setWorkingResInput={setWorkingResInput} />

                        {/* Presets */}
                        <PresetPanel
                          current={{ params: { pattern, threshold, invert, serpentine, isErrorDiffusion: isErrorDiffusion(pattern), palette: activePaletteColors || undefined }, workingResolution, paletteId, activePaletteColors }}
                          apply={(p) => {
                            setPattern(p.pattern);
                            setThreshold(p.threshold);
                            setInvert(p.invert);
                            setSerpentine(p.serpentine);
                            setWorkingResolution(p.workingResolution);
                            setWorkingResInput(String(p.workingResolution));
                            if (p.paletteId) setPaletteId(p.paletteId);
                            if (p.activePaletteColors) setActivePaletteColors(p.activePaletteColors);
                          }}
                        />
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
              <div className="w-full max-w-lg space-y-4">
                <ImageUploader onImagesAdded={(items) => addImages(items)} />
                <p className="text-center text-[10px] text-gray-500">Select one or multiple images to begin. They will appear in the Images panel.</p>
              </div>
            )}
            {image && (
              <div className="flex h-full w-full items-center justify-center overflow-auto">
                <div className="canvas-frame flex items-center justify-center p-2" style={{ background: "transparent", border: "none" }}>
                  <div className="relative">
                    <canvas ref={canvasRef} className={`pixelated ${canvasUpdatedFlag ? "updated" : ""}`} aria-label="Dithered image preview" style={{ display: "block" }} />
                    {showGrid && (
                      <>
                        <div className="grid-overlay pointer-events-none absolute inset-0" aria-hidden style={{ backgroundSize: `${gridSize}px ${gridSize}px` }} />
                        <button
                          type="button"
                          onClick={() => {
                            const order = [4, 6, 8, 12, 16];
                            setGridSize((gs: number) => order[(order.indexOf(gs) + 1) % order.length]);
                          }}
                          className="grid-size-badge"
                          title="Cycle grid size (Shift+G)"
                        >
                          {gridSize}px
                        </button>
                      </>
                    )}
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
                <button
                  onClick={() => {
                    const canvas = processedCanvasRef.current || canvasRef.current;
                    if (!canvas) return;
                    canvas.toBlob((b) => {
                      if (!b) return;
                      const item = new ClipboardItem({ "image/png": b });
                      navigator.clipboard?.write([item]).catch(() => {});
                    }, "image/png");
                  }}
                  className="clean-btn w-full text-[11px]"
                >
                  Clipboard
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
            F Focus | G Grid | Shift+G Size
          </div>
        )}
        <PerformanceOverlay hasImage={!!image} originalBytes={image ? images.find((i) => i.id === activeImageId)?.size || null : null} processedBytes={image ? processedSizeBytes : null} />
      </div>
    </>
  );
};

export default ImageDitheringTool;
