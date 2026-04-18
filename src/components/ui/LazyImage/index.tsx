'use client';

import type { MouseEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/libs/class-helpers';

const imageCache = new Map<string, boolean>();

const TRANSPARENT_PIXEL =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

type LazyImgProps = {
  src?: string;
  placeholderSrc?: string;
  errorSrc?: string;
  alt?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onClick?: (e: MouseEvent<HTMLImageElement>) => void;
};

export default function LazyImg({
  src,
  placeholderSrc,
  errorSrc,
  alt,
  className,
  loading = 'lazy',
  onClick,
}: LazyImgProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [shouldLoad, setShouldLoad] = useState(loading === 'eager');
  const [hasError, setHasError] = useState(false);
  const [displaySrc, setDisplaySrc] = useState<string | undefined>(placeholderSrc);

  const useDefaultErrorImage = errorSrc === undefined || errorSrc === '';
  const resolvedErrorSrc = useDefaultErrorImage ? TRANSPARENT_PIXEL : errorSrc;

  const realSrc = hasError ? resolvedErrorSrc : src;

  useEffect(() => {
    setHasError(false);
  }, [src]);

  useEffect(() => {
    if (loading !== 'lazy' || !src || shouldLoad) return;
    const el = imgRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px', threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, src, shouldLoad]);

  useEffect(() => {
    if (!shouldLoad || !src) return;

    if (imageCache.has(src)) {
      setDisplaySrc(src);
      return;
    }

    if (placeholderSrc) {
      if (hasError && useDefaultErrorImage) {
        setDisplaySrc(resolvedErrorSrc);
        return;
      }
      setDisplaySrc(placeholderSrc);
      const img = new Image();
      img.src = realSrc ?? '';
      img.onload = () => {
        if (src && realSrc === src) {
          imageCache.set(src, true);
        }
        setDisplaySrc(realSrc);
      };
      img.onerror = () => {
        setHasError(true);
        setDisplaySrc(resolvedErrorSrc);
      };
      return () => {
        img.src = '';
        img.onload = null;
        img.onerror = null;
      };
    }

    setDisplaySrc(realSrc);
  }, [shouldLoad, realSrc, src, placeholderSrc, errorSrc, hasError]);

  const isErrorWithoutFallback = hasError && useDefaultErrorImage;
  const isFinal = displaySrc === realSrc && !isErrorWithoutFallback;

  const handleNativeLoad = () => {
    if (src && !hasError) imageCache.set(src, true);
  };

  const handleError = () => {
    setHasError(true);
    setDisplaySrc(resolvedErrorSrc);
  };

  return (
    <img
      ref={imgRef}
      src={displaySrc}
      alt={isFinal ? (alt ?? '') : ''}
      aria-hidden={!isFinal}
      loading={isFinal ? loading : undefined}
      decoding="async"
      className={cn(
        'size-full object-cover text-xs text-red-800',
        isErrorWithoutFallback && 'border-0 bg-transparent',
        className,
      )}
      data-src={src}
      onClick={onClick}
      onLoad={isFinal ? handleNativeLoad : undefined}
      onError={isFinal ? handleError : undefined}
    />
  );
}
