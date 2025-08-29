import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { algorithmDetails, AlgorithmDetail } from "../utils/algorithmInfo";
import PatternDrawer from "../components/PatternDrawer";
import floydSteinberg from "../utils/floydSteinberg";

let importedSample: string | undefined;
try {
  // @ts-ignore - optional asset
  importedSample = (await import("../assets/base-sample.webp")).default as string;
} catch {}

const SAMPLE_IMAGE_SRC = importedSample || "/base-sample.webp";
const WORKING_WIDTH = 256;
const THRESHOLD = 128;

interface ExampleSet {
  dithered?: string;
  error?: boolean;
}

const AlgorithmCard: React.FC<{ algo: AlgorithmDetail; active: boolean; onSelect: () => void }> = ({ algo, active, onSelect }) => (
  <button onClick={onSelect} className={`w-full rounded-md border px-3 py-2 text-left transition hover:border-blue-600 hover:bg-neutral-900/40 ${active ? "border-blue-600 bg-neutral-900/60" : "border-neutral-800 bg-neutral-900/20"}`}>
    <div className="flex items-center justify-between">
      <span className="font-mono text-[11px] tracking-wide text-gray-200">{algo.name}</span>
      <span className="badge !text-[9px]">{algo.category}</span>
    </div>
    <p className="mt-1 line-clamp-2 text-[10px] leading-snug text-gray-400">{algo.overview}</p>
  </button>
);

