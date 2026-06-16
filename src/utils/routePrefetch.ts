export type RoutePrefetchKey = "home" | "tool" | "education" | "explorer";

const prefetchers: Record<RoutePrefetchKey, () => Promise<unknown>> = {
  home: () => import("../views/Home"),
  tool: () => import("../views/DitheringTool"),
  education: () => import("../views/Education"),
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
  prefetchRoute("explorer");
}
