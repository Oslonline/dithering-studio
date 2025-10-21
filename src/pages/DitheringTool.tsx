import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useSettings } from "../state/SettingsContext";
import { canvasToSVG } from "../utils/export";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ImageUploader from "../components/uploaders/ImageUploader";
import VideoUploader from "../components/uploaders/VideoUploader";
import ImagesPanel, { UploadedImage } from "../components/panels/ImagesPanel";
import AlgorithmPanel from "../components/panels/AlgorithmPanel";
import PalettePanel from "../components/panels/PalettePanel";
import TonePanel from "../components/panels/TonePanel";
import UploadIntro from "../components/uploaders/UploadIntro";
import useDithering from "../hooks/useDithering";
import useVideoDithering from "../hooks/useVideoDithering";
import PerformanceOverlay from "../components/ui/PerformanceOverlay";
import ProcessingOverlay from "../components/ui/ProcessingOverlay";
import ImageComparison from "../components/ui/ImageComparison";
import CanvasViewport from "../components/canvas/CanvasViewport";
import ExportDialog from "../components/dialogs/ExportDialog";
import PostDownloadShareDialog from "../components/dialogs/PostDownloadShareDialog";
import Header from "../components/ui/Header";
import useToolKeyboardShortcuts from "../hooks/useToolKeyboardShortcuts";
import useVideoRecording from "../hooks/useVideoRecording";
import useSettingsHeight from "../hooks/useSettingsHeight";
import useApplyUrlParams from "../hooks/useApplyUrlParams";
import { useKeyboardShortcutsModal } from "../hooks/useKeyboardShortcutsModal";
import KeyboardShortcutsModal from "../components/dialogs/KeyboardShortcutsModal";
import { perf } from "../utils/perf";
import { predefinedPalettes } from "../utils/palettes";
import { algorithms } from "../utils/algorithms";
import { triggerHaptic } from "../utils/haptic";
import PresetPanel from "../components/panels/PresetPanel";
import { getRandomAlgorithm } from "../components/panels/AlgorithmSelect";
import CustomKernelEditor from "../components/panels/CustomKernelEditor";

const isErrorDiffusion = (p: number) => algorithms.some((a) => a.id === p && a.category === "Error Diffusion");

interface DitheringToolProps {
  initialMode?: "image" | "video";
}

