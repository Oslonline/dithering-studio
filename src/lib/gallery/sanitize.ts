const URL_PATTERNS = [
  /https?:\/\/[^\s]+/gi,
  /www\.[^\s]+/gi,
  /\b[a-z0-9-]+(?:\.[a-z0-9-]+)+\b(?:\/[^\s]*)?/gi,
  /[\u200B-\u200D\uFEFF]/g,
];

const PROMO_KEYWORDS = /\b(buy|sale|discount|promo|coupon|dm me|follow me|subscribe|onlyfans|crypto|nft)\b/i;

export const GALLERY_DESCRIPTION_MAX = 85;

export function sanitizeGalleryDescription(raw: string): string {
  let text = raw.normalize("NFKC").trim().slice(0, GALLERY_DESCRIPTION_MAX);
  for (const pattern of URL_PATTERNS) {
    text = text.replace(pattern, "[link]");
  }
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

export function isGalleryDescriptionAllowed(raw: string): { ok: boolean; reason?: string } {
  const sanitized = sanitizeGalleryDescription(raw);
  if (!sanitized) {
    return { ok: true };
  }
  const linkTokens = (sanitized.match(/\[link\]/g) ?? []).length;
  if (linkTokens >= 2) {
    return { ok: false, reason: "Descriptions cannot contain multiple links." };
  }
  if (linkTokens === 1 && sanitized.replace(/\[link\]/g, "").trim().length < 8) {
    return { ok: false, reason: "Descriptions cannot be mostly links or promotions." };
  }
  if (PROMO_KEYWORDS.test(sanitized)) {
    return { ok: false, reason: "Promotional content is not allowed in descriptions." };
  }
  return { ok: true };
}
