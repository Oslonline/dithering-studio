import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link, Navigate, useParams } from 'react-router-dom';
import Header from '../components/ui/Header';
import { getTranslatedAlgorithmDetails } from '../utils/algorithmInfoTranslated';
import { getOrderedAlgorithmDetails } from '../utils/algorithmInfo';
import { generateHreflangTags, getCanonicalUrlWithLang, getOgUrl, getSocialImageUrl } from '../utils/seo';
import { normalizeLang, withLangPrefix } from '../utils/localePath';
import { getAlgorithmIdFromSlug } from '../utils/algorithmSlug';

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

  const pagePath = `/Education/Algorithms/${slug}`;
  const title = `${algorithm.name} — ${t('explorer.seo.title')}`;
  const description = algorithm.overview || t('explorer.seo.description');

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: getCanonicalUrlWithLang('/', i18n.language)
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t('nav.education', { defaultValue: 'Education' }),
        item: getCanonicalUrlWithLang('/Education', i18n.language)
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: t('explorer.seo.title'),
        item: getCanonicalUrlWithLang('/Education/Algorithms', i18n.language)
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: algorithm.name,
        item: getCanonicalUrlWithLang(pagePath, i18n.language)
      }
    ]
  };

  return (
    <>
      <Helmet>
        <html lang={i18n.language} />
        <title>{title}</title>
        <meta name="description" content={description} />

        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={getOgUrl(pagePath, i18n.language)} />
        <meta property="og:image" content={getSocialImageUrl()} />
        <meta property="og:locale" content={i18n.language} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={getSocialImageUrl()} />

        <link rel="canonical" href={getCanonicalUrlWithLang(pagePath, i18n.language)} />
        {generateHreflangTags(pagePath)}

        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <div className="flex h-screen w-full flex-col overflow-hidden">
        <Header page="explorer" />
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
            {algorithm.overview && <p className="mt-2 text-[12px] text-gray-400">{algorithm.overview}</p>}

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
