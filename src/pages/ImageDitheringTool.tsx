import { useEffect, useState, useRef } from "react";
import { canvasToSVG } from "../utils/export";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ImageUploader from "../components/ImageUploader";
import VideoUploader from "../components/VideoUploader";
import ImagesPanel, { UploadedImage } from "../components/ImagesPanel";
import AlgorithmPanel from "../components/AlgorithmPanel";
import PalettePanel from "../components/PalettePanel";
import ResolutionPanel from "../components/ResolutionPanel";
import UploadIntro from "../components/UploadIntro";
import useDithering from "../hooks/useDithering";
import useVideoDithering from "../hooks/useVideoDithering";
import PerformanceOverlay from "../components/PerformanceOverlay";
import ExportDialog from "../components/ExportDialog";
import FocusHint from "../components/FocusHint";
import useToolKeyboardShortcuts from "../hooks/useToolKeyboardShortcuts";
import useVideoRecording from "../hooks/useVideoRecording";
import useSettingsHeight from "../hooks/useSettingsHeight";
import useApplyUrlParams from "../hooks/useApplyUrlParams";
import usePersistSettings from "../hooks/usePersistSettings";
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
  const [videoMode, setVideoMode] = useState(false);
  const [videoItem, setVideoItem] = useState<{ url: string; name?: string } | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoFps, setVideoFps] = useState(12);
  const paletteFromURL = useRef<[number, number, number][] | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const settingsHeight = useSettingsHeight(headerRef, footerRef, [image, videoMode, videoItem], focusMode);

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

  useApplyUrlParams({ setPattern, setThreshold, setWorkingResolution, setWorkingResInput, setInvert, setSerpentine, setAsciiRamp, setPaletteId, paletteFromURL });

  const selectedAlgo = algorithms.find((a) => a.id === pattern);
  const isBinary = pattern === 15 || pattern === 10;
  const paletteSupported = isBinary ? true : !!selectedAlgo?.supportsPalette;
  const isAscii = selectedAlgo?.name === "ASCII Mosaic";
  useEffect(() => {
    if (paletteId && invert && !isAscii) setInvert(false);
  }, [paletteId, invert, isAscii]);
  // If current algorithm does not support palette, ensure palette disabled
  useEffect(() => {
    if (!paletteSupported && paletteId) {
      setPaletteId(null);
    }
    // For Binary enforce exactly two colors if custom palette exists
    if (isBinary && activePaletteColors && activePaletteColors.length !== 2) {
      setActivePaletteColors((prev) => {
        if (!prev || prev.length < 2) {
          const rand = () => Math.floor(Math.random() * 256);
          return [
            [rand(), rand(), rand()],
            [rand(), rand(), rand()],
          ];
        }
        return prev.slice(0, 2);
      });
    }
  }, [paletteSupported, paletteId, isBinary, activePaletteColors]);

  const imageHook = useDithering({
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
  const videoHook = useVideoDithering({
    video: videoItem?.url || null,
    pattern,
    threshold,
    workingResolution,
    invert,
    serpentine,
    isErrorDiffusion: isErrorDiffusion(pattern),
    paletteId: paletteSupported ? paletteId : null,
    paletteColors: activePaletteColors || undefined,
    asciiRamp: isAscii ? asciiRamp : undefined,
    fps: videoFps,
  playing: videoPlaying,
  loop: false, // we manage looping logic manually (esp. for recording end)
  });
  const { canvasRef, processedCanvasRef, hasApplied, canvasUpdatedFlag, processedSizeBytes } = videoMode ? videoHook : imageHook;
  const videoDuration = videoMode ? (videoHook as any).duration : 0;
  const videoCurrentTime = videoMode ? (videoHook as any).currentTime : 0;
  const videoReady = videoMode ? (videoHook as any).ready : false;
  const videoCanvasForPalette: HTMLCanvasElement | null = videoMode ? (videoHook as any).processedCanvasRef?.current || (videoHook as any).canvasRef?.current || null : null;
  const imageOrig = (imageHook as any).origDims as {width:number;height:number};
  const videoOrig = (videoHook as any).naturalDims as {width:number;height:number};
  let dynamicMaxResolution: number | undefined;
  if (!videoMode && imageOrig?.width && imageOrig?.height) {
    dynamicMaxResolution = Math.max(imageOrig.width, imageOrig.height);
  } else if (videoMode && videoOrig?.width && videoOrig?.height) {
    dynamicMaxResolution = Math.max(videoOrig.width, videoOrig.height);
  }
  if (dynamicMaxResolution && workingResolution > dynamicMaxResolution) {
    setWorkingResolution(dynamicMaxResolution);
    setWorkingResInput(String(dynamicMaxResolution));
  }

  const { recordingVideo, recordingProgress, recordingError, startVideoExport, cancelVideoExport, recordedBlobUrl, videoExportFormat, setVideoExportFormat, videoFormatNote, recordingMimeRef, setRecordedBlobUrl } = useVideoRecording({ videoMode, videoItem, canvasRef, videoHook, videoFps, setVideoPlaying });

  const mediaActive = (!videoMode && !!image) || (videoMode && !!videoItem);

  const switchMode = () => {
    if (videoMode) {
      // switch to image mode
      setVideoMode(false);
      setVideoItem(null);
      setVideoPlaying(true);
    } else {
      // switch to video mode: clear images
      setImages([]);
      setActiveImageId(null);
      try {
        localStorage.removeItem("ds_images");
        localStorage.removeItem("ds_activeImageId");
      } catch {}
      setVideoMode(true);
      setVideoItem(null);
      setVideoPlaying(true);
    }
  };

  // Reset perf data when active image changes (fresh stats per image)
  useEffect(() => {
    perf.reset();
  }, [activeImageId]);
  usePersistSettings({ pattern, threshold, workingResolution, paletteId, invert, serpentine, showGrid, gridSize, activeImageId, images, activePaletteColors, asciiRamp });

  useToolKeyboardShortcuts({ images, activeImageId, setActiveImageId, setFocusMode: (fn:any)=>setFocusMode(fn), setShowGrid: (fn:any)=>setShowGrid(fn), setGridSize });

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
        <title>Image & Video Dithering Tool | Multi Algorithm</title>
        <meta name="description" content="Client-side image & video dithering: Floyd–Steinberg, Bayer, Sierra family, palettes & more." />
        <link rel="canonical" href="https://steinberg-image.vercel.app/Dithering" />
      </Helmet>
  <div id="tool" className={`flex min-h-screen w-full flex-col overflow-hidden ${focusMode ? 'focus-mode' : ''}`}>
        <header ref={headerRef} className={`flex items-center justify-between border-b border-neutral-900 bg-[#0b0b0b] px-4 py-3 ${focusMode ? 'hidden' : ''}`}>
          <div className="flex items-center gap-4">
            <h1 className="font-mono text-xs tracking-wide text-gray-300">Dithering Studio</h1>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={switchMode} className="clean-btn px-3 py-1 !text-[11px]" title={videoMode ? 'Switch to Images' : 'Switch to Video'}>{videoMode ? 'Image Mode' : 'Video Mode'}</button>
            <Link to="/Algorithms" className="clean-btn px-3 py-1 !text-[11px]" title="Algorithm reference">Explore</Link>
            <Link to="/" className="clean-btn px-3 py-1 !text-[11px]">Home</Link>
          </div>
        </header>
  <div className="flex flex-1 flex-col md:flex-row overflow-hidden">
          {!focusMode && (
            <aside className="flex w-full flex-shrink-0 flex-col border-b border-neutral-800 bg-[#0d0d0d] md:w-80 md:border-r md:border-b-0">
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto" style={settingsHeight ? { maxHeight: settingsHeight } : undefined}>
                  {!mediaActive && (
                    <div className="px-4 pt-4 pb-6 space-y-4">
                      <UploadIntro mode={videoMode ? 'video' : 'image'} />
                    </div>
                  )}
                  {mediaActive && (
                    <div className="px-4 pt-4 pb-6">
                      <div className="settings-stack space-y-6">
                        {videoMode && videoItem && (
                          <div className="flex gap-2">
                            <button onClick={() => setVideoItem(null)} className="clean-btn flex-1 justify-center gap-2 px-3 py-2 text-[11px] font-medium tracking-wide" title="Choose another video"><span className="text-[13px]">⬆</span><span>Change Video</span></button>
                            <button onClick={resetSettings} className="clean-btn flex-1 justify-center gap-2 px-3 py-2 text-[11px] font-medium tracking-wide" title="Reset all settings"><span className="text-[13px]">↺</span><span>Reset</span></button>
                          </div>
                        )}
                        {!videoMode && images.length > 1 && (
                          <ImagesPanel images={images} activeId={activeImageId} setActiveId={setActiveImageId} removeImage={removeImage} addImages={readAndAddFiles} clearAll={clearAllImages} />
                        )}
                        {!videoMode && images.length <= 1 && activeImageId && (
                          <div className="flex gap-2">
                            <button onClick={clearAllImages} className="clean-btn flex-1 justify-center gap-2 px-3 py-2 text-[11px] font-medium tracking-wide" title="Choose another image (replaces current)"><span className="text-[13px]">⬆</span><span>Change Image</span></button>
                            <button onClick={resetSettings} className="clean-btn flex-1 justify-center gap-2 px-3 py-2 text-[11px] font-medium tracking-wide" title="Reset all settings to defaults"><span className="text-[13px]">↺</span><span>Reset</span></button>
                          </div>
                        )}
                        {videoMode && videoItem && (
                          <div className="min-panel p-0">
                            <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-left font-mono text-[11px] tracking-wide text-gray-300"><span className="flex items-center gap-2"><span>▾</span> Video</span><span className="text-[10px] text-gray-500">{videoCurrentTime.toFixed(1)} / {videoDuration.toFixed(1)}s</span></button>
                            <div className="space-y-3 border-t border-neutral-800 px-4 pt-3 pb-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <button type="button" onClick={() => setVideoPlaying(p => !p)} className="clean-btn px-3 py-1 text-[11px]" title={videoPlaying ? 'Pause playback' : 'Resume playback'}>{videoPlaying ? 'Pause' : 'Play'}</button>
                                <button type="button" onClick={() => { const v = (videoHook as any).videoElRef?.current as HTMLVideoElement | null; if (v) { v.currentTime = 0; } }} className="clean-btn px-3 py-1 text-[11px]" title="Restart video">⟲ Start</button>
                                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                  <span>FPS</span>
                                  <input type="range" min={2} max={30} value={videoFps} onChange={e => setVideoFps(Number(e.target.value))} className="clean-range !w-28" />
                                  <span className="w-6 text-right tabular-nums">{videoFps}</span>
                                </div>
                              </div>
                              {!videoReady && <p className="text-[10px] text-gray-500">Loading video metadata…</p>}
                            </div>
                          </div>
                        )}
                        <AlgorithmPanel pattern={pattern} setPattern={setPattern} threshold={threshold} setThreshold={setThreshold} invert={invert} setInvert={setInvert} serpentine={serpentine} setSerpentine={setSerpentine} paletteId={paletteId} asciiRamp={asciiRamp} setAsciiRamp={setAsciiRamp} />
                        {paletteSupported && (
                          <PalettePanel binaryMode={isBinary} paletteId={paletteId} setPaletteId={setPaletteId} activePaletteColors={activePaletteColors} setActivePaletteColors={setActivePaletteColors} effectivePalette={effectivePalette} image={!videoMode ? image : undefined} videoCanvas={videoMode ? videoCanvasForPalette : undefined} isVideoMode={videoMode} />
                        )}
                        <ResolutionPanel workingResolution={workingResolution} setWorkingResolution={setWorkingResolution} workingResInput={workingResInput} setWorkingResInput={setWorkingResInput} maxResolution={dynamicMaxResolution} />
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
                  {mediaActive ? (
              <div className="flex gap-2">
                <button onClick={() => hasApplied && setShowDownload(true)} disabled={!hasApplied} className={`clean-btn clean-btn-primary flex-1 justify-center text-[11px] ${!hasApplied ? 'cursor-not-allowed opacity-50' : ''}`}>Download</button>
                    </div>
                  ) : (
                    <Link to="/Algorithms" className="clean-btn w-full text-center text-[11px]">Explore Algorithms</Link>
                  )}
                </div>
              </div>
            </aside>
          )}
          <main className="flex flex-1 items-center justify-center overflow-auto">
            {!mediaActive && (
              <div className="w-full max-w-lg space-y-4">
                {!videoMode && <ImageUploader onImagesAdded={(items) => addImages(items)} />}
                {videoMode && !videoItem && <VideoUploader onVideoSelected={(v) => setVideoItem({ url: v.url, name: v.name })} />}
                {!videoMode && <button type="button" className="clean-btn w-full justify-center text-[11px]" onClick={switchMode}>Switch to Video Mode</button>}
                {videoMode && <button type="button" className="clean-btn w-full justify-center text-[11px]" onClick={switchMode}>Switch to Image Mode</button>}
                <p className="text-center text-[10px] text-gray-500">Select media to begin.</p>
              </div>
            )}
            {mediaActive && !videoMode && image && (
              <div className="flex h-full w-full items-center justify-center overflow-auto">
                <div className="canvas-frame flex items-center justify-center p-2" style={{ background: 'transparent', border: 'none' }}>
                  <div className="relative">
                    <canvas ref={canvasRef} className={`pixelated ${canvasUpdatedFlag ? 'updated' : ''}`} aria-label="Dithered image preview" />
                    {showGrid && (
                      <>
                        <div className="grid-overlay pointer-events-none absolute inset-0" aria-hidden style={{ backgroundSize: `${gridSize}px ${gridSize}px` }} />
                        <button type="button" onClick={() => { const order=[4,6,8,12,16]; setGridSize((gs:number)=> order[(order.indexOf(gs)+1)%order.length]); }} className="grid-size-badge" title="Cycle grid size (Shift+G)">{gridSize}px</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            {mediaActive && videoMode && videoItem && (
              <div className="flex h-full w-full flex-col items-center justify-center overflow-auto gap-2 p-2">
                <div className="canvas-frame flex items-center justify-center" style={{ background: 'transparent', border: 'none' }}>
                  <canvas ref={canvasRef} className={`pixelated ${canvasUpdatedFlag ? 'updated' : ''}`} aria-label="Dithered video frame" />
                </div>
              </div>
            )}
          </main>
        </div>
  <ExportDialog
          open={showDownload}
          onClose={() => setShowDownload(false)}
          videoMode={videoMode}
          image={image}
          videoItem={videoItem}
          webpSupported={webpSupported}
          processedCanvasRef={processedCanvasRef}
          canvasRef={canvasRef}
          downloadImageAs={downloadImageAs}
          downloadAsSVG={downloadAsSVG}
          recordingVideo={recordingVideo}
          startVideoExport={startVideoExport}
          cancelVideoExport={cancelVideoExport}
          recordedBlobUrl={recordedBlobUrl}
          recordingProgress={recordingProgress}
          recordingError={recordingError}
          videoExportFormat={videoExportFormat}
          setVideoExportFormat={setVideoExportFormat}
          videoFormatNote={videoFormatNote}
          recordingMimeType={recordingMimeRef.current}
          setRecordedBlobUrl={setRecordedBlobUrl}
        />
        <FocusHint focusMode={focusMode} />
  <PerformanceOverlay hasImage={!!image || !!videoItem} originalBytes={image ? images.find((i) => i.id === activeImageId)?.size || null : null} processedBytes={processedSizeBytes} />
      </div>
    </>
  );
};

export default ImageDitheringTool;
