import type { TokenData } from './core';

export function serializeToken(data: TokenData): string {
  return encodeURIComponent(JSON.stringify(data));
}

export function parseToken(raw?: string | null): TokenData | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TokenData;
  } catch {
    try {
      return JSON.parse(decodeURIComponent(raw)) as TokenData;
    } catch {
      return null;
    }
  }
}
