import { normalizeLang, withLangPrefix } from "../../utils/localePath";
import { findAlgorithm, isAsciiAlgorithm } from "../../utils/algorithms";
import { findPalette } from "../../utils/palettes";
import type { GallerySettingsV1, ProfileSocialLinks } from "./types";

export interface GallerySettingsSummaryEntry {
  label: string;
  value: string;
}

export interface ToolSettingsSnapshot {
  pattern: number;
  threshold: number;
  workingResolution: number;
  contrast: number;
  midtones: number;
  highlights: number;
  blurRadius: number;
  paletteId: string | null;
  customPalette: [number, number, number][] | null;
  invert: boolean;
  serpentine: boolean;
  asciiRamp: string;
  videoMode: boolean;
}

export function snapshotFromToolState(state: ToolSettingsSnapshot): GallerySettingsV1 {
  return {
    version: 1,
    pattern: state.pattern,
    threshold: state.threshold,
    workingResolution: state.workingResolution,
    contrast: state.contrast,
    midtones: state.midtones,
    highlights: state.highlights,
    blurRadius: state.blurRadius,
    paletteId: state.paletteId,
    customPalette: state.customPalette,
    invert: state.invert,
    serpentine: state.serpentine,
    asciiRamp: isAsciiAlgorithm(state.pattern) ? state.asciiRamp : "",
    mode: state.videoMode ? "video" : "image",
  };
}

function formatPaletteLabel(settings: GallerySettingsV1): string {
  if (!settings.paletteId) return "None (grayscale)";
  if (settings.paletteId === "__custom") {
    const count = settings.customPalette?.length ?? 0;
    return count ? `Custom (${count} colors)` : "Custom palette";
  }
  return findPalette(settings.paletteId)?.name ?? settings.paletteId;
}

function formatOnOff(value: boolean): string {
  return value ? "On" : "Off";
}

export function formatGallerySettingsSummary(settings: GallerySettingsV1): GallerySettingsSummaryEntry[] {
  const algorithm = findAlgorithm(settings.pattern);
  const entries: GallerySettingsSummaryEntry[] = [
    { label: "Algorithm", value: algorithm?.name ?? `Pattern ${settings.pattern}` },
    { label: "Mode", value: settings.mode === "video" ? "Video" : "Image" },
    { label: "Resolution", value: `${settings.workingResolution}px` },
    { label: "Threshold", value: String(settings.threshold) },
    { label: "Contrast", value: String(settings.contrast) },
    { label: "Midtones", value: String(settings.midtones) },
    { label: "Highlights", value: String(settings.highlights) },
    { label: "Blur", value: settings.blurRadius ? `${settings.blurRadius}px` : "Off" },
    { label: "Palette", value: formatPaletteLabel(settings) },
    { label: "Invert", value: formatOnOff(settings.invert) },
    { label: "Serpentine", value: formatOnOff(settings.serpentine) },
  ];

  if (isAsciiAlgorithm(settings.pattern) && settings.asciiRamp.trim().length >= 2) {
    entries.push({ label: "ASCII ramp", value: settings.asciiRamp.trim() });
  }

  return entries;
}

export function galleryToolBasePath(settings: Pick<GallerySettingsV1, "mode">, lang: string): string {
  const normalizedLang = normalizeLang(lang);
  return settings.mode === "video"
    ? withLangPrefix("/Dithering/Video", normalizedLang)
    : withLangPrefix("/Dithering/Image", normalizedLang);
}

export function buildToolUrlFromSettings(settings: GallerySettingsV1, lang: string): string {
  const normalizedLang = normalizeLang(lang);
  const basePath = galleryToolBasePath(settings, normalizedLang);

  const params = new URLSearchParams();
  if (settings.pattern) params.set("p", String(settings.pattern));
  params.set("t", String(settings.threshold));
  params.set("r", String(settings.workingResolution));
  params.set("inv", settings.invert ? "1" : "0");
  params.set("ser", settings.serpentine ? "1" : "0");

  if (settings.paletteId) {
    params.set("pal", settings.paletteId);
    if (settings.paletteId === "__custom" && settings.customPalette?.length) {
      const cols = settings.customPalette.map(([r, g, b]) => `${r}.${g}.${b}`).join("-");
      params.set("cols", cols);
    }
  }

  if (settings.contrast) params.set("c", String(settings.contrast));
  if (settings.midtones && settings.midtones !== 1) params.set("g", String(settings.midtones));
  if (settings.highlights) params.set("h", String(settings.highlights));
  if (settings.blurRadius) params.set("b", String(settings.blurRadius));
  if (isAsciiAlgorithm(settings.pattern) && settings.asciiRamp.trim().length >= 2) {
    params.set("ramp", encodeURIComponent(settings.asciiRamp.slice(0, 64)));
  }
  if (settings.mode === "video") params.set("mode", "video");

  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function getGalleryPreviewPublicUrl(supabaseUrl: string, previewPath: string): string {
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/gallery-previews/${previewPath}`;
}

export function getAvatarPublicUrl(supabaseUrl: string, avatarPath: string): string {
  const base = supabaseUrl.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/avatars/${avatarPath}`;
}

export function resolveProfileLinks(raw: unknown): ProfileSocialLinks {
  if (!raw || typeof raw !== "object") return {};
  const obj = raw as Record<string, unknown>;
  const pick = (key: keyof ProfileSocialLinks) =>
    typeof obj[key] === "string" ? (obj[key] as string) : undefined;
  return { x: pick("x"), figma: pick("figma"), cosmos: pick("cosmos") };
}
