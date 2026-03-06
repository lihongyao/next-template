'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/libs/class-helpers';

interface ProgressiveImageProps {
  className?: string;
  src: string;
  blurSrc: string;
  alt: string;
}

const imageCache = new Map<string, boolean>();

export default function ProgressiveImage({ className, src, blurSrc, alt }: ProgressiveImageProps) {
  const cachedSrc = imageCache.has(src);

  const [renderSrc, setRenderSrc] = useState(cachedSrc ? src : blurSrc);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!src || cachedSrc) {
      return;
    }

    const img = new Image();
    img.src = src;
    img.onload = () => {
      imageCache.set(src, true);
      setRenderSrc(src);
    };
  }, [src, cachedSrc]);

  return (
    <div data-name="ProgressiveImage" className={cn('h-full w-full', !loaded && 'bg-gray-0')}>
      <img
        className={cn('h-full w-full object-cover', className)}
        src={renderSrc}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
}
