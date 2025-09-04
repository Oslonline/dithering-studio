import React from "react";
import { algorithms, getAlgorithmsByCategory } from "../utils/algorithms";
import { DEFAULT_ASCII_RAMP } from "../utils/algorithms/asciiMosaic";

export interface AlgorithmControlsProps {
  pattern: number;
  setPattern: (id: number) => void;
  threshold: number;
  setThreshold: (v: number) => void;
  invert: boolean;
  setInvert: (v: boolean | ((p: boolean) => boolean)) => void;
  serpentine: boolean;
  setSerpentine: (v: boolean | ((p: boolean) => boolean)) => void;
  paletteId: string | null;
  asciiRamp?: string;
  setAsciiRamp?: (v: string) => void;
  groupByCategory?: boolean;
}

export const AlgorithmControls: React.FC<AlgorithmControlsProps> = ({ pattern, setPattern, threshold, setThreshold, invert, setInvert, serpentine, setSerpentine, paletteId, asciiRamp, setAsciiRamp, groupByCategory }) => {
  const algo = algorithms.find((a) => a.id === pattern);
  const supportsThreshold = !!algo?.supportsThreshold;
  const isAscii = pattern === 25 || (algo?.name.toLowerCase().includes('ascii'));

  const renderOptions = () => {
    if (!groupByCategory) {
      return algorithms.map((a) => (
        <option key={a.id} value={a.id}>
          {a.name}
        </option>
      ));
    }
    const groups = getAlgorithmsByCategory();
    const order: ["Error Diffusion", "Ordered", "Other"] = ["Error Diffusion", "Ordered", "Other"];
    return order.map((cat) => {
      const list = groups[cat];
      if (!list) return null;
      return (
        <optgroup key={cat} label={cat === "Other" ? "Other / Experimental" : cat}>
          {list.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </optgroup>
      );
    });
  };

  return (
  <div className="space-y-3">
      <div>
        <label htmlFor="algo-select" className="sr-only">
          Algorithm
        </label>
        <select id="algo-select" className="clean-input" value={pattern} onChange={(e) => setPattern(Number(e.target.value))}>
          {renderOptions()}
        </select>
      </div>
      {supportsThreshold && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-wide text-gray-400">Threshold</span>
            <span className="text-[10px] text-gray-500">{threshold}</span>
          </div>
          <input type="range" min={0} max={255} value={threshold} className="clean-range" onChange={(e) => setThreshold(Number(e.target.value))} aria-label="Threshold" />
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        <button type="button" onClick={() => !paletteId && setInvert((v: boolean) => !v)} disabled={!!paletteId} className={`clean-btn justify-center text-[10px] ${invert ? "border-blue-600 text-blue-400" : ""} ${paletteId ? "cursor-not-allowed opacity-40" : ""}`}>
          Invert
        </button>
        <button type="button" onClick={() => setSerpentine((v: boolean) => !v)} className={`clean-btn justify-center text-[10px] ${serpentine ? "border-blue-600 text-blue-400" : ""}`}>
          Serpentine
        </button>
      </div>
      {isAscii && setAsciiRamp && (
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-wide text-gray-400">ASCII Ramp</span>
            <span className="text-[9px] text-gray-500">{(asciiRamp || DEFAULT_ASCII_RAMP).length} chars</span>
          </div>
          <input type="text" value={asciiRamp || DEFAULT_ASCII_RAMP} onChange={(e)=> { const v=e.target.value.replace(/\s/g,' ').slice(0,64); setAsciiRamp(v || DEFAULT_ASCII_RAMP); }} className="clean-input !px-2 !py-1 font-mono text-[11px]" aria-label="ASCII character ramp dark→light" />
          <p className="text-[9px] leading-snug text-gray-500">Dark→Light ordering. Space last. Max 64 chars.</p>
        </div>
      )}
      <p className="text-[10px] leading-snug text-gray-500">{algo?.name}</p>
    </div>
  );
};

export default AlgorithmControls;
