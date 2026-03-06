'use client';

import React, { useEffect, useRef, useState } from 'react';

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
  style?: React.CSSProperties;
  onError?: (value: boolean) => void;
  onLoad?: (value: boolean) => void;
  onClick?: (e: React.MouseEvent | React.KeyboardEvent) => void;
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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(loading === 'eager');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (loading !== 'lazy' || !src || shouldLoad) return;
    const el = wrapperRef.current;
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

  // 命中缓存则直接视为已加载，避免先透明再闪一下
  useEffect(() => {
    if (!shouldLoad || !src || !imageCache.has(src)) return;
    setIsLoaded(true);
  }, [shouldLoad, src]);

  const handleLoad = () => {
    if (src) imageCache.set(src, true);
    setIsLoaded(true);
    onLoad?.(false);
  };

  const handleError = () => {
    setHasError(true);
    onError?.(true);
  };

  const realSrc = hasError ? errorSrc || DEFAULT_PLACEHOLDER_ERR : src;
  const showRealImg = shouldLoad && realSrc;

  return (
    <div
      ref={wrapperRef}
      className={cn('relative overflow-hidden', className)}
      style={{
        width: width ?? undefined,
        height: height ?? undefined,
        ...style,
      }}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onClick?.(e as React.KeyboardEvent);
      }}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {blurSrc && !isLoaded && (
        <img
          src={blurSrc}
          alt=""
          aria-hidden
          className="absolute inset-0 size-full object-cover"
          decoding="async"
        />
      )}
      {showRealImg && (
        <img
          src={realSrc}
          alt={alt ?? ''}
          sizes={sizes}
          loading={loading}
          decoding="async"
          className="absolute inset-0 size-full object-cover transition-opacity duration-100 ease-linear"
          style={{ opacity: isLoaded ? 1 : 0 }}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
}
