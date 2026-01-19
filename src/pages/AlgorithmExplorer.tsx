import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";
import { useLocation, useNavigate } from "react-router-dom";
import { AlgorithmDetail, getOrderedAlgorithmDetails } from "../utils/algorithmInfo";
import { getTranslatedAlgorithmDetails } from "../utils/algorithmInfoTranslated";
import { findAlgorithm } from "../utils/algorithms";
import { generateHreflangTags, generateOpenGraphLocaleAlternates, getCanonicalUrlWithLang, getOgUrl, getOpenGraphLocale, getSocialImageUrl } from "../utils/seo";
import Header from "../components/ui/Header";
import SAMPLE_IMAGE_SRC from "../assets/base-sample.webp";
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
  const { t, i18n } = useTranslation();
  const orderedDetails = getOrderedAlgorithmDetails();
  const [translatedDetails, setTranslatedDetails] = useState<AlgorithmDetail[]>([]);
  
  useEffect(() => {
    setTranslatedDetails(getTranslatedAlgorithmDetails());
  }, [i18n.language]);
  
  const location = useLocation();
  const navigate = useNavigate();
  const initialHadAlgoParamRef = useRef<boolean>(new URLSearchParams(location.search).has("algo"));
  const userInteractedRef = useRef<boolean>(false);
  // Parse query param for deep link (?algo=ID)
  const searchParams = new URLSearchParams(location.search);
  const initialParam = parseInt(searchParams.get("algo") || "", 10);
  const initial = orderedDetails.some((a) => a.id === initialParam) ? initialParam : (orderedDetails[0]?.id ?? 1);
  const [activeId, setActiveId] = useState<number>(initial);
  // Keep the URL in sync with the selected algorithm (replace to avoid adding a history entry per click)
  useEffect(() => {
    if (!initialHadAlgoParamRef.current && !userInteractedRef.current) return;
    const sp = new URLSearchParams(location.search);
    const current = sp.get("algo");
    if (String(activeId) !== current) {
      sp.set("algo", String(activeId));
      navigate({ pathname: location.pathname, search: sp.toString() }, { replace: true });
    }
  }, [activeId]);

  const shouldNoindex = new URLSearchParams(location.search).has("algo");
  
  const active = translatedDetails.find((a) => a.id === activeId) || translatedDetails[0] || orderedDetails[0];
  
  const baseImgRef = useRef<HTMLImageElement | null>(null);
  const baseWorkRef = useRef<{ width: number; height: number; srcData: Uint8ClampedArray } | null>(null);
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
    baseWorkRef.current = {
      width: w,
      height: h,
      // Copy because algorithms may mutate srcData in-place.
      srcData: new Uint8ClampedArray(baseImageData.data),
    };

    const baseCanvas = document.createElement("canvas");
    baseCanvas.width = w;
    baseCanvas.height = h;
    const bctx = baseCanvas.getContext("2d");
    if (bctx) {
      bctx.putImageData(baseImageData, 0, 0);
      setBasePreview(baseCanvas.toDataURL("image/webp"));
    }

    // Reset examples when the base sample changes.
    setExamples({});
  }, [baseLoaded]);

  // Generate only the active algorithm preview (lazy + cached) to keep navigation fast.
  useEffect(() => {
    if (!baseLoaded) return;
    if (!active?.id) return;
    if (examples[active.id]?.dithered || examples[active.id]?.error) return;
    if (!baseWorkRef.current) return;

    let cancelled = false;
    const { width, height, srcData } = baseWorkRef.current;

    const makeImageFromData = (data: Uint8ClampedArray) => {
      const c = document.createElement("canvas");
      c.width = width;
      c.height = height;
      const cctx = c.getContext("2d");
      if (!cctx) return "";
      const id = new ImageData(new Uint8ClampedArray(data), width, height);
      cctx.putImageData(id, 0, 0);
      return c.toDataURL("image/webp");
    };

    const run = () => {
      try {
        const algo = findAlgorithm(active.id);
        if (!algo) {
          const fallback = makeImageFromData(srcData);
          if (!cancelled) setExamples((prev) => ({ ...prev, [active.id]: { dithered: fallback } }));
          return;
        }

        const workingSrc = new Uint8ClampedArray(srcData);
        const out = algo.run({
          srcData: workingSrc,
          width,
          height,
          params: {
            pattern: active.id,
            threshold: THRESHOLD,
            invert: false,
            serpentine: true,
            isErrorDiffusion: true,
          } as any,
        });

        const url = out instanceof ImageData ? makeImageFromData(out.data) : makeImageFromData(out);
        if (!cancelled) setExamples((prev) => ({ ...prev, [active.id]: { dithered: url } }));
      } catch {
        if (!cancelled) setExamples((prev) => ({ ...prev, [active.id]: { error: true } }));
      }
    };

    // Defer heavy work to idle time when possible.
    const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void) => number);
    const cancelRic = (window as any).cancelIdleCallback as undefined | ((id: number) => void);
    let idleId: number | null = null;
    if (ric) {
      idleId = ric(run);
    } else {
      setTimeout(run, 0);
    }

    return () => {
      cancelled = true;
      if (idleId != null && cancelRic) cancelRic(idleId);
    };
  }, [baseLoaded, active?.id, examples]);
  return (
    <>
      <Helmet>
        <html lang={i18n.language} />
        <title>{t('explorer.seo.title')}</title>
        <meta name="description" content={t('explorer.seo.description')} />
        {shouldNoindex && <meta name="robots" content="noindex,follow" />}
        <meta property="og:title" content={t('explorer.seo.title')} />
        <meta property="og:description" content={t('explorer.seo.description')} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getOgUrl('/Education/Algorithms', i18n.language)} />
        <meta property="og:image" content={getSocialImageUrl()} />
        <meta property="og:locale" content={getOpenGraphLocale(i18n.language)} />
        {generateOpenGraphLocaleAlternates(i18n.language)}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={t('explorer.seo.title')} />
        <meta name="twitter:description" content={t('explorer.seo.description')} />
        <meta name="twitter:image" content={getSocialImageUrl()} />
        <link rel="canonical" href={getCanonicalUrlWithLang('/Education/Algorithms', i18n.language)} />
        {generateHreflangTags('/Education/Algorithms')}
      </Helmet>
      <div className="flex h-screen w-full flex-col overflow-hidden">
      <Header page="explorer" />
      <div id="main-content" className="flex flex-1 flex-col overflow-hidden md:flex-row">
        <aside className="flex w-full flex-shrink-0 flex-col border-b border-neutral-800 bg-[#0d0d0d] md:h-full md:w-80 md:border-r md:border-b-0">
          <div className="flex-1 space-y-2 overflow-y-auto px-4 pt-4 pb-4">
            {orderedDetails.map((a) => {
              const translated = translatedDetails.find(t => t.id === a.id) || a;
              return (
                <AlgorithmCard
                  key={a.id}
                  algo={translated}
                  active={a.id === activeId}
                  onSelect={() => {
                    userInteractedRef.current = true;
                    setActiveId(a.id);
                  }}
                />
              );
            })}
          </div>
          <div className="space-y-1 border-t border-neutral-800 p-4 pt-2 pb-6 text-[10px] text-gray-500">
            <p>
              {t('explorer.exampleNote', { width: WORKING_WIDTH, threshold: THRESHOLD })}
            </p>
          </div>
        </aside>
        <main className="relative flex flex-1 flex-col overflow-y-auto p-6">
          <div className="w-full max-w-6xl">
            <div className="mb-6 pr-4">
              <h2 className="font-anton text-2xl leading-tight text-gray-100">{active.name}</h2>
              <p className="mt-1 text-[11px] text-gray-400">{active.overview}</p>
              <div className="mt-2 flex flex-wrap gap-2 font-mono text-[10px] text-gray-500">
                {active.year && <span className="rounded border border-neutral-800 px-2 py-0.5">{t('explorer.year')}: {active.year}</span>}
                {active.origin && <span className="rounded border border-neutral-800 px-2 py-0.5">{t('explorer.origin')}: {active.origin}</span>}
                {typeof active.errorConserving === "boolean" && <span className="rounded border border-neutral-800 px-2 py-0.5">{t('explorer.errorConserving')}: {active.errorConserving ? t('explorer.yes') : t('explorer.no')}</span>}
                {typeof active.deterministic === "boolean" && <span className="rounded border border-neutral-800 px-2 py-0.5">{t('explorer.deterministic')}: {active.deterministic ? t('explorer.yes') : t('explorer.no')}</span>}
                {active.neighborhood && <span className="rounded border border-neutral-800 px-2 py-0.5">{t('explorer.neighborhood')}: {active.neighborhood}</span>}
                {active.memoryFootprint && <span className="rounded border border-neutral-800 px-2 py-0.5">{t('explorer.memory')}: {active.memoryFootprint}</span>}
              </div>
              {active.papers && active.papers.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                  {active.papers.map((p, i) => (
                    <a key={i} href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded border border-neutral-800 px-2 py-0.5 text-blue-300 transition hover:border-blue-600 hover:text-blue-200">
                      <span className="i-mdi-file-document-outline text-[12px]" />
                      {p.title}
                      {p.note && <span className="text-gray-500">({p.note})</span>}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <section className="mb-8 grid gap-6 pr-4 md:grid-cols-2 xl:grid-cols-3">
              <div>
                <h3 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">{t('explorer.characteristics')}</h3>
                <ul className="list-disc space-y-1 pl-4 text-[11px] text-gray-300">
                  {active.characteristics.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">{t('explorer.artifacts')}</h3>
                <ul className="list-disc space-y-1 pl-4 text-[11px] text-gray-300">
                  {active.artifacts.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">{t('explorer.bestFor')}</h3>
                <ul className="list-disc space-y-1 pl-4 text-[11px] text-gray-300">
                  {active.bestFor.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">{t('explorer.complexity')}</h3>
                  <p className="text-[11px] text-gray-300">{active.complexity}</p>
                </div>
                {(active.tonalBias || active.noiseProfile) && (
                  <div>
                    <h3 className="mb-1 font-mono text-[11px] tracking-wide text-gray-400 uppercase">{t('explorer.behavioralNotes')}</h3>
                    <ul className="list-disc space-y-1 pl-4 text-[11px] text-gray-300">
                      {active.tonalBias && <li>{t('explorer.tonalBias')}: {active.tonalBias}</li>}
                      {active.noiseProfile && <li>{t('explorer.noiseProfile')}: {active.noiseProfile}</li>}
                    </ul>
                  </div>
                )}
                {active.recommendedPalettes && active.recommendedPalettes.length > 0 && (
                  <div>
                    <h3 className="mb-1 font-mono text-[11px] tracking-wide text-gray-400 uppercase">{t('explorer.recommendedPalettes')}</h3>
                    <p className="text-[11px] text-gray-300">{active.recommendedPalettes.join(", ")}</p>
                  </div>
                )}
                {(active.reference || (active.references && active.references.length)) && (
                  <div>
                    <h3 className="mb-1 font-mono text-[11px] tracking-wide text-gray-400 uppercase">{t('explorer.references')}</h3>
                    <ul className="list-disc space-y-1 pl-4 text-[10px] text-gray-500">
                      {active.reference && <li>{active.reference}</li>}
                      {active.references && active.references.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </section>
            {(active.kernel || active.orderedMatrixSize || active.implementationNotes) && (
              <section className="mb-8">
                <h3 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">{t('explorer.structure')}</h3>
                {active.kernel && (
                  <div className="mb-3">
                    <pre className="overflow-x-auto rounded bg-neutral-900 p-3 text-[10px] leading-tight text-gray-300">{active.kernel.map((r) => r.join("\t")).join("\n")}</pre>
                    {active.kernelDivisor && <p className="mt-1 text-[10px] text-gray-500">{t('explorer.divisor')}: {active.kernelDivisor}</p>}
                  </div>
                )}
                {active.orderedMatrixSize && <p className="text-[11px] text-gray-300">{t('explorer.orderedMatrixSize')}: {active.orderedMatrixSize}</p>}
                {active.implementationNotes && active.implementationNotes.length > 0 && (
                  <div className="mt-3">
                    <h4 className="mb-1 font-mono text-[10px] tracking-wide text-gray-500 uppercase">{t('explorer.implementationNotes')}</h4>
                    <ul className="list-disc space-y-1 pl-4 text-[10px] text-gray-400">
                      {active.implementationNotes.map((n, i) => (
                        <li key={i}>{n}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}
            <section className="mb-10">
              <h3 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">{t('explorer.exampleThreshold', { threshold: THRESHOLD })}</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {(() => {
                  const ex = examples[active.id];
                  if (!baseLoaded) return <div className="col-span-2 text-center text-[11px] text-gray-500">{t('explorer.loadingSample')}</div>;
                  if (!ex) return <div className="col-span-2 text-center text-[11px] text-gray-500">{t('explorer.generating')}</div>;
                  if (ex.error) return <div className="col-span-2 text-center text-[11px] text-red-500">{t('explorer.generationError')}</div>;
                  return [
                    <div key="base" className="rounded-md border border-neutral-800 bg-neutral-950 p-2">
                      <p className="mb-1 text-center text-[10px] text-gray-400">{t('explorer.baseSample')}</p>
                      {basePreview && <img src={basePreview} alt={t('explorer.baseSample')} className="mx-auto block max-w-full" />}
                    </div>,
                    <div key="dith" className="rounded-md border border-neutral-800 bg-neutral-950 p-2">
                      <p className="mb-1 text-center text-[10px] text-gray-400">{active.name}</p>
                      <img src={ex.dithered} alt={`${active.name} ${t('explorer.ditherExample')}`} className="mx-auto block max-w-full" />
                    </div>,
                  ];
                })()}
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-gray-500">{t('explorer.neutralComparison', { width: WORKING_WIDTH })}</p>
            </section>
            {active && active.notes && (
              <section className="mb-12">
                <h3 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">{t('explorer.additionalNotes')}</h3>
                <ul className="list-disc space-y-1 pl-4 text-[11px] text-gray-300">
                  {active.notes.map((n: string, i: number) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </main>
      </div>
      </div>
    </>
  );
};

export default AlgorithmExplorer;
