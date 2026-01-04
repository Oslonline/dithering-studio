export type RoutePrefetchKey =
  | "home"
  | "tool"
  | "education"
  | "educationBasics"
  | "educationPractice"
  | "explorer";

const prefetchers: Record<RoutePrefetchKey, () => Promise<unknown>> = {
  home: () => import("../pages/Home"),
  tool: () => import("../pages/DitheringTool"),
  education: () => import("../pages/Education"),
  educationBasics: () => import("../pages/education/EducationBasics"),
  educationPractice: () => import("../pages/education/EducationPractice"),
  explorer: () => import("../pages/AlgorithmExplorer"),
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
