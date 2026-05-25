export type RoutePrefetchKey =
  | "home"
  | "tool"
  | "education"
  | "educationBasics"
  | "educationPractice"
  | "explorer";

const prefetchers: Record<RoutePrefetchKey, () => Promise<unknown>> = {
  home: () => import("../views/Home"),
  tool: () => import("../views/DitheringTool"),
  education: () => import("../views/Education"),
  educationBasics: () => import("../views/education/EducationBasics"),
  educationPractice: () => import("../views/education/EducationPractice"),
  explorer: () => import("../views/AlgorithmExplorer"),
};

export function prefetchRoute(key: RoutePrefetchKey): void {
  try {
    void prefetchers[key]?.();
  } catch {
    // best-effort prefetch
  }
}

export function prefetchEducationRoutes(): void {
  prefetchRoute("education");
  prefetchRoute("educationBasics");
  prefetchRoute("educationPractice");
  prefetchRoute("explorer");
}
