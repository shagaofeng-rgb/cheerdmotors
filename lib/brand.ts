export const BRAND_NAME = "COWIN";

const LEGACY_BRAND_PATTERN = /CHEERD[\s-]*MOTO(?:RS?)?/gi;

export function rebrandLegacyText(value: string) {
  return value.replace(LEGACY_BRAND_PATTERN, BRAND_NAME);
}
