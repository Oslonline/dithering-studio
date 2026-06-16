"use client";

import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useParams } from '../lib/nextRouterCompat';
import Header from '../components/ui/Header';
import { getTranslatedAlgorithmDetails } from '../utils/algorithmInfoTranslated';
import { getOrderedAlgorithmDetails } from '../utils/algorithmInfo';
import { normalizeLang, withLangPrefix } from '../utils/localePath';
import { getAlgorithmIdFromSlug, getAlgorithmSlug } from '../utils/algorithmSlug';

const AlgorithmDetailPage: React.FC = () => {
  const { i18n, t } = useTranslation();
  const activeLang = normalizeLang(i18n.language);
  const { slug } = useParams<{ slug: string }>();

  const algorithmId = slug ? getAlgorithmIdFromSlug(slug) : undefined;

  const algorithm = useMemo(() => {
    if (!algorithmId) return undefined;
    const translated = getTranslatedAlgorithmDetails();
    const ordered = getOrderedAlgorithmDetails();
    return translated.find((a) => a.id === algorithmId) || ordered.find((a) => a.id === algorithmId);
  }, [algorithmId, i18n.language]);

  if (!slug || !algorithmId || !algorithm) {
    return <Navigate to={withLangPrefix('/Education/Algorithms', activeLang)} replace />;
  }

  const ordered = getOrderedAlgorithmDetails();
  const currentIdx = ordered.findIndex((a) => a.id === algorithm.id);
  const comparedWith =
    ordered.find((a, idx) => idx > currentIdx && a.category === algorithm.category && a.id !== algorithm.id) ||
    ordered.find((a) => a.category === algorithm.category && a.id !== algorithm.id);
  const comparedSlug = comparedWith ? getAlgorithmSlug(comparedWith.id) : undefined;

  const starterSettings = (() => {
    if (algorithm.category === 'Error Diffusion') {
      return [
        t('tool.threshold', { defaultValue: 'Threshold' }) + ': 120-140',
        t('tool.serpentine', { defaultValue: 'Serpentine' }) + `: ${t('explorer.yes', { defaultValue: 'Yes' })}`,
        t('tool.resolution', { defaultValue: 'Resolution' }) + ': 768-1280',
      ];
    }
    if (algorithm.category === 'Ordered') {
      return [
        t('tool.threshold', { defaultValue: 'Threshold' }) + ': 110-145',
        t('tool.resolution', { defaultValue: 'Resolution' }) + ': 512-1024',
        t('tool.palette', { defaultValue: 'Palette' }) + ': 4-16 colors',
      ];
    }
    return [
      t('tool.threshold', { defaultValue: 'Threshold' }) + ': 120-160',
      t('tool.resolution', { defaultValue: 'Resolution' }) + ': 512-1024',
      t('tool.contrast', { defaultValue: 'Contrast' }) + ': low to moderate',
    ];
  })();

  const avoidCases = (() => {
    if (algorithm.category === 'Error Diffusion') {
      return [
        'UI icons or geometric assets where deterministic repeating structure is preferred.',
        'Very low-power preview contexts where larger kernels can be too expensive.',
      ];
    }
    if (algorithm.category === 'Ordered') {
      return [
        'Natural photos where repeating matrix patterns are undesirable.',
        'Large smooth gradients where low-frequency tiling becomes visible.',
      ];
    }
    return [
      'Production-critical outputs requiring fully predictable tonal behavior.',
      'Cases where preserving subtle gradients is more important than stylization.',
    ];
  })();

  return (
    <>
      <div className="flex h-screen w-full flex-col overflow-hidden">
        <Header activeNav="algorithms" />
        <main id="main-content" className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto w-full max-w-4xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <Link
                to={withLangPrefix('/Education/Algorithms', activeLang)}
                className="clean-btn px-3 py-2 text-[11px]"
              >
                {t('explorer.backToList', { defaultValue: 'Back to algorithms' })}
              </Link>
              <Link
                to={withLangPrefix('/Dithering/Image', activeLang)}
                className="clean-btn clean-btn-primary px-3 py-2 text-[11px]"
              >
                {t('tool.tryOnline', { defaultValue: 'Try in the tool' })}
              </Link>
            </div>

            <h1 className="font-anton text-3xl leading-tight text-gray-100">{algorithm.name}</h1>
            {algorithm.technicalSummary && (
              <p className="mt-3 text-[13px] leading-relaxed text-gray-300">{algorithm.technicalSummary}</p>
            )}
            {algorithm.overview && (
              <p className="mt-2 text-[12px] text-gray-400">{algorithm.overview}</p>
            )}

            <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px] text-gray-500">
              {algorithm.year && <span className="rounded border border-neutral-800 px-2 py-0.5">{t('explorer.year')}: {algorithm.year}</span>}
              {algorithm.origin && <span className="rounded border border-neutral-800 px-2 py-0.5">{t('explorer.origin')}: {algorithm.origin}</span>}
              {typeof algorithm.errorConserving === 'boolean' && (
                <span className="rounded border border-neutral-800 px-2 py-0.5">{t('explorer.errorConserving')}: {algorithm.errorConserving ? t('explorer.yes') : t('explorer.no')}</span>
              )}
              {typeof algorithm.deterministic === 'boolean' && (
                <span className="rounded border border-neutral-800 px-2 py-0.5">{t('explorer.deterministic')}: {algorithm.deterministic ? t('explorer.yes') : t('explorer.no')}</span>
              )}
              {algorithm.neighborhood && <span className="rounded border border-neutral-800 px-2 py-0.5">{t('explorer.neighborhood')}: {algorithm.neighborhood}</span>}
              {algorithm.memoryFootprint && <span className="rounded border border-neutral-800 px-2 py-0.5">{t('explorer.memory')}: {algorithm.memoryFootprint}</span>}
            </div>

            {algorithm.kernel && (
              <section className="mt-8">
                <h2 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">{t('explorer.structure')}</h2>
                <pre className="overflow-x-auto rounded bg-neutral-900 p-3 text-[10px] leading-tight text-gray-300">{algorithm.kernel.map((r) => r.join('\t')).join('\n')}</pre>
                {algorithm.kernelDivisor && <p className="mt-1 text-[10px] text-gray-500">{t('explorer.divisor')}: {algorithm.kernelDivisor}</p>}
              </section>
            )}

            <section className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">{t('explorer.characteristics')}</h2>
                <ul className="list-disc space-y-1 pl-4 text-[12px] text-gray-300">
                  {(algorithm.characteristics || []).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">{t('explorer.artifacts')}</h2>
                <ul className="list-disc space-y-1 pl-4 text-[12px] text-gray-300">
                  {(algorithm.artifacts || []).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">{t('explorer.bestFor')}</h2>
                <ul className="list-disc space-y-1 pl-4 text-[12px] text-gray-300">
                  {(algorithm.bestFor || []).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">{t('explorer.complexity')}</h2>
                <p className="text-[12px] text-gray-300">{algorithm.complexity}</p>
              </div>
            </section>

            <section className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <h2 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">
                  {t('education.practice.workflow.step2.title', { defaultValue: 'Start settings' })}
                </h2>
                <ul className="list-disc space-y-1 pl-4 text-[12px] text-gray-300">
                  {starterSettings.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
                <div className="mt-3">
                  <Link
                    to={`${withLangPrefix('/Dithering/Image', activeLang)}?p=${algorithm.id}&t=128&r=1024&ser=1`}
                    className="clean-btn clean-btn-primary px-3 py-2 text-[11px]"
                  >
                    {t('tool.tryOnline', { defaultValue: 'Try in the tool' })}
                  </Link>
                </div>
              </div>

              <div>
                <h2 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">
                  {t('education.when.avoid.title', { defaultValue: 'When to avoid' })}
                </h2>
                <ul className="list-disc space-y-1 pl-4 text-[12px] text-gray-300">
                  {avoidCases.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            {comparedWith && comparedSlug && (
              <section className="mt-8">
                <h2 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">
                  {t('education.practice.controls.algorithm', { defaultValue: 'Compared with' })}
                </h2>
                <p className="text-[12px] text-gray-300">
                  {algorithm.name} vs {comparedWith.name}: compare texture, artifact profile, and complexity for the same source media.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    to={withLangPrefix(`/Education/Algorithms/${comparedSlug}`, activeLang)}
                    className="clean-btn px-3 py-2 text-[11px]"
                  >
                    {t('explorer.viewDetails', { defaultValue: 'View {{name}} details', name: comparedWith.name })}
                  </Link>
                  <Link
                    to={`${withLangPrefix('/Dithering/Image', activeLang)}?p=${comparedWith.id}&t=128&r=1024&ser=1`}
                    className="clean-btn px-3 py-2 text-[11px]"
                  >
                    {t('tool.tryOnline', { defaultValue: 'Try in the tool' })} ({comparedWith.name})
                  </Link>
                </div>
              </section>
            )}

            {algorithm.papers && algorithm.papers.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">{t('explorer.references')}</h2>
                <div className="flex flex-wrap gap-2 text-[11px]">
                  {algorithm.papers.map((p, i) => (
                    <a
                      key={i}
                      href={p.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded border border-neutral-800 px-2 py-1 text-blue-300 transition hover:border-blue-600 hover:text-blue-200"
                    >
                      {p.title}
                      {p.note && <span className="text-gray-500">({p.note})</span>}
                    </a>
                  ))}
                </div>
              </section>
            )}

            {algorithm.notes && algorithm.notes.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-2 font-mono text-[11px] tracking-wide text-gray-400 uppercase">{t('explorer.additionalNotes')}</h2>
                <ul className="list-disc space-y-1 pl-4 text-[12px] text-gray-300">
                  {algorithm.notes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default AlgorithmDetailPage;
