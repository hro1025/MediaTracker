type Entry = {
  value: Promise<unknown>;
  expiresAt: number;
};

const store = new Map<string, Entry>();

export function cached<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>,
  now: () => number = Date.now,
): Promise<T> {
  const hit = store.get(key);
  if (hit !== undefined && hit.expiresAt > now()) {
    return hit.value as Promise<T>;
  }

  const value = load();
  store.set(key, { value, expiresAt: now() + ttlMs });

  // A failed request must not stay cached, or the error would repeat.
  value.catch(() => {
    if (store.get(key)?.value === value) {
      store.delete(key);
    }
  });

  return value;
}

export function clearCache(): void {
  store.clear();
}
