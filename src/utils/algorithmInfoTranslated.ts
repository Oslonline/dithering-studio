import i18n from '../i18n';
import { algorithmDetails as rawAlgorithmDetails, AlgorithmDetail } from './algorithmInfo';

/**
 * Get translated algorithm details
 * This function returns algorithm details with all translatable strings converted
 * to the current language using i18n
 */
export function getTranslatedAlgorithmDetails(): AlgorithmDetail[] {
  const t = i18n.t.bind(i18n);
  
  return rawAlgorithmDetails.map(algo => ({
    ...algo,
    // Translate category
    category: t(`algoData.categories.${algo.category.toLowerCase().replace(/\s+/g, '')}`),
    // Translate overview
    overview: t(`algoData.${algo.id}.overview`),
    // Translate characteristics array
    characteristics: algo.characteristics.map((_, idx) => 
      t(`algoData.${algo.id}.characteristics.${idx}`)
    ),
    // Translate artifacts array
    artifacts: algo.artifacts.map((_, idx) => 
      t(`algoData.${algo.id}.artifacts.${idx}`)
    ),
    // Translate bestFor array
    bestFor: algo.bestFor.map((_, idx) => 
      t(`algoData.${algo.id}.bestFor.${idx}`)
    ),
    // Translate complexity
    complexity: t(`algoData.complexities.${algo.complexity.toLowerCase().replace(/[^a-z0-9]/g, '')}`),
    // Translate optional fields
    ...(algo.reference && { reference: t(`algoData.${algo.id}.reference`) }),
    ...(algo.origin && { origin: t(`algoData.origins.${algo.origin.toLowerCase().replace(/[^a-z0-9]/g, '')}`) }),
    ...(algo.neighborhood && { neighborhood: t(`algoData.${algo.id}.neighborhood`) }),
    ...(algo.tonalBias && { tonalBias: t(`algoData.${algo.id}.tonalBias`) }),
    ...(algo.noiseProfile && { noiseProfile: t(`algoData.${algo.id}.noiseProfile`) }),
    ...(algo.memoryFootprint && { memoryFootprint: t(`algoData.${algo.id}.memoryFootprint`) }),
    ...(algo.implementationNotes && { 
      implementationNotes: algo.implementationNotes.map((_, idx) => 
        t(`algoData.${algo.id}.implementationNotes.${idx}`)
      )
    }),
    ...(algo.notes && { 
      notes: algo.notes.map((_, idx) => 
        t(`algoData.${algo.id}.notes.${idx}`)
      )
    }),
  }));
}

export function getTranslatedAlgorithmDetail(id: number): AlgorithmDetail | undefined {
  return getTranslatedAlgorithmDetails().find(a => a.id === id);
}
