import i18n from '../i18n';
import { AlgorithmDetail, getOrderedAlgorithmDetails } from './algorithmInfo';

/**
 * Get translated algorithm details
 * This function returns algorithm details with all translatable strings converted
 * to the current language using i18n
 */
export function getTranslatedAlgorithmDetails(): AlgorithmDetail[] {
  const t = i18n.t.bind(i18n);

  return getOrderedAlgorithmDetails().map(algo => ({
    ...algo,
    // Translate category
    category: t(`algoData.categories.${algo.category.toLowerCase().replace(/\s+/g, '')}`, { defaultValue: algo.category }),
    // Translate overview
    overview: t(`algoData.${algo.id}.overview`, { defaultValue: algo.overview }),
    // Translate characteristics array
    characteristics: algo.characteristics.map((_, idx) => 
      t(`algoData.${algo.id}.characteristics.${idx}`, { defaultValue: algo.characteristics[idx] })
    ),
    // Translate artifacts array
    artifacts: algo.artifacts.map((_, idx) => 
      t(`algoData.${algo.id}.artifacts.${idx}`, { defaultValue: algo.artifacts[idx] })
    ),
    // Translate bestFor array
    bestFor: algo.bestFor.map((_, idx) => 
      t(`algoData.${algo.id}.bestFor.${idx}`, { defaultValue: algo.bestFor[idx] })
    ),
    // Translate complexity
    complexity: t(`algoData.complexities.${algo.complexity.toLowerCase().replace(/[^a-z0-9]/g, '')}`, { defaultValue: algo.complexity }),
    // Translate optional fields
    ...(algo.reference && { reference: t(`algoData.${algo.id}.reference`, { defaultValue: algo.reference }) }),
    ...(algo.origin && { origin: t(`algoData.origins.${algo.origin.toLowerCase().replace(/[^a-z0-9]/g, '')}`, { defaultValue: algo.origin }) }),
    ...(algo.neighborhood && { neighborhood: t(`algoData.${algo.id}.neighborhood`, { defaultValue: algo.neighborhood }) }),
    ...(algo.tonalBias && { tonalBias: t(`algoData.${algo.id}.tonalBias`, { defaultValue: algo.tonalBias }) }),
    ...(algo.noiseProfile && { noiseProfile: t(`algoData.${algo.id}.noiseProfile`, { defaultValue: algo.noiseProfile }) }),
    ...(algo.memoryFootprint && { memoryFootprint: t(`algoData.${algo.id}.memoryFootprint`, { defaultValue: algo.memoryFootprint }) }),
    ...(algo.implementationNotes && { 
      implementationNotes: algo.implementationNotes.map((_, idx) => 
        t(`algoData.${algo.id}.implementationNotes.${idx}`, { defaultValue: algo.implementationNotes?.[idx] })
      )
    }),
    ...(algo.notes && { 
      notes: algo.notes.map((_, idx) => 
        t(`algoData.${algo.id}.notes.${idx}`, { defaultValue: algo.notes?.[idx] })
      )
    }),
  }));
}

export function getTranslatedAlgorithmDetail(id: number): AlgorithmDetail | undefined {
  return getTranslatedAlgorithmDetails().find(a => a.id === id);
}
