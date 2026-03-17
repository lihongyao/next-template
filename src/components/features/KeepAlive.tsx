'use client';

const cache = new Map();

export function KeepAlive({ cacheKey, children }: { cacheKey: string; children: React.ReactNode }) {
  if (!cache.has(cacheKey)) {
    cache.set(cacheKey, children);
  }

  return cache.get(cacheKey);
}
