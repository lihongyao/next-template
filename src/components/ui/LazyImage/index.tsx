'use client';

import type { CSSProperties, KeyboardEvent, MouseEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/libs/class-helpers';

const imageCache = new Map<string, boolean>();

const DEFAULT_PLACEHOLDER_ERR =
  'data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQImWNgYGBgAAAABQABh6FO1AAAAABJRU5ErkJggg==';

type LazyImgProps = {
  src?: string;
  blurSrc?: string;
  errorSrc?: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  style?: CSSProperties;
  onError?: (value: boolean) => void;
  onLoad?: (value: boolean) => void;
  onClick?: (e: MouseEvent<HTMLImageElement> | KeyboardEvent<HTMLImageElement>) => void;
};

export default function LazyImg({
  src,
  blurSrc,
  errorSrc,
  alt,
  className,
  width,
  height,
  loading = 'lazy',
  sizes,
  style,
  onError,
  onLoad,
  onClick,
}: LazyImgProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [shouldLoad, setShouldLoad] = useState(loading === 'eager');
  const [hasError, setHasError] = useState(false);
  const [displaySrc, setDisplaySrc] = useState<string | undefined>(blurSrc ?? undefined);

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
      { rootMargin: '50px', threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loading, src, shouldLoad]);

  const realSrc = hasError ? errorSrc || DEFAULT_PLACEHOLDER_ERR : src;

  useEffect(() => {
    if (!shouldLoad || !realSrc) return;

    if (imageCache.has(src ?? '')) {
      setDisplaySrc(realSrc);
      return;
    }

    if (blurSrc) {
      setDisplaySrc(blurSrc);
      const img = new Image();
      img.src = realSrc;
      img.onload = () => {
        if (src) imageCache.set(src, true);
        setDisplaySrc(realSrc);
        onLoad?.(false);
      };
      img.onerror = () => {
        setHasError(true);
        onError?.(true);
        setDisplaySrc(errorSrc || DEFAULT_PLACEHOLDER_ERR);
      };
      return () => {
        img.src = '';
        img.onload = null;
        img.onerror = null;
      };
    }

    setDisplaySrc(realSrc);
  }, [shouldLoad, realSrc, src, blurSrc, errorSrc, onLoad, onError]);

  const handleLoad = () => {
    if (src) imageCache.set(src, true);
    onLoad?.(false);
  };

  const handleError = () => {
    setHasError(true);
    onError?.(true);
    setDisplaySrc(errorSrc || DEFAULT_PLACEHOLDER_ERR);
  };

  const isRealSrc = displaySrc === realSrc;
  // if (!shouldLoad) return <div ref={imgRef} className="h-full w-full" />;
  return (
    <img
      ref={imgRef}
      src={displaySrc ?? DEFAULT_PLACEHOLDER_ERR}
      alt={isRealSrc ? (alt ?? '') : ''}
      aria-hidden={!isRealSrc}
      width={width}
      height={height}
      sizes={isRealSrc ? sizes : undefined}
      loading={isRealSrc ? loading : undefined}
      decoding="async"
      className={cn('size-full object-cover', className)}
      style={style}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') onClick(e as KeyboardEvent<HTMLImageElement>);
            }
          : undefined
      }
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onLoad={isRealSrc ? handleLoad : undefined}
      onError={isRealSrc ? handleError : undefined}
    />
  );
}
