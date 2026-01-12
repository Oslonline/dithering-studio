import algorithmSlugsById from '../data/algorithm-slugs.json';

const slugById: Record<string, string> = algorithmSlugsById as any;

export function getAlgorithmSlug(id: number): string | undefined {
  return slugById[String(id)];
}

export function getAlgorithmIdFromSlug(slug: string): number | undefined {
  const normalized = slug.trim().toLowerCase();
  for (const [id, s] of Object.entries(slugById)) {
    if (s === normalized) return Number(id);
  }
  return undefined;
}