const AlgorithmExplorer: React.FC = () => {
  const [activeId, setActiveId] = useState<number>(algorithmDetails[0]?.id ?? 1);
  const active = algorithmDetails.find((a) => a.id === activeId) || algorithmDetails[0];
  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const [baseLoaded, setBaseLoaded] = useState(false);
  const [examples, setExamples] = useState<Record<number, ExampleSet>>({});
  const [basePreview, setBasePreview] = useState<string | null>(null);

  const synthesizeBase = () => {
    const w = WORKING_WIDTH;
    const h = Math.round((WORKING_WIDTH * 3) / 4);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const grd = ctx.createLinearGradient(0, 0, w, h);
    grd.addColorStop(0, "#000");
    grd.addColorStop(1, "#fff");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
  const rg = ctx.createRadialGradient(w * 0.7, h * 0.3, 10, w * 0.7, h * 0.3, w * 0.8);
    rg.addColorStop(0, "rgba(255,255,255,0.6)");
    rg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, w, h);
    const id = ctx.getImageData(0, 0, w, h);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = Math.random() * 40 - 20;
      d[i] = Math.min(255, Math.max(0, d[i] + n));
      d[i + 1] = Math.min(255, Math.max(0, d[i + 1] + n));
      d[i + 2] = Math.min(255, Math.max(0, d[i + 2] + n));
    }
    ctx.putImageData(id, 0, 0);
    const img = new Image();
    img.src = c.toDataURL("image/webp");
    baseImgRef.current = img;
    setBaseLoaded(true);
  };

  useEffect(() => {
    const img = new Image();
    img.src = SAMPLE_IMAGE_SRC;
    img.onload = () => {
      baseImgRef.current = img;
      setBaseLoaded(true);
    };
    img.onerror = () => {
      synthesizeBase();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!baseLoaded || !baseImgRef.current) return;
    const img = baseImgRef.current;
    const aspect = img.height / img.width;
    const w = Math.min(WORKING_WIDTH, img.width);
    const h = Math.round(w * aspect);
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const ctx = off.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, w, h);
    const baseImageData = ctx.getImageData(0, 0, w, h);
    const srcData = baseImageData.data;

    const baseCanvas = document.createElement("canvas");
    baseCanvas.width = w;
    baseCanvas.height = h;
    const bctx = baseCanvas.getContext("2d");
    if (bctx) {
      bctx.putImageData(baseImageData, 0, 0);
      setBasePreview(baseCanvas.toDataURL("image/webp"));
    }

    const makeImageFromData = (data: Uint8ClampedArray, w: number, h: number) => {
      const c = document.createElement("canvas");
      c.width = w;
      c.height = h;
      const cctx = c.getContext("2d");
      if (!cctx) return "";
      const id = new ImageData(new Uint8ClampedArray(data), w, h);
      cctx.putImageData(id, 0, 0);
      return c.toDataURL("image/webp");
    };

  const processAlgo = (patternId: number, threshold: number): string => {
      if (patternId === 1) {
        const out = floydSteinberg({ data: srcData, width: w, height: h, threshold, invert: false, serpentine: true });
        return makeImageFromData(out, w, h);
      }
      const imgData = PatternDrawer(srcData, w, h, patternId, threshold, { invert: false, serpentine: true });
      return makeImageFromData(imgData.data, w, h);
    };

    const newExamples: Record<number, ExampleSet> = {};
    for (const a of algorithmDetails) {
      try {
        const dithered = processAlgo(a.id, THRESHOLD);
        newExamples[a.id] = { dithered };
      } catch (e) {
        newExamples[a.id] = { error: true } as ExampleSet;
      }
    }
    setExamples(newExamples);
  }, [baseLoaded]);
  return (
    <div className="flex h-screen w-full flex-col overflow-hidden">
      <header className="flex flex-shrink-0 items-center justify-between border-b border-neutral-900 bg-[#0b0b0b] px-4 py-3">
        <div className="flex items-center gap-4">
          <h1 className="font-mono text-xs tracking-wide text-gray-300">Algorithms</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/Dithering" className="clean-btn px-3 py-1 !text-[11px]">Tool</Link>
          <Link to="/" className="clean-btn px-3 py-1 !text-[11px]">Home</Link>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden md:flex-row flex-col">
        <aside className="flex w-full flex-shrink-0 flex-col border-b border-neutral-800 bg-[#0d0d0d] md:w-80 md:border-b-0 md:border-r md:h-full">
          <div className="flex-1 space-y-2 overflow-y-auto px-4 pt-4 pb-4">
          {algorithmDetails.map((a) => (
            <AlgorithmCard key={a.id} algo={a} active={a.id === activeId} onSelect={() => setActiveId(a.id)} />
          ))}
          </div>
          <div className="space-y-1 p-4 pt-2 pb-6 text-[10px] text-gray-500 border-t border-neutral-800">
            <p>
              Examples generated live from one sample ({WORKING_WIDTH}px width) at fixed threshold {THRESHOLD}.
            </p>
          </div>
        </aside>
        <main className="relative flex flex-1 flex-col overflow-y-auto p-6">
        <div className="mx-auto w-full max-w-4xl">
          <div className="mb-6">
            <h2 className="font-anton text-2xl leading-tight text-gray-100">{active.name}</h2>
            <p className="mt-1 text-[11px] text-gray-400">{active.overview}</p>
          </div>
          <section className="mb-8 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">Characteristics</h3>
              <ul className="list-disc space-y-1 pl-4 text-[11px] text-gray-300">
                {active.characteristics.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">Artifacts</h3>
              <ul className="list-disc space-y-1 pl-4 text-[11px] text-gray-300">
                {active.artifacts.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">Best For</h3>
              <ul className="list-disc space-y-1 pl-4 text-[11px] text-gray-300">
                {active.bestFor.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">Complexity</h3>
              <p className="text-[11px] text-gray-300">{active.complexity}</p>
              {active.reference && <p className="mt-2 text-[10px] text-gray-500">Reference: {active.reference}</p>}
            </div>
          </section>
          {(active.kernel || active.orderedMatrixSize) && (
            <section className="mb-8">
              <h3 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">Structure</h3>
              {active.kernel && (
                <div className="mb-3">
                  <pre className="overflow-x-auto rounded bg-neutral-900 p-3 text-[10px] leading-tight text-gray-300">{active.kernel.map((r) => r.join("\t")).join("\n")}</pre>
                  {active.kernelDivisor && <p className="mt-1 text-[10px] text-gray-500">Divisor: {active.kernelDivisor}</p>}
                </div>
              )}
              {active.orderedMatrixSize && <p className="text-[11px] text-gray-300">Ordered matrix size: {active.orderedMatrixSize}</p>}
            </section>
          )}
          <section className="mb-10">
            <h3 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">Example (Threshold {THRESHOLD})</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {(() => {
                const ex = examples[active.id];
                if (!baseLoaded) return <div className="col-span-2 text-center text-[11px] text-gray-500">Loading sample...</div>;
                if (!ex) return <div className="col-span-2 text-center text-[11px] text-gray-500">Generating...</div>;
                if (ex.error) return <div className="col-span-2 text-center text-[11px] text-red-500">Generation error.</div>;
                return [
                  <div key="base" className="rounded-md border border-neutral-800 bg-neutral-950 p-2">
                    <p className="mb-1 text-center text-[10px] text-gray-400">Base Sample</p>
                    {basePreview && <img src={basePreview} alt="base sample" className="mx-auto block max-w-full" />}
                  </div>,
                  <div key="dith" className="rounded-md border border-neutral-800 bg-neutral-950 p-2">
                    <p className="mb-1 text-center text-[10px] text-gray-400">{active.name}</p>
                    <img src={ex.dithered} alt="dithered example" className="mx-auto block max-w-full" />
                  </div>,
                ];
              })()}
            </div>
            <p className="mt-3 text-[10px] leading-relaxed text-gray-500">All algorithms run on the same downscaled sample (width {WORKING_WIDTH}px) without inversion or palettes for a neutral comparison.</p>
          </section>
          {active && (active as any).notes && (
            <section className="mb-12">
              <h3 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">Additional Notes</h3>
              <ul className="list-disc space-y-1 pl-4 text-[11px] text-gray-300">
                {(active as any).notes.map((n: string, i: number) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
        </main>
      </div>
    </div>
  );
};

export default AlgorithmExplorer;
