// src/hooks/useStableDirection.ts
import { useRef } from 'react';

export function useStableDirection(dir: string) {
  const ref = useRef(dir);
  return ref.current;
}
