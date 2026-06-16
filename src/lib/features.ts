const envFlag = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value == null) return defaultValue;
  return value === "1" || value.toLowerCase() === "true";
};

export const features = {
  accounts: envFlag(process.env.NEXT_PUBLIC_ENABLE_ACCOUNTS, true),
  gallery: envFlag(process.env.NEXT_PUBLIC_ENABLE_GALLERY, false),
} as const;

export type FeatureKey = keyof typeof features;
