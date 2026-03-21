'use client';

import type { MouseEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '@/libs/class-helpers';

const imageCache = new Map<string, boolean>();

type LazyImgProps = {
  src?: string;
  blurSrc?: string;
  alt?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  onClick?: (e: MouseEvent<HTMLImageElement>) => void;
};

export default function LazyImg({
  src,
  blurSrc,
  alt,
  className,
  loading = 'lazy',
  onClick,
}: LazyImgProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [shouldLoad, setShouldLoad] = useState(loading === 'eager');
  const [displaySrc, setDisplaySrc] = useState<string | undefined>(blurSrc);

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

  useEffect(() => {
    if (!shouldLoad || !src) return;

    if (imageCache.has(src)) {
      setDisplaySrc(src);
      return;
    }

    if (blurSrc) {
      setDisplaySrc(blurSrc);
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imageCache.set(src, true);
        setDisplaySrc(src);
      };
      img.onerror = () => {
        imageCache.set(src, true);
        setDisplaySrc(src);
      };
      return () => {
        img.src = '';
        img.onload = null;
        img.onerror = null;
      };
    }

    setDisplaySrc(src);
  }, [shouldLoad, src, blurSrc]);

  const isFinal = displaySrc === src;

  const handleNativeLoad = () => {
    if (src) imageCache.set(src, true);
  };

  return (
    <img
      ref={imgRef}
      src={displaySrc}
      alt={isFinal ? (alt ?? '') : ''}
      aria-hidden={!isFinal}
      loading={isFinal ? loading : undefined}
      decoding="async"
      className={cn('size-full object-cover text-xs text-red-800', className)}
      onClick={onClick}
      onLoad={isFinal ? handleNativeLoad : undefined}
    />
  );
}
