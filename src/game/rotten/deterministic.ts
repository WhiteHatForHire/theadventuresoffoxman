export function hashDeterministicText(value: string): number {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }

  return hash;
}

function createScopedGenerator(seed: string, scope: string): () => number {
  let state = hashDeterministicText(`${seed}::${scope}`) || 0x9e3779b9;

  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return state >>> 0;
  };
}

export function scopedDeterministicOrder<T>(
  values: readonly T[],
  seed: string,
  scope: string,
): T[] {
  const ordered = [...values];
  const next = createScopedGenerator(seed, scope);

  for (let index = ordered.length - 1; index > 0; index -= 1) {
    const swapIndex = next() % (index + 1);
    [ordered[index], ordered[swapIndex]] = [ordered[swapIndex], ordered[index]];
  }

  return ordered;
}
