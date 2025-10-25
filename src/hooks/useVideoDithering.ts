import { useEffect, useRef, useState } from 'react';
import { perf } from '../utils/perf';
import { findPalette } from '../utils/palettes';
import { findAlgorithm } from '../utils/algorithms';
import { applyLuminancePreprocess } from '../utils/preprocess';

interface Params {
  video: string | null;
  pattern: number;
  threshold: number;
  workingResolution: number;
  invert: boolean;
  serpentine: boolean;
  isErrorDiffusion: boolean;
  paletteId?: string | null;
  paletteColors?: [number, number, number][];
  asciiRamp?: string;
  fps?: number;
  playing: boolean;
  loop?: boolean;
}

type ExtraParams = { contrast?: number; midtones?: number; highlights?: number; blurRadius?: number };

const useVideoDithering = ({ video, pattern, threshold, workingResolution, invert, serpentine, isErrorDiffusion, paletteId, paletteColors, asciiRamp, fps = 12, playing, loop = true, ...extras }: Params & ExtraParams) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const processedCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const [ready, setReady] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [canvasUpdatedFlag, setCanvasUpdatedFlag] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [processedSizeBytes, setProcessedSizeBytes] = useState<number | null>(null);
  const [naturalDims, setNaturalDims] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const tokenRef = useRef(0);
  const lastFrameTimeRef = useRef(0);
  const needResizeRef = useRef(true);

  useEffect(() => {
    const onResize = () => { needResizeRef.current = true; };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    setReady(false);
    setHasApplied(false);
    if (!video) {
      if (videoElRef.current) {
        videoElRef.current.pause();
      }
      videoElRef.current = null;
      return;
    }
    const v = document.createElement('video');
    v.src = video;
    v.crossOrigin = 'anonymous';
    v.muted = true;
    v.playsInline = true;
    v.preload = 'auto';
    v.onloadedmetadata = () => {
      setDuration(v.duration || 0);
      if (v.videoWidth && v.videoHeight) {
        setNaturalDims({ width: v.videoWidth, height: v.videoHeight });
      }
      setReady(true);
      if (playing) {
        v.play().catch(() => { });
      }
    };
    v.onended = () => {
      if (loop) {
        v.currentTime = 0;
        v.play().catch(() => { });
      }
    };
    videoElRef.current = v;
    return () => {
      v.pause();
    };
  }, [video, loop]);

  useEffect(() => {
    const v = videoElRef.current;
    if (!v) return;
    if (playing) {
      v.play().catch(() => { });
    } else {
      v.pause();
    }
  }, [playing]);

  useEffect(() => {
    let active = true;
    let frameCount = 0;
    const canvas = canvasRef.current;
    const procCanvas = processedCanvasRef.current;
    if (!canvas || !procCanvas) return;
    const ctx = canvas.getContext('2d');
    const procCtx = procCanvas.getContext('2d');
    if (!ctx || !procCtx) return;

    const frameInterval = 1000 / fps;

    const processFrame = () => {
      const v = videoElRef.current;
      if (!v || !ready || v.readyState < 2) return false;
      
      tokenRef.current++;
      const token = tokenRef.current;
      const vw = v.videoWidth;
      const vh = v.videoHeight;
      if (!vw || !vh) return false;
      const maxDim = Math.max(vw, vh);
      const scale = Math.min(1, Math.max(16, workingResolution) / maxDim);
      const width = Math.max(1, Math.round(vw * scale));
      const height = Math.max(1, Math.round(vh * scale));
      if (procCanvas.width !== width || procCanvas.height !== height) {
        procCanvas.width = width; procCanvas.height = height;
      }
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width; canvas.height = height;
        needResizeRef.current = true;
      }
      perf.newFrame(token);
      perf.phaseStart('scale-draw');
      if (extras.blurRadius && extras.blurRadius > 0) {
        const prev = (procCtx as any).filter as string | undefined;
        (procCtx as any).filter = `blur(${Math.min(10, Math.max(0, extras.blurRadius)).toFixed(1)}px)`;
        procCtx.drawImage(v, 0, 0, width, height);
        (procCtx as any).filter = prev || 'none';
      } else {
        procCtx.drawImage(v, 0, 0, width, height);
      }
      perf.phaseEnd('scale-draw');
      const src = procCtx.getImageData(0, 0, width, height);
      const srcData = src.data;
      applyLuminancePreprocess(srcData, { contrast: extras.contrast ?? 0, midtones: extras.midtones ?? 1.0, highlights: extras.highlights ?? 0 });
      const palette = ((paletteColors && paletteColors.length >= 2) ? paletteColors : null) || findPalette(paletteId || null)?.colors || null;
      if (palette && invert) {
        for (let i = 0; i < srcData.length; i += 4) {
          srcData[i] = 255 - srcData[i];
          srcData[i + 1] = 255 - srcData[i + 1];
          srcData[i + 2] = 255 - srcData[i + 2];
        }
      }
      perf.phaseStart('dither');
      const algo = findAlgorithm(pattern);
      let out: ImageData | null = null;
      if (algo) {
        const res = algo.run({ srcData, width, height, params: { pattern, threshold, invert: palette ? false : invert, serpentine, isErrorDiffusion, palette: palette || undefined, asciiRamp } as any });
        out = res instanceof ImageData ? res : new ImageData(width, height);
        if (!(res instanceof ImageData)) out.data.set(res as any);
      } else {
        out = src; // fallback
      }
      perf.phaseEnd('dither');
      if (token !== tokenRef.current || !active) return false;
      perf.phaseStart('present');
      ctx.putImageData(out, 0, 0);
      perf.phaseEnd('present');

      if (needResizeRef.current) {
        needResizeRef.current = false;
        try {
          const ow = vw;
          const oh = vh;
          const aside = document.querySelector('aside');
          const sidebarWidth = aside ? aside.getBoundingClientRect().width : 0;
          const viewportW = window.innerWidth;
          const viewportH = window.innerHeight;
          const maxW = Math.min(viewportW - sidebarWidth - 40, 1280);
          const maxH = viewportH - 140;
          let dispW = Math.min(maxW, maxH * (ow / oh));
          if (dispW < 120) dispW = 120;
          const dispH = dispW * (oh / ow);
          canvas.style.width = dispW + 'px';
          canvas.style.height = dispH + 'px';
        } catch { }
      }

      setHasApplied(true);
      setCanvasUpdatedFlag(true);
      setTimeout(() => { if (token === tokenRef.current) setCanvasUpdatedFlag(false); }, 100);
      setCurrentTime(v.currentTime);
      
      frameCount++;
      if (frameCount % 30 === 0 || !playing) {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          const comma = dataUrl.indexOf(',');
          if (comma !== -1) {
            const b64 = dataUrl.slice(comma + 1);
            const bytes = Math.floor((b64.length * 3) / 4 - (b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0));
            setProcessedSizeBytes(bytes);
          }
        } catch { }
      }
      
      perf.endFrame();
      return true;
    };

    const run = (t: number) => {
      if (!active) return;
      requestAnimationFrame(run);
      const v = videoElRef.current;
      if (!v || !ready || v.readyState < 2) return;
      
      if (playing) {
        if (t - lastFrameTimeRef.current < frameInterval) return;
        lastFrameTimeRef.current = t;
        processFrame();
      }
    };

    processFrame();
    
    requestAnimationFrame(run);
    return () => { active = false; };
  }, [pattern, threshold, workingResolution, invert, serpentine, isErrorDiffusion, paletteId, paletteColors, asciiRamp, fps, playing, ready, extras.contrast, extras.midtones, extras.highlights, extras.blurRadius]);

  return { canvasRef, processedCanvasRef, videoElRef, hasApplied, canvasUpdatedFlag, ready, duration, currentTime, processedSizeBytes, naturalDims };
};

export default useVideoDithering;