const DitheringTool: React.FC<DitheringToolProps> = ({ initialMode = "image" }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    images,
    setImages,
    activeImageId,
    setActiveImageId,
    pattern,
    setPattern,
    threshold,
    setThreshold,
    workingResolution,
    setWorkingResolution,
    contrast,
    setContrast,
    midtones,
    setMidtones,
    highlights,
    setHighlights,
    blurRadius,
    setBlurRadius,
    webpSupported,
    setWebpSupported,
    paletteId,
    setPaletteId,
    activePaletteColors,
    setActivePaletteColors,
    invert,
    setInvert,
    serpentine,
    setSerpentine,
    asciiRamp,
    setAsciiRamp,
    showGrid,
    setShowGrid,
    gridSize,
    setGridSize,
    focusMode,
    setFocusMode,
    customKernel,
    customKernelDivisor,
    videoMode,
    setVideoMode,
    videoItem,
    setVideoItem,
    videoPlaying,
    setVideoPlaying,
    videoFps,
    setVideoFps,
    showDownload,
    setShowDownload,
  } = useSettings();
  const image = activeImageId ? images.find((i: UploadedImage) => i.id === activeImageId)?.url || null : null;
  const [localWebpChecked, setLocalWebpChecked] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState<{ width: string; height: string }>({ width: 'auto', height: 'auto' });
  
  useEffect(() => {
    if (initialMode === "video" && !videoMode) {
      setVideoMode(true);
      setImages([]);
      setActiveImageId(null);
    } else if (initialMode === "image" && videoMode) {
      setVideoMode(false);
      setVideoItem(null);
    }
  }, [initialMode, videoMode, setVideoMode, setImages, setActiveImageId, setVideoItem]);
  
  useEffect(() => {
    if (localWebpChecked) return;
    try {
      const c = document.createElement("canvas");
      c.width = c.height = 2;
      const data = c.toDataURL("image/webp");
      if (!data.startsWith("data:image/webp")) setWebpSupported(false);
    } catch {
      setWebpSupported(false);
    }
    setLocalWebpChecked(true);
  }, [localWebpChecked, setWebpSupported]);
  // (state migrated to context above)
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

  useApplyUrlParams({ setPattern, setThreshold, setWorkingResolution, setInvert, setSerpentine, setAsciiRamp, setPaletteId, paletteFromURL, setContrast, setMidtones, setHighlights, setBlurRadius, setVideoMode });

  const { isOpen: isShortcutsOpen, close: closeShortcuts } = useKeyboardShortcutsModal();

  const selectedAlgo = algorithms.find((a) => a.id === pattern);
  const isBinary = pattern === 15 || pattern === 10;
  const paletteSupported = isBinary ? true : !!selectedAlgo?.supportsPalette;
  const isAscii = selectedAlgo?.name === "ASCII Mosaic";
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
    contrast,
    midtones,
    highlights,
    blurRadius,
    customKernel,
    customKernelDivisor,
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
    loop: true,
    contrast,
    midtones,
    highlights,
    blurRadius,
  });
  const { canvasRef, processedCanvasRef, hasApplied, canvasUpdatedFlag, processedSizeBytes } = videoMode ? videoHook : imageHook;
  const busy = !videoMode ? (imageHook as any).busy : false;
  const videoDuration = videoMode ? (videoHook as any).duration : 0;
  const videoCurrentTime = videoMode ? (videoHook as any).currentTime : 0;
  const videoReady = videoMode ? (videoHook as any).ready : false;
  const videoCanvasForPalette: HTMLCanvasElement | null = videoMode ? (videoHook as any).processedCanvasRef?.current || (videoHook as any).canvasRef?.current || null : null;
  const imageOrig = (imageHook as any).origDims as { width: number; height: number };
  const videoOrig = (videoHook as any).naturalDims as { width: number; height: number };
  let dynamicMaxResolution: number | undefined;
  if (!videoMode && imageOrig?.width && imageOrig?.height) {
    dynamicMaxResolution = Math.max(imageOrig.width, imageOrig.height);
  } else if (videoMode && videoOrig?.width && videoOrig?.height) {
    dynamicMaxResolution = Math.max(videoOrig.width, videoOrig.height);
  }
  if (dynamicMaxResolution && workingResolution > dynamicMaxResolution) {
    setWorkingResolution(dynamicMaxResolution);
  }

  const { recordingVideo, recordingProgress, recordingError, startVideoExport, cancelVideoExport, recordedBlobUrl, videoExportFormat, setVideoExportFormat, videoFormatNote, recordingMimeRef, setRecordedBlobUrl } = useVideoRecording({ videoItem, canvasRef, videoHook, videoFps, setVideoPlaying });

  const mediaActive = (!videoMode && !!image) || (videoMode && !!videoItem);

  const switchMode = () => {
    if (videoMode) {
      navigate("/Dithering/Image");
    } else {
      navigate("/Dithering/Video");
    }
  };

  // Reset perf data when active image changes (fresh stats per image)
  useEffect(() => {
    perf.reset();
  }, [activeImageId]);

  // Update canvas dimensions for ImageComparison sizing
  useEffect(() => {
    if (canvasRef.current && hasApplied) {
      const width = canvasRef.current.style.width || 'auto';
      const height = canvasRef.current.style.height || 'auto';
      setCanvasDimensions({ width, height });
    }
  }, [hasApplied, canvasUpdatedFlag]);

  useToolKeyboardShortcuts({ images, activeImageId, setActiveImageId, setFocusMode: (fn: any) => setFocusMode(fn), setShowGrid: (fn: any) => setShowGrid(fn), setGridSize, mediaActive });

  if (!mediaActive && showGrid) {
    setShowGrid(false);
  }

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
    setPaletteId(null);
    setActivePaletteColors(null);
    setInvert(false);
    setSerpentine(true);
    setContrast(0);
    setMidtones(1.0);
    setHighlights(0);
    setBlurRadius(0);
    setAsciiRamp("@%#*+=-:. ");
    setContrast(0);
    setMidtones(1.0);
    setHighlights(0);
    setBlurRadius(0);
    setShowGrid(false);
    setGridSize(8);
    try {
      localStorage.removeItem("ds_settings");
    } catch {}
    perf.reset();
  };
  // showDownload from context

  // Build a shareable URL from current settings
  const buildShareUrl = () => {
    const base = typeof window !== "undefined" ? `${window.location.origin}${window.location.pathname}` : "https://ditheringstudio.com/Dithering";
    const params = new URLSearchParams();
    if (pattern) params.set("p", String(pattern));
    params.set("t", String(threshold));
    params.set("r", String(workingResolution));
    params.set("inv", invert ? "1" : "0");
    params.set("ser", serpentine ? "1" : "0");
    if (paletteId) {
      params.set("pal", paletteId);
      if (paletteId === "__custom" && activePaletteColors && activePaletteColors.length) {
        const cols = activePaletteColors.map(([r, g, b]) => `${r}.${g}.${b}`).join("-");
        params.set("cols", cols);
      }
    }
    if (contrast) params.set("c", String(contrast));
    if (midtones && midtones !== 1.0) params.set("g", String(midtones));
    if (highlights) params.set("h", String(highlights));
    if (blurRadius) params.set("b", String(blurRadius));
    if (asciiRamp && asciiRamp.trim().length >= 2) {
      // limit length to keep URL manageable
      const enc = encodeURIComponent(asciiRamp.slice(0, 64));
      params.set("ramp", enc);
    }
    const qs = params.toString();
    return `${base}?${qs}`;
  };

  const [shareCopied, setShareCopied] = useState(false);
  const copyShareUrl = async () => {
    const url = buildShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1500);
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 1500);
      } catch {
        // Optional: silent fail to avoid extra UI noise; could add inline error state if desired
      }
    }
  };

  const [showPostShare, setShowPostShare] = useState(false);
  const [lastDownloadFormat, setLastDownloadFormat] = useState<string | undefined>(undefined);
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
    setLastDownloadFormat(fmt);
    setShowDownload(false);
    // only show post share dialog for image mode (not video) and when image present
    if (!videoMode && image) {
      setTimeout(() => setShowPostShare(true), 150); // slight delay for smoother transition
    }
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
    setLastDownloadFormat("svg");
    if (!videoMode && image) {
      setTimeout(() => setShowPostShare(true), 150);
    }
  };

  const handleVideoDownloaded = (fmt: string) => {
    setLastDownloadFormat(fmt);
    setTimeout(() => setShowPostShare(true), 150);
  };

  return (
    <>
      <Helmet>
        <title>{videoMode ? t('tool.seo.videoTitle') : t('tool.seo.imageTitle')}</title>
        <meta
          name="description"
          content={videoMode ? t('tool.seo.videoDescription') : t('tool.seo.imageDescription')}
        />
        <link rel="canonical" href={videoMode ? "https://ditheringstudio.com/Dithering/Video" : "https://ditheringstudio.com/Dithering/Image"} />
        <script type="application/ld+json">
          {`
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://ditheringstudio.com/"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "${videoMode ? 'Video Dithering' : 'Image Dithering'}",
                "item": "https://ditheringstudio.com/Dithering/${videoMode ? 'Video' : 'Image'}"
              }
            ]
          }
          `}
        </script>
      </Helmet>
      <div id="tool" className={`flex min-h-screen w-full flex-col overflow-hidden ${focusMode ? "focus-mode" : ""}`}>
        <div ref={headerRef as React.RefObject<HTMLDivElement>} className={focusMode ? "hidden" : ""}>
          <Header page="tool" videoMode={videoMode} onModeSwitch={switchMode} />
        </div>
        <div id="main-content" className="flex flex-1 flex-col overflow-hidden md:flex-row">
          {!focusMode && (
            <aside className="flex w-full flex-shrink-0 flex-col border-b border-neutral-800 bg-[#0d0d0d] md:w-80 md:border-r md:border-b-0">
              <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto" style={settingsHeight ? { maxHeight: settingsHeight } : undefined}>
                  {!mediaActive && (
                    <div className="space-y-4 px-4 pt-4 pb-6">
                      <UploadIntro mode={videoMode ? "video" : "image"} />
                    </div>
                  )}
                  {mediaActive && (
                    <div className="px-4 pt-4 pb-6">
                      <div className="settings-stack space-y-6">
                        {videoMode && videoItem && (
                          <div className="flex gap-2">
                            <button onClick={() => setVideoItem(null)} className="clean-btn flex-1 justify-center gap-2 px-3 py-2 text-[11px] font-medium tracking-wide" title={t('tool.chooseAnotherVideo')}>
                              <span className="text-[13px]">⬆</span>
                              <span>{t('tool.changeVideo')}</span>
                            </button>
                            <button onClick={resetSettings} className="clean-btn flex-1 justify-center gap-2 px-3 py-2 text-[11px] font-medium tracking-wide" title={t('tool.resetAllSettings')}>
                              <span className="text-[13px]">↺</span>
                              <span>{t('tool.reset')}</span>
                            </button>
                            <button onClick={() => setPattern(getRandomAlgorithm(pattern))} className="clean-btn px-3 py-2 text-[16px]" title="Random algorithm" aria-label="Select random algorithm">
                              🎲
                            </button>
                          </div>
                        )}
                        {!videoMode && images.length > 1 && <ImagesPanel images={images} activeId={activeImageId} setActiveId={setActiveImageId} removeImage={removeImage} addImages={readAndAddFiles} clearAll={clearAllImages} />}
                        {!videoMode && images.length <= 1 && activeImageId && (
                          <div className="flex gap-2">
                            <button onClick={clearAllImages} className="clean-btn flex-1 justify-center gap-2 px-3 py-2 text-[11px] font-medium tracking-wide" title={t('tool.chooseAnotherImage')}>
                              <span className="text-[13px]">⬆</span>
                              <span>{t('tool.changeImage')}</span>
                            </button>
                            <button onClick={resetSettings} className="clean-btn flex-1 justify-center gap-2 px-3 py-2 text-[11px] font-medium tracking-wide" title={t('tool.resetAllSettingsDefaults')}>
                              <span className="text-[13px]">↺</span>
                              <span>{t('tool.reset')}</span>
                            </button>
                            <button onClick={() => setPattern(getRandomAlgorithm(pattern))} className="clean-btn px-3 py-2 text-[16px]" title="Random algorithm" aria-label="Select random algorithm">
                              🎲
                            </button>
                          </div>
                        )}
                        {videoMode && videoItem && (
                          <div className="min-panel p-0">
                            <button type="button" className="flex w-full items-center justify-between px-4 py-3 text-left font-mono text-[11px] tracking-wide text-gray-300">
                              <span className="flex items-center gap-2">
                                <span>▾</span> Video
                              </span>
                              <span className="text-[10px] text-gray-500">
                                {videoCurrentTime.toFixed(1)} / {videoDuration.toFixed(1)}s
                              </span>
                            </button>
                            <div className="space-y-3 border-t border-neutral-800 px-4 pt-3 pb-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <button type="button" onClick={() => setVideoPlaying((p) => !p)} className="clean-btn px-3 py-1 text-[11px]" title={videoPlaying ? t('tool.pause') : t('tool.play')}>
                                  {videoPlaying ? t('tool.pause') : t('tool.play')}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const v = (videoHook as any).videoElRef?.current as HTMLVideoElement | null;
                                    if (v) {
                                      v.currentTime = 0;
                                    }
                                  }}
                                  className="clean-btn px-3 py-1 text-[11px]"
                                  title={t('tool.videoPanel.restart')}
                                >
                                  ⟲ Start
                                </button>
                                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                                  <span>{t('tool.fps')}</span>
                                  <input type="range" min={2} max={30} value={videoFps} onChange={(e) => setVideoFps(Number(e.target.value))} className="clean-range !w-28" />
                                  <span className="w-6 text-right tabular-nums">{videoFps}</span>
                                </div>
                              </div>
                              {!videoReady && <p className="text-[10px] text-gray-500">{t('tool.videoPanel.loadingMetadata')}</p>}
                            </div>
                          </div>
                        )}
                        <AlgorithmPanel pattern={pattern} setPattern={setPattern} threshold={threshold} setThreshold={setThreshold} invert={invert} setInvert={setInvert} serpentine={serpentine} setSerpentine={setSerpentine} paletteId={paletteId} asciiRamp={asciiRamp} setAsciiRamp={setAsciiRamp} />
                        {pattern === 26 && <CustomKernelEditor inline={false} />}
                        <TonePanel contrast={contrast} setContrast={setContrast} midtones={midtones} setMidtones={setMidtones} highlights={highlights} setHighlights={setHighlights} blurRadius={blurRadius} setBlurRadius={setBlurRadius} workingResolution={workingResolution} setWorkingResolution={setWorkingResolution} maxResolution={dynamicMaxResolution} />
                        {paletteSupported && <PalettePanel binaryMode={isBinary} paletteId={paletteId} setPaletteId={setPaletteId} activePaletteColors={activePaletteColors} setActivePaletteColors={setActivePaletteColors} effectivePalette={effectivePalette} image={!videoMode ? image : undefined} videoCanvas={videoMode ? videoCanvasForPalette : undefined} isVideoMode={videoMode} />}
                        <PresetPanel
                          current={{ params: { pattern, threshold, invert, serpentine, isErrorDiffusion: isErrorDiffusion(pattern), palette: activePaletteColors || undefined }, workingResolution, paletteId, activePaletteColors }}
                          apply={(p) => {
                            setPattern(p.pattern);
                            setThreshold(p.threshold);
                            setInvert(p.invert);
                            setSerpentine(p.serpentine);
                            setWorkingResolution(p.workingResolution);
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
                      <button type="button" onClick={copyShareUrl} className="clean-btn basis-1/3 justify-center text-[11px]" title={t('tool.shareSettingsTitle')}>
                        {shareCopied ? t('tool.copied') : t('tool.share')}
                      </button>
                      <button 
                        onClick={() => {
                          if (hasApplied) {
                            triggerHaptic('medium');
                            setShowDownload(true);
                          }
                        }} 
                        disabled={!hasApplied} 
                        className={`clean-btn clean-btn-primary basis-2/3 justify-center text-[11px] ${!hasApplied ? "cursor-not-allowed opacity-50" : ""}`}
                      >
                        {t('tool.download')}
                      </button>
                    </div>
                  ) : (
                    <Link to="/Algorithms" className="clean-btn w-full text-center text-[11px]">
                      {t('tool.exploreAlgorithms')}
                    </Link>
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
                {!videoMode && (
                  <button type="button" className="clean-btn w-full justify-center text-[11px]" onClick={switchMode}>
                    {t('tool.switchToVideoMode')}
                  </button>
                )}
                {videoMode && (
                  <button type="button" className="clean-btn w-full justify-center text-[11px]" onClick={switchMode}>
                    {t('tool.switchToImageMode')}
                  </button>
                )}
                <p className="text-center text-[10px] text-gray-500">{t('tool.selectMedia')}</p>
              </div>
            )}
            {mediaActive && !videoMode && image && (
              <CanvasViewport>
                <div className="relative inline-block">
                  {/* Canvas always renders - this is the source of truth for the processed (dithered) image */}
                  <canvas 
                    ref={canvasRef} 
                    className={`pixelated ${canvasUpdatedFlag ? "updated" : ""}`} 
                    aria-label={t('tool.ariaDitheredImagePreview')} 
                  />
                  
                  {/* Comparison overlay - reveals original image on the left side via slider */}
                  {/* The right side is transparent, showing the canvas (processed image) underneath */}
                  {showComparison && (
                    <div className="absolute inset-0 pointer-events-auto">
                      <ImageComparison
                        beforeImage={image}
                        beforeLabel="Original"
                        afterLabel="Dithered"
                        width={canvasDimensions.width}
                        height={canvasDimensions.height}
                      />
                    </div>
                  )}
                  
                  {/* Grid overlay */}
                  {showGrid && !showComparison && (
                    <>
                      <div className="grid-overlay pointer-events-none absolute inset-0" aria-hidden style={{ backgroundSize: `${gridSize}px ${gridSize}px` }} />
                      <button
                        onClick={() => {
                          const order = [4, 6, 8, 12, 16];
                          setGridSize((gs: number) => order[(order.indexOf(gs) + 1) % order.length]);
                        }}
                        className="grid-size-badge"
                        title={t('tool.cycleGridSize')}
                      >
                        {gridSize}px
                      </button>
                    </>
                  )}
                  
                  {/* Compare toggle button */}
                  {hasApplied && (
                    <button
                      onClick={() => {
                        triggerHaptic('light');
                        setShowComparison(!showComparison);
                      }}
                      className="absolute top-2 right-2 clean-btn text-[10px] px-3 py-1.5 bg-neutral-900/90 hover:bg-neutral-800/90 z-10"
                      title={showComparison ? "Show dithered only" : "Compare before/after"}
                    >
                      {showComparison ? "Hide Comparison" : "Compare"}
                    </button>
                  )}
                </div>
              </CanvasViewport>
            )}
            {mediaActive && videoMode && videoItem && (
              <CanvasViewport>
                <div className="relative inline-block">
                  <canvas ref={canvasRef} className={`pixelated ${canvasUpdatedFlag ? "updated" : ""}`} aria-label={t('tool.ariaDitheredVideoFrame')} />
                </div>
              </CanvasViewport>
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
          onVideoDownload={handleVideoDownloaded}
        />
        <PostDownloadShareDialog
          open={showPostShare}
          onClose={() => setShowPostShare(false)}
          canvasRef={canvasRef}
          processedCanvasRef={processedCanvasRef}
          lastFormat={lastDownloadFormat}
          isVideo={videoMode}
        />
        <PerformanceOverlay hasImage={!!image || !!videoItem} originalBytes={image ? images.find((i) => i.id === activeImageId)?.size || null : null} processedBytes={processedSizeBytes} />
        <ProcessingOverlay 
          isProcessing={busy || false} 
          operation={videoMode ? "Processing video frame" : "Dithering image"} 
        />
        <KeyboardShortcutsModal isOpen={isShortcutsOpen} onClose={closeShortcuts} />
      </div>
    </>
  );
};

export default DitheringTool;
