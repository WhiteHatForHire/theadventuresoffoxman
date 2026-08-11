export const ROTTEN_DEFAULT_SEED = "ROTTEN-DEFAULT";
export const ROTTEN_SEED_MAX_LENGTH = 32;

export function normalizeRottenSeed(input: unknown): string {
  if (typeof input !== "string") {
    return ROTTEN_DEFAULT_SEED;
  }

  const normalized = input
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, ROTTEN_SEED_MAX_LENGTH)
    .replace(/-+$/g, "");

  return normalized || ROTTEN_DEFAULT_SEED;
}
