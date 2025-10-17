import React, { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { predefinedPalettes } from "../../utils/palettes";

interface PalettePanelProps {
  paletteId: string | null;
  setPaletteId: (id: string | null) => void;
  activePaletteColors: [number, number, number][] | null;
  setActivePaletteColors: React.Dispatch<React.SetStateAction<[number, number, number][] | null>>;
  effectivePalette: [number, number, number][] | null;
  image?: string | null;
  videoCanvas?: HTMLCanvasElement | null;
  binaryMode?: boolean;
  isVideoMode?: boolean;
}

const CUSTOM_ID = "__custom";
const ORIGINAL_ID = "__original";

const PalettePanel: React.FC<PalettePanelProps> = ({ paletteId, setPaletteId, activePaletteColors, setActivePaletteColors, effectivePalette, image, videoCanvas, binaryMode, isVideoMode }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newColor, setNewColor] = useState("#ffffff");
  const [invalid, setInvalid] = useState(false);
  const dragFrom = useRef<number | null>(null);
  const randomColor = (): [number, number, number] => [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)];
  const randomPair = (): [number, number, number][] => {
    let a = randomColor();
    let b = randomColor();
    let tries = 0;
    const dist = (x: [number, number, number], y: [number, number, number]) => {
      const dr = x[0] - y[0],
        dg = x[1] - y[1],
        db = x[2] - y[2];
      return dr * dr + dg * dg + db * db;
    };
    while (dist(a, b) < 60 * 60 && tries < 24) {
      b = randomColor();
      tries++;
    }
    return [a, b];
  };

  const parseColor = (val: string): [number, number, number] | null => {
    let v = val.trim();
    if (!v) return null;
    const rgbFn = /^rgb\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i.exec(v);
    if (rgbFn) {
      const r = +rgbFn[1],
        g = +rgbFn[2],
        b = +rgbFn[3];
      if ([r, g, b].every((n) => n >= 0 && n <= 255)) return [r, g, b];
      return null;
    }
    const csv = /^(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})$/.exec(v);
    if (csv) {
      const r = +csv[1],
        g = +csv[2],
        b = +csv[3];
      if ([r, g, b].every((n) => n >= 0 && n <= 255)) return [r, g, b];
      return null;
    }
    if (v.startsWith("#")) v = v.slice(1);
    if (/^[0-9a-fA-F]{3}$/.test(v)) {
      const r = parseInt(v[0] + v[0], 16),
        g = parseInt(v[1] + v[1], 16),
        b = parseInt(v[2] + v[2], 16);
      return [r, g, b];
    }
    if (/^[0-9a-fA-F]{6}$/.test(v)) {
      const r = parseInt(v.slice(0, 2), 16),
        g = parseInt(v.slice(2, 4), 16),
        b = parseInt(v.slice(4, 6), 16);
      return [r, g, b];
    }
    return null;
  };

  const addColor = () => {
    const col = parseColor(newColor);
    if (!col) {
      setInvalid(true);
      return;
    }
    setInvalid(false);
    setActivePaletteColors((prev) => {
      const base = prev ? [...prev] : [];
      base.push(col);
      return base;
    });
    setAdding(false);
    setNewColor("#ffffff");
  };

  const extractOriginalFull = useCallback(async () => {
    if (!image && !videoCanvas) return;
    try {
      const MAX_COLORS = 64;
      const TARGET_PIXELS = 65536;
      let sourceCanvas: HTMLCanvasElement;
      if (videoCanvas) {
        sourceCanvas = document.createElement('canvas');
        const vw = videoCanvas.width;
        const vh = videoCanvas.height;
        let scale = 1;
        const total = vw * vh;
        if (total > TARGET_PIXELS) scale = Math.sqrt(TARGET_PIXELS / total);
        const sw = Math.max(1, Math.round(vw * scale));
        const sh = Math.max(1, Math.round(vh * scale));
        sourceCanvas.width = sw; sourceCanvas.height = sh;
        const sctx = sourceCanvas.getContext('2d');
        if (!sctx) return;
        sctx.drawImage(videoCanvas, 0, 0, sw, sh);
      } else {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const done = new Promise<HTMLImageElement>((res, rej) => { img.onload = () => res(img); img.onerror = () => rej(new Error('load')); });
        img.src = image!;
        await done;
        let { width, height } = img;
        const total = width * height;
        let scale = 1;
        if (total > TARGET_PIXELS) scale = Math.sqrt(TARGET_PIXELS / total);
        const sw = Math.max(1, Math.round(width * scale));
        const sh = Math.max(1, Math.round(height * scale));
        sourceCanvas = document.createElement('canvas');
        sourceCanvas.width = sw; sourceCanvas.height = sh;
        const sctx = sourceCanvas.getContext('2d');
        if (!sctx) return;
        sctx.drawImage(img, 0, 0, sw, sh);
      }
      const ctx = sourceCanvas.getContext('2d');
      if (!ctx) return;
      const data = ctx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height).data;
      const pixels: [number, number, number][] = [];
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 20) continue;
        pixels.push([data[i], data[i + 1], data[i + 2]]);
      }
      if (pixels.length < 2) return;
      interface Box { idxs: number[]; rMin: number; rMax: number; gMin: number; gMax: number; bMin: number; bMax: number; }
      const boxes: Box[] = [];
      const init: Box = { idxs: pixels.map((_, i) => i), rMin: 255, rMax: 0, gMin: 255, gMax: 0, bMin: 255, bMax: 0 };
      init.idxs.forEach(i => { const [r,g,b]=pixels[i]; if (r<init.rMin) init.rMin=r; if (r>init.rMax) init.rMax=r; if (g<init.gMin) init.gMin=g; if (g>init.gMax) init.gMax=g; if (b<init.bMin) init.bMin=b; if (b>init.bMax) init.bMax=b; });
      boxes.push(init);
      const range = (b: Box) => Math.max(b.rMax - b.rMin, b.gMax - b.gMin, b.bMax - b.bMin);
      while (boxes.length < MAX_COLORS) {
        let bi = -1, br = -1;
        for (let i = 0; i < boxes.length; i++) { const b = boxes[i]; if (b.idxs.length < 2) continue; const rr = range(b); if (rr > br) { br = rr; bi = i; } }
        if (bi === -1) break;
        const box = boxes.splice(bi,1)[0];
        const rSpan = box.rMax - box.rMin; const gSpan = box.gMax - box.gMin; const bSpan = box.bMax - box.bMin;
        let ch:0|1|2 = 0; if (gSpan >= rSpan && gSpan >= bSpan) ch = 1; else if (bSpan >= rSpan && bSpan >= gSpan) ch = 2;
        box.idxs.sort((a,b)=> pixels[a][ch]-pixels[b][ch]);
        const mid = Math.floor(box.idxs.length/2);
        const leftIdxs = box.idxs.slice(0, mid); const rightIdxs = box.idxs.slice(mid);
        const mkBox = (idxs:number[]):Box => { const b2:Box={ idxs, rMin:255,rMax:0,gMin:255,gMax:0,bMin:255,bMax:0}; idxs.forEach(i=>{ const [r,g,b]=pixels[i]; if(r<b2.rMin)b2.rMin=r; if(r>b2.rMax)b2.rMax=r; if(g<b2.gMin)b2.gMin=g; if(g>b2.gMax)b2.gMax=g; if(b<b2.bMin)b2.bMin=b; if(b>b2.bMax)b2.bMax=b; }); return b2; };
        boxes.push(mkBox(leftIdxs)); boxes.push(mkBox(rightIdxs));
      }
      const palette: [number, number, number][] = boxes.map(b=>{ let r=0,g=0,bv=0; b.idxs.forEach(i=>{ r+=pixels[i][0]; g+=pixels[i][1]; bv+=pixels[i][2]; }); const n=b.idxs.length||1; return [Math.round(r/n), Math.round(g/n), Math.round(bv/n)] as [number,number,number]; });
      palette.sort((a,b)=> 0.2126*a[0]+0.7152*a[1]+0.0722*a[2] - (0.2126*b[0]+0.7152*b[1]+0.0722*b[2]));
      if (palette.length >= 2) setActivePaletteColors(palette);
    } catch { }
  }, [image, videoCanvas, setActivePaletteColors]);

  useEffect(() => {
    if (paletteId === ORIGINAL_ID && (image || videoCanvas)) {
      extractOriginalFull();
    }
  }, [paletteId, image, videoCanvas, extractOriginalFull]);

  const reorder = (from: number, to: number) => {
    if (from === to) return;
    setActivePaletteColors((prev) => {
      if (!prev) return prev;
      if (from < 0 || from >= prev.length || to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  useEffect(() => {
    if (!binaryMode) return;
    if (paletteId === CUSTOM_ID) {
      setActivePaletteColors((prev) => {
        if (!prev || prev.length !== 2) return randomPair();
        return prev.slice(0, 2);
      });
    } else {
      if (activePaletteColors) setActivePaletteColors(null);
    }
  }, [binaryMode, paletteId, setActivePaletteColors]);

  if (binaryMode) {
    return (
      <div className="min-panel p-0">
        <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-3 text-left font-mono text-[11px] tracking-wide text-gray-300 hover:bg-neutral-800/40 focus-visible:shadow-[var(--focus-ring)]" aria-expanded={open}>
          <span className="flex items-center gap-2">
            <span>{open ? "▾" : "▸"}</span> {t('tool.palettePanel.title')}
          </span>
          {paletteId === CUSTOM_ID && <span className="badge">{t('tool.palettePanel.customPalette')}</span>}
        </button>
        {open && (
          <div className="space-y-2 border-t border-neutral-800 px-4 pt-3 pb-4">
            <div className="flex items-center justify-between">
              <label htmlFor="binary-palette-select" className="font-mono text-[11px] tracking-wide text-gray-300">
                {t('tool.palettePanel.select')}
              </label>
              {paletteId === CUSTOM_ID && (
                <button
                  className="clean-btn px-2 py-0 text-[10px]"
                  onClick={() => {
                    setPaletteId(null);
                  }}
                >
                  {t('tool.palettePanel.clear')}
                </button>
              )}
            </div>
            <select
              id="binary-palette-select"
              className="clean-input"
              value={paletteId ?? ""}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "") {
                  setPaletteId(null);
                  return;
                }
                if (v === CUSTOM_ID) {
                  setPaletteId(CUSTOM_ID);
                  return;
                }
              }}
            >
              <option value="">{t('tool.palettePanel.noPalette')}</option>
              <option value={CUSTOM_ID}>{t('tool.palettePanel.randomBinary')}</option>
            </select>
            {paletteId === CUSTOM_ID && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-1">
                  {activePaletteColors?.slice(0, 2).map((c, i) => (
                    <div key={i} className="relative h-6 w-6 rounded-sm border border-neutral-600" style={{ background: `rgb(${c[0]},${c[1]},${c[2]})` }}>
                      <input
                        type="color"
                        value={"#" + c.map((v) => v.toString(16).padStart(2, "0")).join("")}
                        onChange={(e) => {
                          const hex = e.target.value.slice(1);
                          const r = parseInt(hex.slice(0, 2), 16);
                          const g = parseInt(hex.slice(2, 4), 16);
                          const b = parseInt(hex.slice(4, 6), 16);
                          setActivePaletteColors((prev) => {
                            const base = prev && prev.length === 2 ? ([...prev] as [number, number, number][]) : randomPair();
                            base[i] = [r, g, b];
                            return base.slice(0, 2);
                          });
                        }}
                        className="absolute inset-0 cursor-pointer opacity-0"
                        aria-label={`Pick color ${i + 1}`}
                      />
                    </div>
                  ))}
                  <button type="button" onClick={() => setActivePaletteColors(randomPair())} className="relative h-6 w-6 cursor-pointer rounded-sm border border-neutral-600 text-[13px] font-semibold text-gray-300 transition hover:bg-neutral-800 hover:text-white focus-visible:shadow-[var(--focus-ring)]" title={t('tool.palettePanel.randomize')} aria-label={t('tool.palettePanel.randomize')}>
                    ↺
                  </button>
                </div>
                <p className="text-[10px] text-gray-500">{t('tool.palettePanel.editBinaryHint')}</p>
              </div>
            )}
            {paletteId !== CUSTOM_ID && <p className="mt-1 text-[10px] text-gray-500">{t('tool.palettePanel.defaultBW')}</p>}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-panel p-0">
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-3 text-left font-mono text-[11px] tracking-wide text-gray-300 hover:bg-neutral-800/40 focus-visible:shadow-[var(--focus-ring)]" aria-expanded={open}>
        <span className="flex items-center gap-2">
          <span>{open ? "▾" : "▸"}</span> {t('tool.palettePanel.title')}
        </span>
        {paletteId && <span className="badge ml-auto">{t('tool.palettePanel.active')}</span>}
      </button>
      {open && (
        <div className="space-y-2 border-t border-neutral-800 px-4 pt-3 pb-4">
          <div className="flex items-center justify-between">
            <label htmlFor="palette-select" className="font-mono text-[11px] tracking-wide text-gray-300">
              {t('tool.palettePanel.select')}
            </label>
            {paletteId && (
              <button
                className="clean-btn px-2 py-0 text-[10px]"
                onClick={() => {
                  setPaletteId(null);
                  setActivePaletteColors(null);
                  setAdding(false);
                  setInvalid(false);
                }}
              >
                {t('tool.palettePanel.clear')}
              </button>
            )}
          </div>
          <select
            id="palette-select"
            className="clean-input"
            value={paletteId ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              if (v === "") {
                setPaletteId(null);
                return;
              }
              if (v === CUSTOM_ID) {
                setPaletteId(CUSTOM_ID);
                setActivePaletteColors(randomPair());
                return;
              }
              if (v === ORIGINAL_ID) {
                setPaletteId(ORIGINAL_ID);
                setActivePaletteColors(null); // will be populated asynchronously
                return;
              }
              setPaletteId(v);
            }}
          >
            <option value="">{t('tool.palettePanel.noPalette')}</option>
            <option value={CUSTOM_ID}>{t('tool.palettePanel.customPalette')}…</option>
            <option value={ORIGINAL_ID}>{isVideoMode ? t('tool.palettePanel.originalVideo') : t('tool.palettePanel.originalImage')}</option>
            <option disabled>── {t('tool.palettePanel.presetPalettes')} ──</option>
            {predefinedPalettes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          {paletteId && paletteId !== ORIGINAL_ID && (
            <div className="mt-1 flex flex-wrap gap-1">
              {activePaletteColors &&
                activePaletteColors.map((c, i) => (
                  <div
                    key={i}
                    className="group relative h-6 w-6 rounded-sm border border-neutral-600"
                    style={{ background: `rgb(${c[0]},${c[1]},${c[2]})` }}
                    draggable={paletteId === CUSTOM_ID}
                    onDragStart={(e) => {
                      if (paletteId !== CUSTOM_ID) return;
                      dragFrom.current = i;
                      e.dataTransfer.effectAllowed = "move";
                    }}
                    onDragOver={(e) => {
                      if (paletteId !== CUSTOM_ID) return;
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                    }}
                    onDrop={(e) => {
                      if (paletteId !== CUSTOM_ID) return;
                      e.preventDefault();
                      if (dragFrom.current != null) reorder(dragFrom.current, i);
                      dragFrom.current = null;
                    }}
                    onDragEnd={() => {
                      dragFrom.current = null;
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (!activePaletteColors || activePaletteColors.length <= 2) return;
                        const next = activePaletteColors.filter((_, idx) => idx !== i);
                        setActivePaletteColors(next);
                      }}
                      className="absolute inset-0 flex items-center justify-center text-[13px] font-bold text-white opacity-0 transition group-hover:opacity-100 focus-visible:opacity-100"
                      title={t('tool.palettePanel.removeColor')}
                      aria-label={`${t('tool.palettePanel.removeColor')} rgb(${c[0]},${c[1]},${c[2]})`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              {paletteId !== CUSTOM_ID && paletteId !== ORIGINAL_ID && effectivePalette && (
                <button
                  type="button"
                  onClick={() => effectivePalette && setActivePaletteColors(effectivePalette.map((c) => [...c] as [number, number, number]))}
                  className="relative h-5 w-5 cursor-pointer rounded-sm border border-neutral-600 text-[11px] font-semibold text-gray-300 transition hover:bg-neutral-800 hover:text-white focus-visible:shadow-[var(--focus-ring)]"
                  title={t('tool.palettePanel.restoreFull')}
                  aria-label={t('tool.palettePanel.restoreFull')}
                >
                  ↺
                </button>
              )}
              {paletteId === CUSTOM_ID && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setAdding((a) => !a);
                      setInvalid(false);
                    }}
                    className="relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm border border-neutral-600 text-[18px] font-semibold text-gray-300 transition hover:bg-neutral-800 hover:text-white focus-visible:shadow-[var(--focus-ring)]"
                    title={t('tool.palettePanel.addColor')}
                    aria-label={t('tool.palettePanel.addColor')}
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePaletteColors(randomPair())}
                    className="relative flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm border border-neutral-600 text-[14px] font-semibold text-gray-300 transition hover:bg-neutral-800 hover:text-white focus-visible:shadow-[var(--focus-ring)]"
                    title={t('tool.palettePanel.randomize')}
                    aria-label={t('tool.palettePanel.randomize')}
                  >
                    ↺
                  </button>
                </>
              )}
            </div>
          )}
          {paletteId === CUSTOM_ID && adding && (
            <div className="mt-2 w-full space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newColor.startsWith("#") ? newColor : "#" + newColor}
                  onChange={(e) => {
                    setNewColor(e.target.value);
                    setInvalid(false);
                  }}
                  className="h-7 w-10 cursor-pointer rounded border border-neutral-700 bg-neutral-800"
                />
                <input
                  type="text"
                  value={newColor}
                  onChange={(e) => {
                    setNewColor(e.target.value);
                    setInvalid(false);
                  }}
                  className={`clean-input h-7 flex-1 !px-2 text-[11px] ${invalid ? "!border-red-600" : ""}`}
                  placeholder="#rrggbb | r,g,b | rgb(r,g,b)"
                />
                <button onClick={addColor} className="clean-btn px-2 py-1 text-[10px]">
                  {t('tool.palettePanel.add')}
                </button>
              </div>
              <p className="text-[10px] text-gray-500">{t('tool.palettePanel.formatHint')}</p>
            </div>
          )}
          {paletteId === CUSTOM_ID && !adding && <p className="mt-1 text-[10px] text-gray-500">{t('tool.palettePanel.dragHint')}</p>}
        </div>
      )}
    </div>
  );
};

export default PalettePanel;
