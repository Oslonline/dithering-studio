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
import VideoUploadIntro from "../components/VideoUploadIntro";
import useDithering from "../hooks/useDithering";
import useVideoDithering from "../hooks/useVideoDithering";
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
  const [videoMode, setVideoMode] = useState(false);
  const [videoItem, setVideoItem] = useState<{ url: string; name?: string } | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoFps, setVideoFps] = useState(12);
  const paletteFromURL = useRef<[number, number, number][] | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const footerRef = useRef<HTMLDivElement | null>(null);
  const [settingsHeight, setSettingsHeight] = useState<number | null>(null);
  useEffect(() => {
    const calcHeights = () => {
      if (focusMode) { setSettingsHeight(null); return; }
      const headerH = headerRef.current ? headerRef.current.getBoundingClientRect().height : 0;
      const footerH = footerRef.current ? footerRef.current.getBoundingClientRect().height : 0;
      const vh = window.innerHeight;
      const h = vh - headerH - footerH;
      setSettingsHeight(h > 0 ? h : null);
    };
    calcHeights();
    const t = setTimeout(calcHeights, 50);
    window.addEventListener('resize', calcHeights);
    return () => { window.removeEventListener('resize', calcHeights); clearTimeout(t); };
  }, [focusMode, image, videoMode, videoItem]);

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

  const [recordingVideo, setRecordingVideo] = useState(false);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingMimeRef = useRef<string>("video/mp4");
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);
  const [videoExportFormat, setVideoExportFormat] = useState<'mp4' | 'webm'>('mp4');
  const [videoFormatNote, setVideoFormatNote] = useState<string | null>(null);
  
  const pickBestVideoMime = (preferred: 'mp4' | 'webm') => {
    const mp4Candidates = [
      'video/mp4;codecs=avc1.42E01E,mp4a.40.2', // baseline H264 + AAC
      'video/mp4'
    ];
    const webmCandidates = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm'
    ];
    const tryList = preferred === 'mp4' ? [...mp4Candidates, ...webmCandidates] : [...webmCandidates, ...mp4Candidates];
    for (const c of tryList) {
      try { if ((window as any).MediaRecorder && MediaRecorder.isTypeSupported(c)) return c; } catch {}
    }
    return 'video/webm';
  };

  useEffect(() => {
    if (!videoMode || !videoItem || !recordingVideo) return;
    if (!videoDuration) return;
    setRecordingProgress(Math.min(1, videoCurrentTime / videoDuration));
    if (videoCurrentTime >= videoDuration - 0.01) {
      recorderRef.current?.state === 'recording' && recorderRef.current.stop();
      setRecordingVideo(false);
    }
  }, [videoCurrentTime, videoDuration, recordingVideo, videoMode, videoItem]);

  const cleanupRecording = () => {
    recorderRef.current = null;
    recordedChunksRef.current = [];
  };

  const startVideoExport = () => {
    if (!canvasRef.current || !videoItem) return;
    if (recordingVideo) return;
    setRecordingError(null);
    setRecordedBlobUrl(r => { if (r) URL.revokeObjectURL(r); return null; });
    recordedChunksRef.current = [];
    const mime = pickBestVideoMime(videoExportFormat);
    recordingMimeRef.current = mime;
    if (videoExportFormat === 'mp4' && !mime.includes('mp4')) {
      setVideoFormatNote('MP4 not supported by this browser; fell back to WebM.');
    } else if (videoExportFormat === 'webm' && mime.includes('mp4')) {
      setVideoFormatNote('Browser forced MP4 despite WebM preference.');
    } else {
      setVideoFormatNote(null);
    }
    try {
      const stream = (canvasRef.current as HTMLCanvasElement).captureStream(videoFps || 12);
      const rec = new MediaRecorder(stream, { mimeType: mime });
      recorderRef.current = rec;
      rec.ondataavailable = (e) => { if (e.data && e.data.size) recordedChunksRef.current.push(e.data); };
      rec.onerror = (e) => { setRecordingError(e.error?.message || 'Recorder error'); };
      rec.onstop = () => {
        try {
          const blob = new Blob(recordedChunksRef.current, { type: recordingMimeRef.current });
          const url = URL.createObjectURL(blob);
          setRecordedBlobUrl(url);
        } catch (err: any) {
          setRecordingError(err?.message || 'Failed to finalize video');
        } finally {
          cleanupRecording();
        }
      };
      const vEl = (videoHook as any).videoElRef?.current as HTMLVideoElement | null;
      if (vEl) {
        vEl.currentTime = 0;
        vEl.play().catch(()=>{});
        setVideoPlaying(true);
      }
      setRecordingVideo(true);
      setRecordingProgress(0);
      rec.start();
    } catch (err: any) {
      setRecordingError(err?.message || 'Failed to start recording');
      cleanupRecording();
    }
  };

  const cancelVideoExport = () => {
    if (recorderRef.current && recorderRef.current.state === 'recording') {
      recorderRef.current.stop();
    }
    setRecordingVideo(false);
  };

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
                      {!videoMode && <UploadIntro />}
                      {videoMode && <VideoUploadIntro />}
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
        {showDownload && ((image && !videoMode) || (videoMode && videoItem)) && (
          <div className="fixed inset-0 z-40 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div ref={downloadRef} className="relative w-full max-w-md rounded border border-neutral-800 bg-[#111] p-5 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-mono text-xs tracking-wide text-gray-300">{videoMode ? 'Export Frame or Video' : 'Export Result'}</h2>
                <button onClick={() => setShowDownload(false)} className="clean-btn px-2 py-0 text-[11px]">
                  ✕
                </button>
              </div>
              {/* Frame export section */}
              <div className="mb-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="font-mono text-[11px] tracking-wide text-gray-400">Frame Export</span>
                  {videoMode && <span className="text-[10px] text-gray-500">Current processed frame</span>}
                </div>
                <div className="grid grid-cols-4 gap-2">
                <button onClick={() => downloadImageAs("png")} className="clean-btn w-full text-[11px]">
                  PNG
                </button>
                <button onClick={() => downloadImageAs("jpeg")} className="clean-btn w-full text-[11px]">
                  JPEG
                </button>
                <button onClick={() => downloadImageAs("webp")} disabled={!webpSupported} className={`clean-btn w-full text-[11px] ${!webpSupported ? "cursor-not-allowed opacity-40" : ""}`}>
                  WEBP
                </button>
                {!videoMode && (
                  <button onClick={downloadAsSVG} className="clean-btn w-full text-[11px]">
                    SVG
                  </button>
                )}
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
              </div>
              {videoMode && (
                <div className="mb-4 space-y-3">
                  <div className="border-t border-neutral-800 my-3" />
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] tracking-wide text-gray-400">Full Video Export</span>
                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                      <label className="flex items-center gap-1">
                        <span className="text-gray-400">Format</span>
                        <select value={videoExportFormat} onChange={e => { const val = e.target.value === 'mp4' ? 'mp4':'webm'; setVideoExportFormat(val); setRecordedBlobUrl(r=>{ if(r) URL.revokeObjectURL(r); return null; }); }} className="clean-input !h-7 !px-2 !py-0 text-[10px]">
                          <option value="mp4">MP4</option>
                          <option value="webm">WebM</option>
                        </select>
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={startVideoExport} disabled={recordingVideo} className={`clean-btn px-3 py-1 text-[11px] ${recordingVideo ? 'cursor-not-allowed opacity-50' : ''}`}>Record</button>
                    {recordingVideo && <button onClick={cancelVideoExport} className="clean-btn px-3 py-1 text-[11px]">Stop</button>}
                    {recordedBlobUrl && (
                      <a href={recordedBlobUrl} download={`dithered-video.${recordingMimeRef.current.includes('mp4') ? 'mp4' : 'webm'}`} className="clean-btn px-3 py-1 text-[11px]">Download</a>
                    )}
                  </div>
                  {videoFormatNote && <p className="text-[10px] text-amber-400">{videoFormatNote}</p>}
                  {recordingVideo && (
                    <div className="flex items-center gap-2 text-[10px] text-gray-400">
                      <div className="h-1 flex-1 rounded bg-neutral-800 overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all" style={{ width: `${(recordingProgress * 100).toFixed(1)}%` }} />
                      </div>
                      <span>{(recordingProgress * 100).toFixed(0)}%</span>
                    </div>
                  )}
                  {recordingError && <p className="text-[10px] text-red-500">{recordingError}</p>}
                  {recordedBlobUrl && !recordingVideo && <p className="text-[10px] text-gray-500">Finished. Download ready.</p>}
                </div>
              )}
              {videoMode && (
                <div className="mb-4 space-y-3">
                  <div className="border-t border-neutral-800 pt-3" />
                  <div className="space-y-1 text-[10px] leading-snug text-gray-500">
                    <p><span className="font-semibold text-gray-400">Frame Export:</span> PNG (lossless), JPEG (smaller), WEBP {webpSupported ? '(modern)' : '(unsupported)'} clipboard copy.</p>
                    <p><span className="font-semibold text-gray-400">Full Video:</span> {recordingMimeRef.current.includes('mp4') ? 'MP4 (H.264/AAC if supported)' : 'WebM (VP8/VP9 + Opus)'} — Windows legacy players may need codecs for WebM.</p>
                  </div>
                </div>
              )}
              {!videoMode && (
                <p className="mb-4 text-[10px] leading-snug text-gray-500">PNG (lossless), JPEG (smaller), WEBP {webpSupported ? "(modern)" : "(unsupported)"}; SVG vector (large for big images).</p>
              )}
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
  <PerformanceOverlay hasImage={!!image || !!videoItem} originalBytes={image ? images.find((i) => i.id === activeImageId)?.size || null : null} processedBytes={processedSizeBytes} />
      </div>
    </>
  );
};

export default ImageDitheringTool;
