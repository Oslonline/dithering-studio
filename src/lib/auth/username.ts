export const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

/** Sanitize username input as the user types (lowercase, allowed chars only). */
export function normalizeUsernameInput(value: string): string {
  return value.replace(/[^a-zA-Z0-9_]/g, "").toLowerCase().slice(0, 20);
}

/** Normalize and validate a username for storage. Returns null if invalid. */
export function normalizeUsername(value: string): string | null {
  const normalized = value.trim().toLowerCase();
  if (!USERNAME_REGEX.test(normalized)) return null;
  return normalized;
}
